from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user_optional, require_roles
from ..chatbot_ai import generar_respuesta_chatbot
from ..database import get_db
from ..models import Conversacion, Mensaje, Usuario
from ..schemas import ConversacionResponse, MensajeChatbotRequest, MensajeChatbotResponse

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/mensaje", response_model=MensajeChatbotResponse)
def enviar_mensaje(
    datos: MensajeChatbotRequest,
    db: Session = Depends(get_db),
    usuario_actual: Usuario | None = Depends(get_current_user_optional),
):
    """
    Envía un mensaje al chatbot. Funciona tanto para visitantes anónimos
    (sin sesión) como para usuarios autenticados. Si no se envía
    conversacion_id, se crea una conversación nueva.
    """
    conversacion = None
    if datos.conversacion_id:
        conversacion = (
            db.query(Conversacion)
            .options(joinedload(Conversacion.mensajes))
            .filter(Conversacion.id_conversacion == datos.conversacion_id)
            .first()
        )

    if not conversacion:
        conversacion = Conversacion(
            id_usuario=usuario_actual.id_usuario if usuario_actual else None,
            nombre_visitante=datos.nombre_visitante if not usuario_actual else None,
        )
        db.add(conversacion)
        db.commit()
        db.refresh(conversacion)

    historial = [
        {"role": "user" if m.remitente == "usuario" else "assistant", "content": m.contenido}
        for m in conversacion.mensajes
    ]

    mensaje_usuario = Mensaje(
        id_conversacion=conversacion.id_conversacion,
        remitente="usuario",
        contenido=datos.mensaje,
    )
    db.add(mensaje_usuario)
    db.commit()

    respuesta_texto, fuente = generar_respuesta_chatbot(datos.mensaje, historial)

    mensaje_bot = Mensaje(
        id_conversacion=conversacion.id_conversacion,
        remitente="bot",
        contenido=respuesta_texto,
    )
    db.add(mensaje_bot)
    db.commit()

    return MensajeChatbotResponse(
        conversacion_id=conversacion.id_conversacion,
        respuesta=respuesta_texto,
        fuente=fuente,
    )


@router.get(
    "/conversaciones",
    response_model=list[ConversacionResponse],
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def listar_conversaciones(db: Session = Depends(get_db)):
    """Permite a admin/empleado revisar las conversaciones del chatbot."""
    return (
        db.query(Conversacion)
        .options(joinedload(Conversacion.mensajes), joinedload(Conversacion.usuario))
        .order_by(Conversacion.fecha_inicio.desc())
        .limit(100)
        .all()
    )
