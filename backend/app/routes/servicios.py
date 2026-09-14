from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import require_roles
from ..database import get_db
from ..models import Servicio
from ..schemas import ServicioCreate, ServicioResponse, ServicioUpdate
from ..utils import generar_slug_unico

router = APIRouter(prefix="/servicios", tags=["Servicios"])


@router.get("/", response_model=list[ServicioResponse])
def listar_servicios(
    estado: str | None = None,
    categoria: str | None = None,
    db: Session = Depends(get_db),
):
    """Listado público de servicios. Admite filtros por estado y categoría."""
    query = db.query(Servicio)
    if estado:
        query = query.filter(Servicio.estado == estado)
    if categoria:
        query = query.filter(Servicio.categoria == categoria)
    return query.order_by(Servicio.fecha_creacion.desc()).all()


@router.get("/{id_servicio}", response_model=ServicioResponse)
def obtener_servicio(id_servicio: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(
        Servicio.id_servicio == id_servicio
    ).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio


@router.post(
    "/",
    response_model=ServicioResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def crear_servicio(servicio: ServicioCreate, db: Session = Depends(get_db)):
    slug = generar_slug_unico(db, Servicio, servicio.nombre)
    nuevo = Servicio(**servicio.model_dump(), slug=slug)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put(
    "/{id_servicio}",
    response_model=ServicioResponse,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def actualizar_servicio(
    id_servicio: int, cambios: ServicioUpdate, db: Session = Depends(get_db)
):
    servicio = db.query(Servicio).filter(
        Servicio.id_servicio == id_servicio
    ).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    datos = cambios.model_dump(exclude_unset=True)
    if "nombre" in datos and datos["nombre"] != servicio.nombre:
        servicio.slug = generar_slug_unico(
            db, Servicio, datos["nombre"], id_excluir=id_servicio
        )
    for campo, valor in datos.items():
        setattr(servicio, campo, valor)

    db.commit()
    db.refresh(servicio)
    return servicio


@router.delete(
    "/{id_servicio}",
    dependencies=[Depends(require_roles("admin"))],
)
def eliminar_servicio(id_servicio: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(
        Servicio.id_servicio == id_servicio
    ).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    # Baja lógica en lugar de eliminación física, para preservar el historial.
    servicio.estado = "inactivo"
    db.commit()
    return {"success": True, "message": "Servicio desactivado correctamente"}
