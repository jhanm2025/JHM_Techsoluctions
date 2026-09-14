from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..facturas_pdf import generar_pdf_factura
from ..models import DetalleFactura, DetalleVenta, Factura, Producto, Servicio, Usuario, Venta
from ..reportes_utils import generar_excel_reporte, generar_pdf_reporte
from ..schemas import VentaCreate, VentaEstadoUpdate, VentaResponse

router = APIRouter(prefix="/ventas", tags=["Ventas"])


def _generar_numero(db: Session, modelo, prefijo: str) -> str:
    # Se calcula a partir del conteo total + 1 para simplicidad y evitar
    # colisiones cuando se elimina el último registro.
    total = db.query(modelo).count()
    return f"{prefijo}-{total + 1:06d}"


def _resolver_items(db: Session, items):
    """Valida los ítems (producto/servicio) y calcula precios y subtotal."""
    detalles_data = []
    subtotal = 0.0
    for item in items:
        if item.tipo == "producto":
            producto = db.query(Producto).filter(Producto.id_producto == item.id_item).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item.id_item} no encontrado")
            precio_unitario = float(producto.precio)
            descripcion = item.descripcion or producto.nombre
            id_producto, id_servicio = producto.id_producto, None
        else:
            servicio = db.query(Servicio).filter(Servicio.id_servicio == item.id_item).first()
            if not servicio:
                raise HTTPException(status_code=404, detail=f"Servicio {item.id_item} no encontrado")
            precio_unitario = float(servicio.precio_minimo)
            descripcion = item.descripcion or servicio.nombre
            id_producto, id_servicio = None, servicio.id_servicio

        subtotal_item = round(precio_unitario * item.cantidad, 2)
        subtotal += subtotal_item
        detalles_data.append({
            "id_producto": id_producto,
            "id_servicio": id_servicio,
            "descripcion": descripcion,
            "cantidad": item.cantidad,
            "precio_unitario": precio_unitario,
            "subtotal": subtotal_item,
        })
    return detalles_data, round(subtotal, 2)


@router.post(
    "/",
    response_model=VentaResponse,
    status_code=201,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def registrar_venta(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """
    Registra una venta (con su detalle) y, opcionalmente, genera de forma
    automática la factura correspondiente a esa operación comercial.
    """
    cliente = db.query(Usuario).filter(Usuario.id_usuario == datos.id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    detalles_data, subtotal = _resolver_items(db, datos.items)

    descuento_valor = subtotal * float(datos.descuento_porcentaje) / 100
    base_gravable = subtotal - descuento_valor
    iva_valor = base_gravable * float(datos.impuesto_porcentaje) / 100
    total = round(base_gravable + iva_valor, 2)

    numero_venta = _generar_numero(db, Venta, "VTA")

    venta = Venta(
        numero_venta=numero_venta,
        id_cliente=cliente.id_usuario,
        id_usuario_vendedor=usuario_actual.id_usuario,
        subtotal=subtotal,
        descuento_porcentaje=datos.descuento_porcentaje,
        impuesto_porcentaje=datos.impuesto_porcentaje,
        total=total,
        estado="completada",
        observaciones=datos.observaciones,
        detalles=[DetalleVenta(**d) for d in detalles_data],
    )
    db.add(venta)
    db.commit()
    db.refresh(venta)

    if datos.generar_factura:
        numero_factura = _generar_numero(db, Factura, "FAC")
        factura = Factura(
            numero_factura=numero_factura,
            id_venta=venta.id_venta,
            id_cliente=cliente.id_usuario,
            id_usuario_emisor=usuario_actual.id_usuario,
            subtotal=subtotal,
            descuento_porcentaje=datos.descuento_porcentaje,
            impuesto_porcentaje=datos.impuesto_porcentaje,
            total=total,
            observaciones=datos.observaciones,
            detalles=[
                DetalleFactura(
                    id_producto=d["id_producto"], id_servicio=d["id_servicio"],
                    descripcion=d["descripcion"], cantidad=d["cantidad"],
                    precio_unitario=d["precio_unitario"], subtotal=d["subtotal"],
                )
                for d in detalles_data
            ],
        )
        db.add(factura)
        db.commit()
        db.refresh(venta)

    return venta


@router.get("/", response_model=list[VentaResponse])
def listar_ventas(
    id_cliente: int | None = None,
    estado: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    buscar: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """Historial de ventas con filtros por fecha, cliente, estado y texto."""
    query = db.query(Venta).options(joinedload(Venta.detalles), joinedload(Venta.factura))

    rol_actual = usuario_actual.rol.nombre if usuario_actual.rol else None
    if rol_actual not in ("admin", "empleado"):
        query = query.filter(Venta.id_cliente == usuario_actual.id_usuario)
    elif id_cliente is not None:
        query = query.filter(Venta.id_cliente == id_cliente)

    if estado:
        query = query.filter(Venta.estado == estado)
    if fecha_desde:
        query = query.filter(Venta.fecha_venta >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Venta.fecha_venta <= datetime.combine(fecha_hasta, datetime.max.time()))
    if buscar:
        query = query.join(DetalleVenta).filter(
            or_(
                Venta.numero_venta.ilike(f"%{buscar}%"),
                DetalleVenta.descripcion.ilike(f"%{buscar}%"),
            )
        ).distinct()

    return query.order_by(Venta.fecha_venta.desc()).all()


def _obtener_venta_autorizada(id_venta: int, db: Session, usuario_actual: Usuario) -> Venta:
    venta = (
        db.query(Venta)
        .options(joinedload(Venta.detalles), joinedload(Venta.factura))
        .filter(Venta.id_venta == id_venta)
        .first()
    )
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    rol_actual = usuario_actual.rol.nombre if usuario_actual.rol else None
    if rol_actual not in ("admin", "empleado") and venta.id_cliente != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta venta")
    return venta


@router.get("/{id_venta}", response_model=VentaResponse)
def obtener_venta(
    id_venta: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(get_current_user)
):
    return _obtener_venta_autorizada(id_venta, db, usuario_actual)


@router.patch(
    "/{id_venta}/estado",
    response_model=VentaResponse,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def cambiar_estado_venta(id_venta: int, cambios: VentaEstadoUpdate, db: Session = Depends(get_db)):
    venta = db.query(Venta).filter(Venta.id_venta == id_venta).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    venta.estado = cambios.estado
    db.commit()
    db.refresh(venta)
    return venta


@router.get(
    "/{id_venta}/factura/pdf",
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def descargar_factura_de_venta(id_venta: int, db: Session = Depends(get_db)):
    """Atajo para descargar directamente la factura generada por una venta."""
    venta = db.query(Venta).options(joinedload(Venta.factura)).filter(Venta.id_venta == id_venta).first()
    if not venta or not venta.factura:
        raise HTTPException(status_code=404, detail="Esta venta no tiene una factura asociada")

    factura = (
        db.query(Factura)
        .options(joinedload(Factura.detalles), joinedload(Factura.cliente), joinedload(Factura.usuario_emisor))
        .filter(Factura.id_factura == venta.factura.id_factura)
        .first()
    )
    pdf_buffer = generar_pdf_factura(factura)
    return Response(
        content=pdf_buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{factura.numero_factura}.pdf"'},
    )


# ---------------------------------------------------------------------------
# REPORTE DIARIO DE VENTAS
# ---------------------------------------------------------------------------

def _consultar_ventas_reporte(db: Session, fecha_desde: date | None, fecha_hasta: date | None, estado: str | None):
    query = db.query(Venta).options(joinedload(Venta.detalles), joinedload(Venta.cliente))
    if fecha_desde:
        query = query.filter(Venta.fecha_venta >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Venta.fecha_venta <= datetime.combine(fecha_hasta, datetime.max.time()))
    if estado:
        query = query.filter(Venta.estado == estado)
    return query.order_by(Venta.fecha_venta.desc()).all()


@router.get("/reporte/diario", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_diario_ventas(fecha: date | None = None, db: Session = Depends(get_db)):
    """Reporte diario de ventas (JSON) para una fecha determinada (hoy por defecto)."""
    fecha = fecha or date.today()
    ventas = _consultar_ventas_reporte(db, fecha, fecha, None)
    total_dia = sum(float(v.total) for v in ventas if v.estado != "anulada")
    return {
        "fecha": fecha.isoformat(),
        "numero_ventas": len(ventas),
        "total_dia": round(total_dia, 2),
        "ventas": [
            {
                "numero_venta": v.numero_venta,
                "cliente": f"{v.cliente.nombres} {v.cliente.apellidos}",
                "items": [d.descripcion for d in v.detalles],
                "cantidad_items": sum(d.cantidad for d in v.detalles),
                "total": float(v.total),
                "estado": v.estado,
            }
            for v in ventas
        ],
    }


def _filas_reporte_ventas(ventas):
    headers = ["N° Venta", "Fecha", "Cliente", "Productos/Servicios", "Cant.", "Subtotal", "IVA", "Total", "Estado"]
    filas = []
    for v in ventas:
        descuento_valor = float(v.subtotal) * float(v.descuento_porcentaje) / 100
        base = float(v.subtotal) - descuento_valor
        iva_valor = base * float(v.impuesto_porcentaje) / 100
        filas.append([
            v.numero_venta,
            v.fecha_venta.strftime("%d/%m/%Y %H:%M"),
            f"{v.cliente.nombres} {v.cliente.apellidos}",
            ", ".join(d.descripcion for d in v.detalles),
            sum(d.cantidad for d in v.detalles),
            f"${float(v.subtotal):,.2f}",
            f"${iva_valor:,.2f}",
            f"${float(v.total):,.2f}",
            v.estado,
        ])
    return headers, filas


@router.get("/reporte/pdf", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_ventas_pdf(
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    fecha_desde = fecha_desde or date.today()
    fecha_hasta = fecha_hasta or date.today()
    ventas = _consultar_ventas_reporte(db, fecha_desde, fecha_hasta, estado)
    headers, filas = _filas_reporte_ventas(ventas)
    total_general = sum(float(v.total) for v in ventas if v.estado != "anulada")
    buffer = generar_pdf_reporte(
        "Reporte de Ventas", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
        fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
        totales=[["TOTAL GENERAL", f"${total_general:,.2f}"]],
    )
    return Response(
        content=buffer.read(), media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="reporte_ventas.pdf"'},
    )


@router.get("/reporte/excel", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_ventas_excel(
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    fecha_desde = fecha_desde or date.today()
    fecha_hasta = fecha_hasta or date.today()
    ventas = _consultar_ventas_reporte(db, fecha_desde, fecha_hasta, estado)
    headers, filas = _filas_reporte_ventas(ventas)
    buffer = generar_excel_reporte(
        "Ventas", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
        fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
    )
    return Response(
        content=buffer.read(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="reporte_ventas.xlsx"'},
    )
