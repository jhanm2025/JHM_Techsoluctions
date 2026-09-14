from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..models import Pqr, Usuario
from ..schemas import PqrCreate, PqrResponderUpdate, PqrResponse

router = APIRouter(prefix="/pqr", tags=["PQR"])


@router.post("/", response_model=PqrResponse, status_code=201)
def crear_pqr(
    datos: PqrCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """Cualquier usuario autenticado puede registrar una PQR (pensado para clientes)."""
    pqr = Pqr(
        id_cliente=usuario_actual.id_usuario,
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return pqr


@router.get("/", response_model=list[PqrResponse])
def listar_pqr(
    estado: str | None = None,
    tipo: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """
    Un cliente ve únicamente sus propias PQR. Admin y empleado ven todas,
    con filtros opcionales por estado y tipo.
    """
    query = db.query(Pqr).options(joinedload(Pqr.cliente))

    rol_actual = usuario_actual.rol.nombre if usuario_actual.rol else None
    if rol_actual not in ("admin", "empleado"):
        query = query.filter(Pqr.id_cliente == usuario_actual.id_usuario)

    if estado:
        query = query.filter(Pqr.estado == estado)
    if tipo:
        query = query.filter(Pqr.tipo == tipo)

    return query.order_by(Pqr.fecha_creacion.desc()).all()


@router.get("/{id_pqr}", response_model=PqrResponse)
def obtener_pqr(
    id_pqr: int, db: Session = Depends(get_db), usuario_actual: Usuario = Depends(get_current_user)
):
    pqr = db.query(Pqr).options(joinedload(Pqr.cliente)).filter(Pqr.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")

    rol_actual = usuario_actual.rol.nombre if usuario_actual.rol else None
    if rol_actual not in ("admin", "empleado") and pqr.id_cliente != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta PQR")
    return pqr


@router.patch(
    "/{id_pqr}",
    response_model=PqrResponse,
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def responder_pqr(
    id_pqr: int,
    cambios: PqrResponderUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """Permite a admin/empleado responder una PQR y/o cambiar su estado."""
    pqr = db.query(Pqr).filter(Pqr.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada")

    if cambios.respuesta is not None:
        pqr.respuesta = cambios.respuesta
        pqr.fecha_respuesta = datetime.now(timezone.utc)
        pqr.id_usuario_responde = usuario_actual.id_usuario

    pqr.estado = cambios.estado
    db.commit()
    db.refresh(pqr)
    return pqr
