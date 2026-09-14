from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import require_roles
from ..database import get_db
from ..models import Producto
from ..schemas import ProductoCreate, ProductoResponse, ProductoUpdate
from ..utils import generar_slug_unico

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoResponse])
def listar_productos(
    estado: str | None = None,
    categoria: str | None = None,
    db: Session = Depends(get_db),
):
    """Listado público de productos. Admite filtros por estado y categoría."""
    query = db.query(Producto)
    if estado:
        query = query.filter(Producto.estado == estado)
    if categoria:
        query = query.filter(Producto.categoria == categoria)
    return query.order_by(Producto.fecha_creacion.desc()).all()


@router.get("/{id_producto}", response_model=ProductoResponse)
def obtener_producto(id_producto: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(
        Producto.id_producto == id_producto
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post(
    "/",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    slug = generar_slug_unico(db, Producto, producto.nombre)
    nuevo = Producto(**producto.model_dump(), slug=slug)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put(
    "/{id_producto}",
    response_model=ProductoResponse,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def actualizar_producto(
    id_producto: int, cambios: ProductoUpdate, db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.id_producto == id_producto
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    datos = cambios.model_dump(exclude_unset=True)
    if "nombre" in datos and datos["nombre"] != producto.nombre:
        producto.slug = generar_slug_unico(
            db, Producto, datos["nombre"], id_excluir=id_producto
        )
    for campo, valor in datos.items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete(
    "/{id_producto}",
    dependencies=[Depends(require_roles("admin"))],
)
def eliminar_producto(id_producto: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(
        Producto.id_producto == id_producto
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Baja lógica en lugar de eliminación física, para preservar el historial.
    producto.estado = "inactivo"
    db.commit()
    return {"success": True, "message": "Producto desactivado correctamente"}
