"""
Script de siembra (seed) de datos iniciales.

Crea los roles básicos del sistema (admin, empleado, cliente) y un
usuario administrador por defecto si todavía no existen.

Se ejecuta automáticamente al iniciar la aplicación (ver app/main.py)
y también puede ejecutarse manualmente con:

    python -m app.seed
"""

import os

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from .auth import hash_password
from .database import Base, SessionLocal, engine
from .models import Rol, Usuario

load_dotenv()

ROLES_INICIALES = [
    {
        "nombre": "admin",
        "descripcion": "Administrador con acceso total al sistema",
    },
    {
        "nombre": "empleado",
        "descripcion": "Gestiona productos, servicios y solicitudes de clientes",
    },
    {
        "nombre": "cliente",
        "descripcion": "Usuario final que consulta productos, servicios y solicita asesorías",
    },
]

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@jhmtechsolutions.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123!")
ADMIN_DOCUMENTO = os.getenv("ADMIN_DOCUMENTO", "1000000000")


def seed_roles(db: Session) -> dict[str, Rol]:
    roles = {}
    for datos in ROLES_INICIALES:
        rol = db.query(Rol).filter(Rol.nombre == datos["nombre"]).first()
        if not rol:
            rol = Rol(nombre=datos["nombre"], descripcion=datos["descripcion"])
            db.add(rol)
            db.commit()
            db.refresh(rol)
        roles[datos["nombre"]] = rol
    return roles


def seed_admin(db: Session, roles: dict[str, Rol]) -> None:
    admin_existente = db.query(Usuario).filter(
        Usuario.email == ADMIN_EMAIL
    ).first()
    if admin_existente:
        return

    admin = Usuario(
        id_rol=roles["admin"].id_rol,
        nombres="Administrador",
        apellidos="JHM Tech Solutions",
        tipo_documento="CC",
        numero_documento=ADMIN_DOCUMENTO,
        email=ADMIN_EMAIL,
        password=hash_password(ADMIN_PASSWORD),
        estado="activo",
    )
    db.add(admin)
    db.commit()
    print(
        "Usuario administrador creado -> "
        f"email: {ADMIN_EMAIL} | password: {ADMIN_PASSWORD} "
        "(cámbiala después del primer inicio de sesión)."
    )


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        roles = seed_roles(db)
        seed_admin(db, roles)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
