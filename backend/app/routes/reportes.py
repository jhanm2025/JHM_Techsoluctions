from collections import defaultdict
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..models import DetalleFactura, DetalleVenta, Factura, Pqr, Producto, Rol, Servicio, Usuario, Venta
from ..reportes_utils import generar_excel_reporte, generar_pdf_reporte
from ..utils import IVA_PORCENTAJE_COLOMBIA, calcular_iva

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def _respuesta_pdf(buffer, nombre_archivo: str) -> Response:
    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{nombre_archivo}.pdf"'},
    )


def _respuesta_excel(buffer, nombre_archivo: str) -> Response:
    return Response(
        content=buffer.read(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{nombre_archivo}.xlsx"'},
    )


# ---------------------------------------------------------------------------
# REPORTE DE USUARIOS (solo admin)
# ---------------------------------------------------------------------------

def _consultar_usuarios(db: Session, id_rol: int | None, estado: str | None):
    query = db.query(Usuario).options(joinedload(Usuario.rol))
    if id_rol is not None:
        query = query.filter(Usuario.id_rol == id_rol)
    if estado:
        query = query.filter(Usuario.estado == estado)
    return query.order_by(Usuario.fecha_registro.desc()).all()


def _filas_usuarios(usuarios):
    headers = ["Nombres", "Apellidos", "Correo", "Documento", "Rol", "Estado", "Fecha registro"]
    filas = [
        [
            u.nombres,
            u.apellidos,
            u.email,
            f"{u.tipo_documento} {u.numero_documento}",
            u.rol.nombre if u.rol else "",
            u.estado,
            u.fecha_registro.strftime("%d/%m/%Y") if u.fecha_registro else "",
        ]
        for u in usuarios
    ]
    return headers, filas


@router.get("/usuarios/pdf", dependencies=[Depends(require_roles("admin"))])
def reporte_usuarios_pdf(
    id_rol: int | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    usuarios = _consultar_usuarios(db, id_rol, estado)
    headers, filas = _filas_usuarios(usuarios)
    buffer = generar_pdf_reporte(
        "Reporte de Usuarios", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_pdf(buffer, "reporte_usuarios")


@router.get("/usuarios/excel", dependencies=[Depends(require_roles("admin"))])
def reporte_usuarios_excel(
    id_rol: int | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    usuarios = _consultar_usuarios(db, id_rol, estado)
    headers, filas = _filas_usuarios(usuarios)
    buffer = generar_excel_reporte(
        "Usuarios", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_excel(buffer, "reporte_usuarios")


# ---------------------------------------------------------------------------
# REPORTE DE EMPLEADOS (solo admin)
# ---------------------------------------------------------------------------

def _consultar_empleados(db: Session, estado: str | None):
    query = db.query(Usuario).join(Rol).filter(Rol.nombre == "empleado")
    if estado:
        query = query.filter(Usuario.estado == estado)
    return query.order_by(Usuario.fecha_registro.desc()).all()


@router.get("/empleados/pdf", dependencies=[Depends(require_roles("admin"))])
def reporte_empleados_pdf(
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    empleados = _consultar_empleados(db, estado)
    headers, filas = _filas_usuarios(empleados)
    buffer = generar_pdf_reporte(
        "Reporte de Empleados", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_pdf(buffer, "reporte_empleados")


@router.get("/empleados/excel", dependencies=[Depends(require_roles("admin"))])
def reporte_empleados_excel(
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    empleados = _consultar_empleados(db, estado)
    headers, filas = _filas_usuarios(empleados)
    buffer = generar_excel_reporte(
        "Empleados", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_excel(buffer, "reporte_empleados")


# ---------------------------------------------------------------------------
# REPORTE DE PRODUCTOS (admin y empleado) - incluye desglose de IVA
# ---------------------------------------------------------------------------

def _consultar_productos(db: Session, categoria: str | None, estado: str | None):
    query = db.query(Producto)
    if categoria:
        query = query.filter(Producto.categoria == categoria)
    if estado:
        query = query.filter(Producto.estado == estado)
    return query.order_by(Producto.fecha_creacion.desc()).all()


def _filas_productos(productos):
    headers = ["Nombre", "Categoría", "Precio base", "IVA (19%)", "Precio total", "Stock", "Marca", "Estado"]
    filas = []
    for p in productos:
        iva = calcular_iva(p.precio)
        filas.append([
            p.nombre, p.categoria,
            f"${iva['precio_base']:,.2f}", f"${iva['valor_iva']:,.2f}",
            f"${iva['precio_total']:,.2f}", p.stock, p.marca or "", p.estado,
        ])
    return headers, filas


@router.get("/productos/pdf", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_productos_pdf(
    categoria: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    productos = _consultar_productos(db, categoria, estado)
    headers, filas = _filas_productos(productos)
    buffer = generar_pdf_reporte(
        "Reporte de Productos", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_pdf(buffer, "reporte_productos")


@router.get("/productos/excel", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_productos_excel(
    categoria: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    productos = _consultar_productos(db, categoria, estado)
    headers, filas = _filas_productos(productos)
    buffer = generar_excel_reporte(
        "Productos", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_excel(buffer, "reporte_productos")


# ---------------------------------------------------------------------------
# REPORTE DE SERVICIOS (admin y empleado) - incluye desglose de IVA
# ---------------------------------------------------------------------------

def _consultar_servicios(db: Session, categoria: str | None, estado: str | None):
    query = db.query(Servicio)
    if categoria:
        query = query.filter(Servicio.categoria == categoria)
    if estado:
        query = query.filter(Servicio.estado == estado)
    return query.order_by(Servicio.fecha_creacion.desc()).all()


def _filas_servicios(servicios):
    headers = ["Nombre", "Categoría", "Tipo", "Precio mín. + IVA", "Precio máx. + IVA", "Estado"]
    filas = []
    for s in servicios:
        iva_min = calcular_iva(s.precio_minimo)
        iva_max = calcular_iva(s.precio_maximo)
        filas.append([
            s.nombre, s.categoria, s.tipo_servicio,
            f"${iva_min['precio_total']:,.2f}", f"${iva_max['precio_total']:,.2f}", s.estado,
        ])
    return headers, filas


@router.get("/servicios/pdf", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_servicios_pdf(
    categoria: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    servicios = _consultar_servicios(db, categoria, estado)
    headers, filas = _filas_servicios(servicios)
    buffer = generar_pdf_reporte(
        "Reporte de Servicios", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_pdf(buffer, "reporte_servicios")


@router.get("/servicios/excel", dependencies=[Depends(require_roles("admin", "empleado"))])
def reporte_servicios_excel(
    categoria: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    servicios = _consultar_servicios(db, categoria, estado)
    headers, filas = _filas_servicios(servicios)
    buffer = generar_excel_reporte(
        "Servicios", headers, filas,
        generado_por=f"{usuario_actual.nombres} {usuario_actual.apellidos}",
    )
    return _respuesta_excel(buffer, "reporte_servicios")


# ---------------------------------------------------------------------------
# DASHBOARD ANALÍTICO (admin y empleado)
# ---------------------------------------------------------------------------

@router.get("/dashboard", dependencies=[Depends(require_roles("admin", "empleado"))])
def dashboard_analitica(
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    categoria: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Devuelve los indicadores (KPIs) y series de datos necesarios para el
    dashboard administrativo: ventas, ingresos, IVA, productos/servicios
    más vendidos, inventario bajo, clientes registrados, PQR, etc.
    La fuente autoritativa de las ventas es la tabla `ventas`.
    """
    query_ventas = db.query(Venta).options(
        joinedload(Venta.detalles), joinedload(Venta.cliente)
    ).filter(Venta.estado != "anulada")

    if fecha_desde:
        query_ventas = query_ventas.filter(Venta.fecha_venta >= fecha_desde)
    if fecha_hasta:
        query_ventas = query_ventas.filter(
            Venta.fecha_venta <= datetime.combine(fecha_hasta, datetime.max.time())
        )

    ventas = query_ventas.all()

    total_ventas = 0.0
    total_descuentos = 0.0
    total_iva = 0.0
    ventas_por_dia = defaultdict(float)
    ventas_por_categoria = defaultdict(float)
    cantidad_por_producto = defaultdict(lambda: {"nombre": "", "cantidad": 0, "total": 0.0})
    cantidad_por_servicio = defaultdict(lambda: {"nombre": "", "cantidad": 0, "total": 0.0})

    productos_cache: dict[int, Producto] = {}
    servicios_cache: dict[int, Servicio] = {}

    for venta in ventas:
        subtotal = float(venta.subtotal)
        descuento_valor = subtotal * float(venta.descuento_porcentaje) / 100
        base_gravable = subtotal - descuento_valor
        iva_valor = base_gravable * float(venta.impuesto_porcentaje) / 100

        total_ventas += float(venta.total)
        total_descuentos += descuento_valor
        total_iva += iva_valor

        dia = venta.fecha_venta.strftime("%Y-%m-%d")
        ventas_por_dia[dia] += float(venta.total)

        for detalle in venta.detalles:
            if detalle.id_producto:
                if detalle.id_producto not in productos_cache:
                    productos_cache[detalle.id_producto] = db.query(Producto).filter(
                        Producto.id_producto == detalle.id_producto
                    ).first()
                producto = productos_cache[detalle.id_producto]
                cat = producto.categoria if producto else "Otros"
                if categoria and cat != categoria:
                    continue
                ventas_por_categoria[cat] += float(detalle.subtotal)
                item = cantidad_por_producto[detalle.id_producto]
                item["nombre"] = detalle.descripcion
                item["cantidad"] += detalle.cantidad
                item["total"] += float(detalle.subtotal)
            elif detalle.id_servicio:
                if detalle.id_servicio not in servicios_cache:
                    servicios_cache[detalle.id_servicio] = db.query(Servicio).filter(
                        Servicio.id_servicio == detalle.id_servicio
                    ).first()
                servicio = servicios_cache[detalle.id_servicio]
                cat = servicio.categoria if servicio else "Otros"
                if categoria and cat != categoria:
                    continue
                ventas_por_categoria[cat] += float(detalle.subtotal)
                item = cantidad_por_servicio[detalle.id_servicio]
                item["nombre"] = detalle.descripcion
                item["cantidad"] += detalle.cantidad
                item["total"] += float(detalle.subtotal)

    num_ventas = len(ventas)
    ticket_promedio = (total_ventas / num_ventas) if num_ventas else 0.0

    productos_mas_vendidos = sorted(
        cantidad_por_producto.values(), key=lambda x: x["cantidad"], reverse=True
    )[:5]
    servicios_mas_solicitados = sorted(
        cantidad_por_servicio.values(), key=lambda x: x["cantidad"], reverse=True
    )[:5]

    ventas_por_periodo = [
        {"fecha": fecha, "total": round(total, 2)}
        for fecha, total in sorted(ventas_por_dia.items())
    ]
    ventas_por_categoria_lista = [
        {"categoria": cat, "total": round(total, 2)}
        for cat, total in sorted(ventas_por_categoria.items(), key=lambda x: x[1], reverse=True)
    ]

    num_productos = db.query(Producto).filter(Producto.estado == "activo").count()
    num_servicios = db.query(Servicio).filter(Servicio.estado == "activo").count()
    clientes_registrados = (
        db.query(Usuario).join(Rol).filter(Rol.nombre == "cliente").count()
    )
    total_usuarios = db.query(Usuario).count()
    total_pqr = db.query(Pqr).count()
    pqr_pendientes = db.query(Pqr).filter(Pqr.estado.in_(["pendiente", "en_proceso"])).count()
    productos_bajo_inventario = (
        db.query(Producto)
        .filter(Producto.estado == "activo", Producto.stock > 0, Producto.stock <= 5)
        .order_by(Producto.stock.asc())
        .limit(10)
        .all()
    )
    productos_agotados = (
        db.query(Producto)
        .filter((Producto.estado == "agotado") | (Producto.stock == 0))
        .limit(10)
        .all()
    )

    return {
        "kpis": {
            "ventas_totales": round(total_ventas, 2),
            "ingresos_periodo": round(total_ventas, 2),
            "num_productos": num_productos,
            "num_servicios": num_servicios,
            "clientes_registrados": clientes_registrados,
            "total_usuarios": total_usuarios,
            "num_ventas": num_ventas,
            "ticket_promedio": round(ticket_promedio, 2),
            "total_iva_generado": round(total_iva, 2),
            "total_descuentos": round(total_descuentos, 2),
            "iva_porcentaje": IVA_PORCENTAJE_COLOMBIA,
            "productos_bajo_inventario_count": len(productos_bajo_inventario),
            "productos_agotados_count": len(productos_agotados),
            "total_pqr": total_pqr,
            "pqr_pendientes": pqr_pendientes,
        },
        "ventas_por_periodo": ventas_por_periodo,
        "ventas_por_categoria": ventas_por_categoria_lista,
        "productos_mas_vendidos": productos_mas_vendidos,
        "servicios_mas_solicitados": servicios_mas_solicitados,
        "productos_bajo_inventario": [
            {"id_producto": p.id_producto, "nombre": p.nombre, "stock": p.stock, "categoria": p.categoria}
            for p in productos_bajo_inventario
        ],
        "productos_agotados": [
            {"id_producto": p.id_producto, "nombre": p.nombre, "categoria": p.categoria}
            for p in productos_agotados
        ],
    }
