from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Usuario, Rol
from ..schemas import (
    UsuarioCreate,
    UsuarioResponse,
    UsuarioListResponse,
    UsuarioAdminUpdate,
    UsuarioAdminFullUpdate,
    EmpleadoCreate,
    EmpleadoResponse,
)
from ..auth import hash_password, get_current_user, require_roles
from ..email_utils import enviar_correo_bienvenida_empleado
from ..utils import generar_password_temporal
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)
@router.post(
    "/",
    response_model=UsuarioResponse,
    status_code=201
)
def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    usuario_existente = db.query(Usuario).filter(
        Usuario.email == usuario.email
    ).first()
    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )
    documento_existente = db.query(Usuario).filter(
        Usuario.numero_documento ==
        usuario.numero_documento
    ).first()

    if documento_existente:
        raise HTTPException(
            status_code=400,
            detail="El número de documento ya está registrado" )
    rol_cliente = db.query(Rol).filter(
        Rol.nombre == "cliente",
        Rol.estado == "activo"
    ).first()
    if not rol_cliente:
        raise HTTPException(
            status_code=500,
            detail=("El rol cliente no existe o "
                "se encuentra inactivo"))
    try:
        password_hash = hash_password(usuario.password)
        nuevo_usuario = Usuario(
            id_rol=rol_cliente.id_rol,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            tipo_documento=usuario.tipo_documento,
            numero_documento=usuario.numero_documento,
            direccion=usuario.direccion,
            telefono=usuario.telefono,
            email=usuario.email,
            password=password_hash,
            estado="activo" )
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        return nuevo_usuario
    except ValueError as error:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(error) )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No fue posible registrar el usuario" )


@router.get(
    "/me",
    response_model=UsuarioListResponse,
)
def obtener_perfil(usuario: Usuario = Depends(get_current_user)):
    """Devuelve el perfil del usuario autenticado (cualquier rol)."""
    return usuario


@router.get(
    "/",
    response_model=list[UsuarioListResponse],
    dependencies=[Depends(require_roles("admin"))],
)
def listar_usuarios(
    id_rol: int | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
):
    """Listado de usuarios del sistema. Solo accesible para administradores."""
    query = db.query(Usuario).options(joinedload(Usuario.rol))
    if id_rol is not None:
        query = query.filter(Usuario.id_rol == id_rol)
    if estado:
        query = query.filter(Usuario.estado == estado)
    return query.order_by(Usuario.fecha_registro.desc()).all()


@router.patch(
    "/{id_usuario}",
    response_model=UsuarioListResponse,
    dependencies=[Depends(require_roles("admin"))],
)
def actualizar_usuario_admin(
    id_usuario: int,
    cambios: UsuarioAdminFullUpdate,
    db: Session = Depends(get_db),
):
    """Permite a un administrador editar los datos, rol o estado de un usuario."""
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    datos = cambios.model_dump(exclude_unset=True)
    if "id_rol" in datos:
        rol = db.query(Rol).filter(Rol.id_rol == datos["id_rol"]).first()
        if not rol:
            raise HTTPException(status_code=400, detail="El rol indicado no existe")

    for campo, valor in datos.items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.get(
    "/roles/lista",
    tags=["Roles"],
)
def listar_roles(db: Session = Depends(get_db)):
    """Lista los roles activos del sistema (admin, empleado, cliente)."""
    roles = db.query(Rol).filter(Rol.estado == "activo").all()
    return [
        {"id_rol": r.id_rol, "nombre": r.nombre, "descripcion": r.descripcion}
        for r in roles
    ]


# ---------------------------------------------------------------------------
# GESTIÓN DE EMPLEADOS (solo administrador)
# ---------------------------------------------------------------------------

@router.get(
    "/empleados/lista",
    response_model=list[EmpleadoResponse],
    dependencies=[Depends(require_roles("admin"))],
)
def listar_empleados(db: Session = Depends(get_db)):
    """Lista únicamente los usuarios con rol 'empleado'."""
    return (
        db.query(Usuario)
        .join(Rol)
        .filter(Rol.nombre == "empleado")
        .options(joinedload(Usuario.rol))
        .order_by(Usuario.fecha_registro.desc())
        .all()
    )


@router.get(
    "/clientes/lista",
    response_model=list[EmpleadoResponse],
    dependencies=[Depends(require_roles("admin", "empleado"))],
)
def listar_clientes(db: Session = Depends(get_db)):
    """
    Lista únicamente los usuarios con rol 'cliente'. Accesible también
    para empleados, ya que la necesitan para generar facturas.
    """
    return (
        db.query(Usuario)
        .join(Rol)
        .filter(Rol.nombre == "cliente")
        .options(joinedload(Usuario.rol))
        .order_by(Usuario.fecha_registro.desc())
        .all()
    )


@router.post(
    "/empleados",
    response_model=EmpleadoResponse,
    status_code=201,
    dependencies=[Depends(require_roles("admin"))],
)
def crear_empleado(empleado: EmpleadoCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo empleado desde el panel administrativo.
    Si no se especifica contraseña, se genera una temporal y se le
    notifica al empleado por correo electrónico.
    """
    if db.query(Usuario).filter(Usuario.email == empleado.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if db.query(Usuario).filter(
        Usuario.numero_documento == empleado.numero_documento
    ).first():
        raise HTTPException(
            status_code=400, detail="El número de documento ya está registrado"
        )

    rol_empleado = db.query(Rol).filter(
        Rol.nombre == "empleado", Rol.estado == "activo"
    ).first()
    if not rol_empleado:
        raise HTTPException(
            status_code=500, detail="El rol 'empleado' no existe o está inactivo"
        )

    password_generada = empleado.password is None
    password_plana = empleado.password or generar_password_temporal()

    nuevo_empleado = Usuario(
        id_rol=rol_empleado.id_rol,
        nombres=empleado.nombres,
        apellidos=empleado.apellidos,
        tipo_documento=empleado.tipo_documento,
        numero_documento=empleado.numero_documento,
        direccion=empleado.direccion,
        telefono=empleado.telefono,
        email=empleado.email,
        password=hash_password(password_plana),
        estado=empleado.estado,
    )
    db.add(nuevo_empleado)
    db.commit()
    db.refresh(nuevo_empleado)

    if password_generada:
        try:
            enviar_correo_bienvenida_empleado(
                destinatario=nuevo_empleado.email,
                nombre=nuevo_empleado.nombres,
                password_temporal=password_plana,
            )
        except Exception as error:  # pragma: no cover
            print(f"[email] No fue posible enviar el correo de bienvenida: {error}")

    return nuevo_empleado