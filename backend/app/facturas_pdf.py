"""Generación de facturas en PDF usando reportlab."""

import os
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .models import Factura

EMPRESA_NOMBRE = "JHM Tech Solutions"
EMPRESA_NIT = "NIT 900.000.000-1"
EMPRESA_DIRECCION = "Medellín, Antioquia, Colombia"
COLOR_PRIMARIO = colors.HexColor("#1d4ed8")
RUTA_LOGO = os.path.join(os.path.dirname(__file__), "static", "logo.png")


def generar_pdf_factura(factura: Factura) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
    )
    estilos = getSampleStyleSheet()
    elementos = []

    # ---- Encabezado con logo ----
    if os.path.exists(RUTA_LOGO):
        info_empresa = Paragraph(
            f"<b>{EMPRESA_NOMBRE}</b><br/>{EMPRESA_NIT}<br/>{EMPRESA_DIRECCION}",
            estilos["Normal"],
        )
        encabezado = Table(
            [[Image(RUTA_LOGO, width=2.6 * cm, height=2.2 * cm), info_empresa]],
            colWidths=[3 * cm, 14 * cm],
        )
        encabezado.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
        elementos.append(encabezado)
    else:
        elementos.append(Paragraph(EMPRESA_NOMBRE, estilos["Heading1"]))
        elementos.append(Paragraph(EMPRESA_NIT, estilos["Normal"]))
        elementos.append(Paragraph(EMPRESA_DIRECCION, estilos["Normal"]))

    elementos.append(Spacer(1, 0.4 * cm))
    elementos.append(Paragraph(f"FACTURA N° {factura.numero_factura}", estilos["Heading2"]))
    elementos.append(
        Paragraph(
            f"Fecha de emisión: {factura.fecha_emision.strftime('%d/%m/%Y %H:%M')}",
            estilos["Normal"],
        )
    )
    elementos.append(Paragraph(f"Estado: {factura.estado.upper()}", estilos["Normal"]))
    if factura.usuario_emisor:
        elementos.append(
            Paragraph(
                f"Atendido por: {factura.usuario_emisor.nombres} {factura.usuario_emisor.apellidos}",
                estilos["Normal"],
            )
        )
    elementos.append(Spacer(1, 0.4 * cm))

    # ---- Datos del cliente ----
    cliente = factura.cliente
    elementos.append(Paragraph("Datos del cliente", estilos["Heading3"]))
    elementos.append(
        Paragraph(f"Nombre: {cliente.nombres} {cliente.apellidos}", estilos["Normal"])
    )
    elementos.append(
        Paragraph(f"Documento: {cliente.tipo_documento} {cliente.numero_documento}", estilos["Normal"])
    )
    elementos.append(Paragraph(f"Correo: {cliente.email}", estilos["Normal"]))
    if cliente.telefono:
        elementos.append(Paragraph(f"Teléfono: {cliente.telefono}", estilos["Normal"]))
    elementos.append(Spacer(1, 0.5 * cm))

    # ---- Detalle de ítems ----
    headers = ["Descripción", "Cantidad", "Precio unitario", "Subtotal"]
    filas = [headers]
    for detalle in factura.detalles:
        filas.append(
            [
                detalle.descripcion,
                str(detalle.cantidad),
                f"${float(detalle.precio_unitario):,.2f}",
                f"${float(detalle.subtotal):,.2f}",
            ]
        )

    tabla = Table(filas, colWidths=[8 * cm, 2.5 * cm, 3.5 * cm, 3.5 * cm], repeatRows=1)
    tabla.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_PRIMARIO),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
            ]
        )
    )
    elementos.append(tabla)
    elementos.append(Spacer(1, 0.5 * cm))

    # ---- Totales ----
    subtotal = float(factura.subtotal)
    descuento_valor = subtotal * float(factura.descuento_porcentaje) / 100
    base_impuesto = subtotal - descuento_valor
    impuesto_valor = base_impuesto * float(factura.impuesto_porcentaje) / 100

    totales = [
        ["Subtotal", f"${subtotal:,.2f}"],
        [f"Descuento ({float(factura.descuento_porcentaje):.0f}%)", f"-${descuento_valor:,.2f}"],
        [f"Impuesto ({float(factura.impuesto_porcentaje):.0f}%)", f"${impuesto_valor:,.2f}"],
        ["TOTAL", f"${float(factura.total):,.2f}"],
    ]
    tabla_totales = Table(totales, colWidths=[13.5 * cm, 4 * cm])
    tabla_totales.setStyle(
        TableStyle(
            [
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    elementos.append(tabla_totales)

    if factura.observaciones:
        elementos.append(Spacer(1, 0.6 * cm))
        elementos.append(Paragraph("Observaciones", estilos["Heading3"]))
        elementos.append(Paragraph(factura.observaciones, estilos["Normal"]))

    elementos.append(Spacer(1, 1 * cm))
    elementos.append(
        Paragraph(
            "Gracias por confiar en JHM Tech Solutions.",
            estilos["Italic"],
        )
    )

    doc.build(elementos)
    buffer.seek(0)
    return buffer
