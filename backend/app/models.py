from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Enum,
    DateTime,
    TIMESTAMP,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class Rol(Base):
    __tablename__ = "roles"
    id_rol = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Enum("activo", "inactivo"), default="activo")
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())

    usuarios = relationship("Usuario", back_populates="rol")


class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    tipo_documento = Column(Enum("CC", "CE", "TI", "PASAPORTE", "NIT"), nullable=False)
    numero_documento = Column(String(30), unique=True, nullable=False)
    direccion = Column(String(200), nullable=True)
    telefono = Column(String(30), nullable=True)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    foto = Column(String(255), nullable=True)
    estado = Column(Enum("activo", "inactivo", "bloqueado"), default="activo", nullable=False)
    ultimo_acceso = Column(DateTime, nullable=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )

    rol = relationship("Rol", back_populates="usuarios")
    reset_tokens = relationship(
        "PasswordResetToken", back_populates="usuario", cascade="all, delete-orphan"
    )

class Servicio(Base):
    __tablename__ = "servicios"
    id_servicio = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    slug = Column(String(180), unique=True, nullable=False)
    categoria = Column(String(100), nullable=False)
    tipo_servicio = Column(
        Enum(
            "asesoria",
            "consultoria",
            "desarrollo",
            "implementacion",
            "soporte",
            "personalizado",
        ),
        nullable=False,
    )
    descripcion = Column(Text, nullable=False)
    descripcion_corta = Column(String(255), nullable=True)
    precio_minimo = Column(Numeric(12, 2), default=0)
    precio_maximo = Column(Numeric(12, 2), default=0)
    modalidad = Column(
        Enum("presencial", "remoto", "hibrido"), default="remoto"
    )
    imagen = Column(String(255), nullable=True)
    estado = Column(Enum("activo", "inactivo"), default="activo")
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )

    productos = relationship("Producto", back_populates="servicio")


class Producto(Base):
    __tablename__ = "productos"
    id_producto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_servicio = Column(
        Integer, ForeignKey("servicios.id_servicio"), nullable=True
    )
    nombre = Column(String(150), nullable=False)
    slug = Column(String(180), unique=True, nullable=False)
    categoria = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    precio = Column(Numeric(12, 2), nullable=False, default=0)
    stock = Column(Integer, default=0)
    imagen = Column(String(255), nullable=True)
    marca = Column(String(100), nullable=True)
    referencia = Column(String(100), nullable=True)
    estado = Column(Enum("activo", "inactivo", "agotado"), default="activo")
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )

    servicio = relationship("Servicio", back_populates="productos")


class PasswordResetToken(Base):
    """Tokens de un solo uso para el flujo de 'recuperar contraseña'."""

    __tablename__ = "password_resets"
    id_reset = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=False
    )
    token = Column(String(255), unique=True, nullable=False, index=True)
    usado = Column(Boolean, default=False, nullable=False)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_expiracion = Column(DateTime, nullable=False)

    usuario = relationship("Usuario", back_populates="reset_tokens")


class Factura(Base):
    __tablename__ = "facturas"
    id_factura = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_factura = Column(String(30), unique=True, nullable=False, index=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), unique=True, nullable=True)
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_usuario_emisor = Column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=False
    )
    fecha_emision = Column(TIMESTAMP, server_default=func.now())
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)
    descuento_porcentaje = Column(Numeric(5, 2), nullable=False, default=0)
    impuesto_porcentaje = Column(Numeric(5, 2), nullable=False, default=19)
    total = Column(Numeric(12, 2), nullable=False, default=0)
    estado = Column(
        Enum("pendiente", "pagada", "anulada"), default="pendiente", nullable=False
    )
    observaciones = Column(String(500), nullable=True)

    cliente = relationship("Usuario", foreign_keys=[id_cliente])
    usuario_emisor = relationship("Usuario", foreign_keys=[id_usuario_emisor])
    venta = relationship("Venta", back_populates="factura")
    detalles = relationship(
        "DetalleFactura", back_populates="factura", cascade="all, delete-orphan"
    )


class DetalleFactura(Base):
    __tablename__ = "detalle_facturas"
    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_factura = Column(Integer, ForeignKey("facturas.id_factura"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=True)
    id_servicio = Column(Integer, ForeignKey("servicios.id_servicio"), nullable=True)
    descripcion = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(12, 2), nullable=False, default=0)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)

    factura = relationship("Factura", back_populates="detalles")


class Venta(Base):
    """
    Registro de una operación comercial (venta) realizada desde el sitio
    web. Es la fuente autoritativa para el historial de ventas, los
    reportes diarios y el dashboard de ventas. Cada venta puede generar,
    como máximo, una factura asociada (relación 1 a 1 opcional).
    """

    __tablename__ = "ventas"
    id_venta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_venta = Column(String(30), unique=True, nullable=False, index=True)
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_usuario_vendedor = Column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=True
    )
    fecha_venta = Column(TIMESTAMP, server_default=func.now())
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)
    descuento_porcentaje = Column(Numeric(5, 2), nullable=False, default=0)
    impuesto_porcentaje = Column(Numeric(5, 2), nullable=False, default=19)
    total = Column(Numeric(12, 2), nullable=False, default=0)
    estado = Column(
        Enum("pendiente", "completada", "anulada"),
        default="completada",
        nullable=False,
    )
    observaciones = Column(String(500), nullable=True)

    cliente = relationship("Usuario", foreign_keys=[id_cliente])
    usuario_vendedor = relationship("Usuario", foreign_keys=[id_usuario_vendedor])
    factura = relationship("Factura", back_populates="venta", uselist=False)
    detalles = relationship(
        "DetalleVenta", back_populates="venta", cascade="all, delete-orphan"
    )


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"
    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=True)
    id_servicio = Column(Integer, ForeignKey("servicios.id_servicio"), nullable=True)
    descripcion = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(12, 2), nullable=False, default=0)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)

    venta = relationship("Venta", back_populates="detalles")


class Pqr(Base):
    """Peticiones, Quejas y Reclamos registradas por los clientes."""

    __tablename__ = "pqr"
    id_pqr = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    tipo = Column(
        Enum("peticion", "queja", "reclamo", "sugerencia"), nullable=False
    )
    asunto = Column(String(150), nullable=False)
    descripcion = Column(String(1000), nullable=False)
    estado = Column(
        Enum("pendiente", "en_proceso", "respondida", "cerrada"),
        default="pendiente",
        nullable=False,
    )
    respuesta = Column(String(1000), nullable=True)
    id_usuario_responde = Column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=True
    )
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_respuesta = Column(TIMESTAMP, nullable=True)

    cliente = relationship("Usuario", foreign_keys=[id_cliente])
    usuario_responde = relationship("Usuario", foreign_keys=[id_usuario_responde])


class Conversacion(Base):
    """Hilo de conversación del chatbot (puede ser de un visitante anónimo)."""

    __tablename__ = "conversaciones"
    id_conversacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    nombre_visitante = Column(String(100), nullable=True)
    estado = Column(Enum("activa", "cerrada"), default="activa", nullable=False)
    fecha_inicio = Column(TIMESTAMP, server_default=func.now())

    usuario = relationship("Usuario", foreign_keys=[id_usuario])
    mensajes = relationship(
        "Mensaje", back_populates="conversacion", cascade="all, delete-orphan"
    )


class Mensaje(Base):
    __tablename__ = "mensajes"
    id_mensaje = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_conversacion = Column(
        Integer, ForeignKey("conversaciones.id_conversacion"), nullable=False
    )
    remitente = Column(Enum("usuario", "bot"), nullable=False)
    contenido = Column(String(2000), nullable=False)
    fecha_envio = Column(TIMESTAMP, server_default=func.now())

    conversacion = relationship("Conversacion", back_populates="mensajes")