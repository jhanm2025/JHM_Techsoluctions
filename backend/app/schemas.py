from datetime import datetime
from decimal import Decimal
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
    field_validator,
    computed_field,
)

from .utils import validar_password_fuerte, calcular_iva, IVA_PORCENTAJE_COLOMBIA

class UsuarioCreate(BaseModel):
    nombres: str = Field(min_length=2, max_length=100 )
    apellidos: str = Field(min_length=2, max_length=100 )
    tipo_documento: str = Field(max_length=30 )
    numero_documento: str = Field(min_length=5, max_length=30)
    direccion: str | None = Field(default=None, max_length=200)
    telefono: str | None = Field( default=None, max_length=30 )
    email: EmailStr
    password: str = Field(min_length=8, max_length=72 )

    @field_validator("password")
    @classmethod
    def _validar_password(cls, value: str) -> str:
        return validar_password_fuerte(value)

class UsuarioResponse(BaseModel):
    id_usuario: int
    id_rol: int
    nombres: str
    apellidos: str
    tipo_documento: str
    numero_documento: str
    direccion: str | None
    telefono: str | None
    email: EmailStr
    foto: str | None
    estado: str
    ultimo_acceso: datetime | None
    fecha_registro: datetime | None
    fecha_actualizacion: datetime | None
    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------------
# ROLES
# ---------------------------------------------------------------------------

class RolResponse(BaseModel):
    id_rol: int
    nombre: str
    descripcion: str | None = None
    estado: str
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# AUTENTICACIÓN
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UsuarioAuth(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    email: EmailStr
    foto: str | None = None
    rol: str
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioAuth


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def _validar_password(cls, value: str) -> str:
        return validar_password_fuerte(value)


class MensajeResponse(BaseModel):
    success: bool = True
    message: str


# ---------------------------------------------------------------------------
# GESTIÓN DE USUARIOS (ADMIN)
# ---------------------------------------------------------------------------

class UsuarioAdminUpdate(BaseModel):
    id_rol: int | None = None
    estado: str | None = Field(default=None, pattern="^(activo|inactivo|bloqueado)$")


class UsuarioAdminFullUpdate(BaseModel):
    """Permite al administrador editar los datos completos de un usuario/empleado."""
    nombres: str | None = Field(default=None, min_length=2, max_length=100)
    apellidos: str | None = Field(default=None, min_length=2, max_length=100)
    telefono: str | None = Field(default=None, max_length=30)
    direccion: str | None = Field(default=None, max_length=200)
    id_rol: int | None = None
    estado: str | None = Field(default=None, pattern="^(activo|inactivo|bloqueado)$")


class EmpleadoCreate(BaseModel):
    """Registro de un nuevo empleado, realizado por un administrador."""
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    tipo_documento: str = Field(max_length=30)
    numero_documento: str = Field(min_length=5, max_length=30)
    direccion: str | None = Field(default=None, max_length=200)
    telefono: str | None = Field(default=None, max_length=30)
    email: EmailStr
    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=72,
        description="Si se omite, se genera una contraseña temporal automáticamente.",
    )
    estado: str = Field(default="activo", pattern="^(activo|inactivo|bloqueado)$")

    @field_validator("password")
    @classmethod
    def _validar_password(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return validar_password_fuerte(value)


class EmpleadoResponse(UsuarioResponse):
    rol: RolResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class UsuarioListResponse(UsuarioResponse):
    rol: RolResponse | None = None
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# SERVICIOS
# ---------------------------------------------------------------------------

class ServicioBase(BaseModel):
    nombre: str = Field(min_length=3, max_length=150)
    categoria: str = Field(min_length=2, max_length=100)
    tipo_servicio: str = Field(
        pattern="^(asesoria|consultoria|desarrollo|implementacion|soporte|personalizado)$"
    )
    descripcion: str = Field(min_length=10)
    descripcion_corta: str | None = Field(default=None, max_length=255)
    precio_minimo: Decimal = Field(default=0, ge=0)
    precio_maximo: Decimal = Field(default=0, ge=0)
    modalidad: str = Field(default="remoto", pattern="^(presencial|remoto|hibrido)$")
    imagen: str | None = None


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=3, max_length=150)
    categoria: str | None = Field(default=None, min_length=2, max_length=100)
    tipo_servicio: str | None = Field(
        default=None,
        pattern="^(asesoria|consultoria|desarrollo|implementacion|soporte|personalizado)$",
    )
    descripcion: str | None = Field(default=None, min_length=10)
    descripcion_corta: str | None = Field(default=None, max_length=255)
    precio_minimo: Decimal | None = Field(default=None, ge=0)
    precio_maximo: Decimal | None = Field(default=None, ge=0)
    modalidad: str | None = Field(default=None, pattern="^(presencial|remoto|hibrido)$")
    imagen: str | None = None
    estado: str | None = Field(default=None, pattern="^(activo|inactivo)$")


class ServicioResponse(ServicioBase):
    id_servicio: int
    slug: str
    estado: str
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def iva_porcentaje(self) -> float:
        return float(IVA_PORCENTAJE_COLOMBIA)

    @computed_field
    @property
    def precio_minimo_con_iva(self) -> float:
        return calcular_iva(self.precio_minimo)["precio_total"]

    @computed_field
    @property
    def precio_maximo_con_iva(self) -> float:
        return calcular_iva(self.precio_maximo)["precio_total"]


# ---------------------------------------------------------------------------
# PRODUCTOS
# ---------------------------------------------------------------------------

class ProductoBase(BaseModel):
    nombre: str = Field(min_length=3, max_length=150)
    categoria: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(min_length=10)
    precio: Decimal = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    imagen: str | None = None
    marca: str | None = Field(default=None, max_length=100)
    referencia: str | None = Field(default=None, max_length=100)
    id_servicio: int | None = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=3, max_length=150)
    categoria: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, min_length=10)
    precio: Decimal | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    imagen: str | None = None
    marca: str | None = Field(default=None, max_length=100)
    referencia: str | None = Field(default=None, max_length=100)
    id_servicio: int | None = None
    estado: str | None = Field(default=None, pattern="^(activo|inactivo|agotado)$")


class ProductoResponse(ProductoBase):
    id_producto: int
    slug: str
    estado: str
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def iva_porcentaje(self) -> float:
        return float(IVA_PORCENTAJE_COLOMBIA)

    @computed_field
    @property
    def valor_iva(self) -> float:
        return calcular_iva(self.precio)["valor_iva"]

    @computed_field
    @property
    def precio_total(self) -> float:
        return calcular_iva(self.precio)["precio_total"]


# ---------------------------------------------------------------------------
# FACTURACIÓN
# ---------------------------------------------------------------------------

class ItemFacturaCreate(BaseModel):
    tipo: str = Field(pattern="^(producto|servicio)$")
    id_item: int
    cantidad: int = Field(default=1, ge=1)
    descripcion: str | None = None


class FacturaCreate(BaseModel):
    id_cliente: int
    items: list[ItemFacturaCreate] = Field(min_length=1)
    descuento_porcentaje: Decimal = Field(default=0, ge=0, le=100)
    impuesto_porcentaje: Decimal = Field(default=19, ge=0, le=100)
    observaciones: str | None = Field(default=None, max_length=500)


class FacturaUpdateEstado(BaseModel):
    estado: str = Field(pattern="^(pendiente|pagada|anulada)$")


class DetalleFacturaResponse(BaseModel):
    id_detalle: int
    descripcion: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    model_config = ConfigDict(from_attributes=True)


class FacturaResponse(BaseModel):
    id_factura: int
    numero_factura: str
    id_cliente: int
    id_usuario_emisor: int
    fecha_emision: datetime
    subtotal: Decimal
    descuento_porcentaje: Decimal
    impuesto_porcentaje: Decimal
    total: Decimal
    estado: str
    observaciones: str | None = None
    detalles: list[DetalleFacturaResponse] = []
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def valor_descuento(self) -> float:
        return float(round(self.subtotal * self.descuento_porcentaje / 100, 2))

    @computed_field
    @property
    def base_gravable(self) -> float:
        return float(round(self.subtotal - self.subtotal * self.descuento_porcentaje / 100, 2))

    @computed_field
    @property
    def valor_iva(self) -> float:
        base = self.subtotal - self.subtotal * self.descuento_porcentaje / 100
        return float(round(base * self.impuesto_porcentaje / 100, 2))


# ---------------------------------------------------------------------------
# VENTAS
# ---------------------------------------------------------------------------

class ItemVentaCreate(BaseModel):
    tipo: str = Field(pattern="^(producto|servicio)$")
    id_item: int
    cantidad: int = Field(default=1, ge=1)
    descripcion: str | None = None


class VentaCreate(BaseModel):
    id_cliente: int
    items: list[ItemVentaCreate] = Field(min_length=1)
    descuento_porcentaje: Decimal = Field(default=0, ge=0, le=100)
    impuesto_porcentaje: Decimal = Field(default=19, ge=0, le=100)
    observaciones: str | None = Field(default=None, max_length=500)
    generar_factura: bool = Field(
        default=True,
        description="Si es verdadero, se genera automáticamente la factura de venta.",
    )


class VentaEstadoUpdate(BaseModel):
    estado: str = Field(pattern="^(pendiente|completada|anulada)$")


class DetalleVentaResponse(BaseModel):
    id_detalle: int
    descripcion: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    model_config = ConfigDict(from_attributes=True)


class FacturaResumen(BaseModel):
    id_factura: int
    numero_factura: str
    estado: str
    model_config = ConfigDict(from_attributes=True)


class VentaResponse(BaseModel):
    id_venta: int
    numero_venta: str
    id_cliente: int
    id_usuario_vendedor: int | None = None
    fecha_venta: datetime
    subtotal: Decimal
    descuento_porcentaje: Decimal
    impuesto_porcentaje: Decimal
    total: Decimal
    estado: str
    observaciones: str | None = None
    detalles: list[DetalleVentaResponse] = []
    factura: FacturaResumen | None = None
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def valor_descuento(self) -> float:
        return float(round(self.subtotal * self.descuento_porcentaje / 100, 2))

    @computed_field
    @property
    def valor_iva(self) -> float:
        base = self.subtotal - self.subtotal * self.descuento_porcentaje / 100
        return float(round(base * self.impuesto_porcentaje / 100, 2))


# ---------------------------------------------------------------------------
# PQR (Peticiones, Quejas y Reclamos)
# ---------------------------------------------------------------------------

class PqrCreate(BaseModel):
    tipo: str = Field(pattern="^(peticion|queja|reclamo|sugerencia)$")
    asunto: str = Field(min_length=5, max_length=150)
    descripcion: str = Field(min_length=10, max_length=1000)


class PqrResponderUpdate(BaseModel):
    respuesta: str | None = Field(default=None, max_length=1000)
    estado: str = Field(pattern="^(pendiente|en_proceso|respondida|cerrada)$")


class UsuarioResumen(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)


class PqrResponse(BaseModel):
    id_pqr: int
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: str | None = None
    fecha_creacion: datetime
    fecha_respuesta: datetime | None = None
    cliente: UsuarioResumen | None = None
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# CHATBOT (con Inteligencia Artificial)
# ---------------------------------------------------------------------------

class MensajeChatbotRequest(BaseModel):
    mensaje: str = Field(min_length=1, max_length=1000)
    conversacion_id: int | None = None
    nombre_visitante: str | None = Field(default=None, max_length=100)


class MensajeResponse2(BaseModel):
    remitente: str
    contenido: str
    fecha_envio: datetime
    model_config = ConfigDict(from_attributes=True)


class MensajeChatbotResponse(BaseModel):
    conversacion_id: int
    respuesta: str
    fuente: str = Field(description="'ia' si respondió el modelo de IA, 'reglas' si fue una respuesta predefinida")


class ConversacionResponse(BaseModel):
    id_conversacion: int
    nombre_visitante: str | None = None
    estado: str
    fecha_inicio: datetime
    usuario: UsuarioResumen | None = None
    mensajes: list[MensajeResponse2] = []
    model_config = ConfigDict(from_attributes=True)