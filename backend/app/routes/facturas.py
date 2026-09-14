from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..facturas_pdf import generar_pdf_factura
from ..models import DetalleFactura, Factura, Producto, Servicio, Usuario
from ..reportes_utils import generar_excel_reporte
from ..schemas import FacturaCreate, FacturaResponse, FacturaUpdateEstado

router = APIRouter(prefix="/facturas", tags=["Facturación"])


def _generar_numero_factura(db: Session) -> str:
    ultima = db.query(Factura).order_by(Factura.id_factura.desc()).first()
    siguiente = (ultima.id_factura + 1) if ultima else 1
    return f"FAC-{siguiente:06d}"


@router.post(
    "/",
    response_model=FacturaResponse,
    status_code=201,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def crear_factura(
    datos: FacturaCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    cliente = db.query(Usuario).filter(Usuario.id_usuario == datos.id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    detalles = []
    subtotal = 0
    for item in datos.items:
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
        detalles.append(
            DetalleFactura(
                id_producto=id_producto,
                id_servicio=id_servicio,
                descripcion=descripcion,
                cantidad=item.cantidad,
                precio_unitario=precio_unitario,
                subtotal=subtotal_item,
            )
        )

    descuento_valor = subtotal * float(datos.descuento_porcentaje) / 100
    base_impuesto = subtotal - descuento_valor
    impuesto_valor = base_impuesto * float(datos.impuesto_porcentaje) / 100
    total = round(base_impuesto + impuesto_valor, 2)

    factura = Factura(
        numero_factura=_generar_numero_factura(db),
        id_cliente=cliente.id_usuario,
        id_usuario_emisor=usuario_actual.id_usuario,
        subtotal=round(subtotal, 2),
        descuento_porcentaje=datos.descuento_porcentaje,
        impuesto_porcentaje=datos.impuesto_porcentaje,
        total=total,
        observaciones=datos.observaciones,
        detalles=detalles,
    )
    db.add(factura)
    db.commit()
    db.refresh(factura)
    return factura


@router.get("/", response_model=list[FacturaResponse])
def listar_facturas(
    estado: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    query = db.query(Factura).options(joinedload(Factura.detalles))

    # Un cliente solo puede ver sus propias facturas.
    rol_actual = usuario_actual.rol.nombre if usuario_actual.rol else None
    if rol_actual not in ("admin", "empleado"):
        query = query.filter(Factura.id_cliente == usuario_actual.id_usuario)

    if estado:
        query = query.filter(Factura.estado == estado)
    if fecha_desde:
        query = query.filter(Factura.fecha_emision >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Factura.fecha_emision <= datetime.combine(fecha_hasta, datetime.max.time()))

    return query.order_by(Factura.fecha_emision.desc()).all()


def _obtener_factura_autorizada(id_factura: int, db: Session, usuario_actual: Usuario) -> Factura:
    factura = (
        db.query(Factura)
        .options(joinedload(Factura.detalles), joinedload(Factura.cliente), joinedload(Factura.usuario_emisor))
        .filter(Factura.id_factura == id_factura)
        .first()
    )
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    rol_actual = usuario_actual.rol.nombre if usuario_actual.rol else None
    if rol_actual not in ("admin", "empleado") and factura.id_cliente != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta factura")

    return factura


@router.get("/{id_factura}", response_model=FacturaResponse)
def obtener_factura(
    id_factura: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    return _obtener_factura_autorizada(id_factura, db, usuario_actual)


@router.get("/{id_factura}/pdf")
def descargar_factura_pdf(
    id_factura: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    factura = _obtener_factura_autorizada(id_factura, db, usuario_actual)
    pdf_buffer = generar_pdf_factura(factura)
    return Response(
        content=pdf_buffer.read(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{factura.numero_factura}.pdf"'
        },
    )


@router.patch(
    "/{id_factura}/estado",
    response_model=FacturaResponse,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def cambiar_estado_factura(
    id_factura: int, cambios: FacturaUpdateEstado, db: Session = Depends(get_db)
):
    factura = db.query(Factura).filter(Factura.id_factura == id_factura).first()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    factura.estado = cambios.estado
    db.commit()
    db.refresh(factura)
    return factura


@router.get(
    "/exportar/excel",
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def exportar_facturas_excel(
    estado: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    query = db.query(Factura).options(joinedload(Factura.cliente))
    if estado:
        query = query.filter(Factura.estado == estado)
    if fecha_desde:
        query = query.filter(Factura.fecha_emision >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Factura.fecha_emision <= datetime.combine(fecha_hasta, datetime.max.time()))

    facturas = query.order_by(Factura.fecha_emision.desc()).all()

    headers = [
        "N° Factura", "Cliente", "Correo", "Fecha", "Subtotal",
        "Descuento %", "Valor descuento", "IVA %", "Valor IVA", "Total", "Estado",
    ]
    filas = []
    for f in facturas:
        subtotal = float(f.subtotal)
        valor_descuento = subtotal * float(f.descuento_porcentaje) / 100
        base_gravable = subtotal - valor_descuento
        valor_iva = base_gravable * float(f.impuesto_porcentaje) / 100
        filas.append([
            f.numero_factura,
            f"{f.cliente.nombres} {f.cliente.apellidos}",
            f.cliente.email,
            f.fecha_emision.strftime("%d/%m/%Y %H:%M"),
            round(subtotal, 2),
            float(f.descuento_porcentaje),
            round(valor_descuento, 2),
            float(f.impuesto_porcentaje),
            round(valor_iva, 2),
            float(f.total),
            f.estado,
        ])

    buffer = generar_excel_reporte(
        "Facturas", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
        fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
    )
    return Response(
        content=buffer.read(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="reporte_facturas.xlsx"'},
    )
