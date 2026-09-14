from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import (
    RESET_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    generate_reset_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..email_utils import enviar_correo_recuperacion
from ..models import PasswordResetToken, Usuario
from ..schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    MensajeResponse,
    ResetPasswordRequest,
    TokenResponse,
    UsuarioAuth,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(credenciales: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(
        Usuario.email == credenciales.email
    ).first()

    if not usuario or not verify_password(credenciales.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    if usuario.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta se encuentra inactiva o bloqueada. Contacta al administrador.",
        )

    usuario.ultimo_acceso = datetime.now(timezone.utc)
    db.commit()
    db.refresh(usuario)

    token = create_access_token({
        "sub": str(usuario.id_usuario),
        "rol": usuario.rol.nombre if usuario.rol else None,
    })

    return TokenResponse(
        access_token=token,
        usuario=UsuarioAuth(
            id_usuario=usuario.id_usuario,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            email=usuario.email,
            foto=usuario.foto,
            rol=usuario.rol.nombre if usuario.rol else "cliente",
        ),
    )


@router.get("/me", response_model=UsuarioAuth)
def me(usuario: Usuario = Depends(get_current_user)):
    return UsuarioAuth(
        id_usuario=usuario.id_usuario,
        nombres=usuario.nombres,
        apellidos=usuario.apellidos,
        email=usuario.email,
        foto=usuario.foto,
        rol=usuario.rol.nombre if usuario.rol else "cliente",
    )


@router.post("/forgot-password", response_model=MensajeResponse)
def forgot_password(datos: ForgotPasswordRequest, db: Session = Depends(get_db)):
    mensaje_generico = MensajeResponse(
        message=(
            "Si el correo está registrado, recibirás un enlace de "
            "recuperación en unos minutos."
        )
    )

    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario:
        # No revelamos si el correo existe o no (buena práctica de seguridad).
        return mensaje_generico

    token = generate_reset_token()
    expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )
    reset = PasswordResetToken(
        id_usuario=usuario.id_usuario,
        token=token,
        fecha_expiracion=expiracion,
    )
    db.add(reset)
    db.commit()

    try:
        enviar_correo_recuperacion(
            destinatario=usuario.email,
            nombre=usuario.nombres,
            token=token,
            minutos_expiracion=RESET_TOKEN_EXPIRE_MINUTES,
        )
    except Exception as error:  # pragma: no cover
        # No revelamos detalles del error SMTP al cliente por seguridad,
        # pero lo dejamos registrado en el servidor para depuración.
        print(f"[email] No fue posible enviar el correo de recuperación: {error}")

    return mensaje_generico


@router.post("/reset-password", response_model=MensajeResponse)
def reset_password(datos: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == datos.token,
        PasswordResetToken.usado.is_(False),
    ).first()

    if not reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token es inválido o ya fue utilizado",
        )

    fecha_expiracion = reset.fecha_expiracion
    if fecha_expiracion.tzinfo is None:
        fecha_expiracion = fecha_expiracion.replace(tzinfo=timezone.utc)

    if fecha_expiracion < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token ha expirado. Solicita uno nuevo.",
        )

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == reset.id_usuario
    ).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    usuario.password = hash_password(datos.password)
    reset.usado = True
    db.commit()

    return MensajeResponse(message="Contraseña actualizada correctamente")
