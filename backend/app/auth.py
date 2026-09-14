import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from .models import Usuario

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "clave_secreta_proyecto_react")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)
RESET_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30")
)

# Usado únicamente para documentar el esquema de seguridad en /docs
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login", auto_error=False
)


def hash_password(password: str) -> str:
    """
    Genera un hash seguro de la contraseña.
    bcrypt trabaja con un máximo de 72 bytes.
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError(
            "La contraseña no puede superar los 72 bytes."
        )
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )
    return hashed.decode("utf-8")
def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(
        password_bytes,
        hashed_bytes
    )


# ---------------------------------------------------------------------------
# JSON Web Tokens (JWT) - Autenticación / autorización
# ---------------------------------------------------------------------------

def create_access_token(data: dict, expires_minutes: int | None = None) -> str:
    """Genera un JWT firmado que representa la sesión del usuario."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas o token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def generate_reset_token() -> str:
    """Token aleatorio y seguro para el flujo de recuperación de contraseña."""
    return secrets.token_urlsafe(32)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No fue posible validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    id_usuario = payload.get("sub")
    if id_usuario is None:
        raise credentials_exception

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == int(id_usuario)
    ).first()
    if usuario is None:
        raise credentials_exception
    if usuario.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo o bloqueado",
        )
    return usuario


def require_roles(*roles_permitidos: str):
    """
    Dependencia de FastAPI para restringir un endpoint a ciertos roles.
    Uso: Depends(require_roles("admin", "empleado"))
    """

    def _dependencia(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        nombre_rol = usuario.rol.nombre if usuario.rol else None
        if nombre_rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción",
            )
        return usuario

    return _dependencia


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario | None:
    """
    Igual que get_current_user, pero retorna None en lugar de lanzar 401
    si no hay token o es inválido. Pensado para endpoints públicos (como
    el chatbot) que deben funcionar tanto para visitantes anónimos como
    para usuarios autenticados.
    """
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        id_usuario = payload.get("sub")
        if id_usuario is None:
            return None
        return db.query(Usuario).filter(Usuario.id_usuario == int(id_usuario)).first()
    except HTTPException:
        return None