CREATE DATABASE IF NOT EXISTS bd_jhm_tech_solutions_fastapi
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bd_jhm_tech_solutions_fastapi;

-- ROLES DEL SISTEMA
CREATE TABLE roles (
    id_rol INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- PERMISOS DEL SISTEMA
CREATE TABLE permisos (
    id_permiso INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    modulo VARCHAR(100),
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- RELACIÓN ROLES - PERMISOS
CREATE TABLE rol_permiso (
    id_rol INT UNSIGNED NOT NULL,
    id_permiso INT UNSIGNED NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_rol, id_permiso),

    CONSTRAINT fk_rol_permiso_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_rol_permiso_permiso
        FOREIGN KEY (id_permiso)
        REFERENCES permisos(id_permiso)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- USUARIOS
CREATE TABLE usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_rol INT UNSIGNED NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento ENUM('CC','CE','TI','PASAPORTE','NIT') NOT NULL,
    numero_documento VARCHAR(30) NOT NULL UNIQUE,
    direccion VARCHAR(200),
    telefono VARCHAR(30),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    foto VARCHAR(255),
    estado ENUM('activo','inactivo','bloqueado') DEFAULT 'activo',
    ultimo_acceso DATETIME NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- SERVICIOS
CREATE TABLE servicios (
    id_servicio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    tipo_servicio ENUM(
        'asesoria',
        'consultoria',
        'desarrollo',
        'implementacion',
        'soporte',
        'personalizado'
    ) NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_corta VARCHAR(255),
    precio_minimo DECIMAL(12,2) DEFAULT 0,
    precio_maximo DECIMAL(12,2) DEFAULT 0,
    modalidad ENUM(
        'presencial',
        'remoto',
        'hibrido'
    ) DEFAULT 'remoto',
    imagen VARCHAR(255),
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- PRODUCTOS
CREATE TABLE productos (
    id_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT UNSIGNED NULL,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock INT DEFAULT 0,
    imagen VARCHAR(255),
    marca VARCHAR(100),
    referencia VARCHAR(100),
    estado ENUM('activo','inactivo','agotado') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_producto_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ASESORÍAS / SOLICITUDES DE LOS CLIENTES
CREATE TABLE asesorias (
    id_asesoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NULL,
    id_servicio INT UNSIGNED NULL,

    nombre_cliente VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),

    empresa VARCHAR(150),
    tipo_asesoria VARCHAR(100),
    asunto VARCHAR(200),
    descripcion TEXT NOT NULL,

    modalidad ENUM(
        'presencial',
        'remoto',
        'hibrido'
    ) DEFAULT 'remoto',

    fecha_solicitada DATETIME NULL,

    estado ENUM(
        'pendiente',
        'contactado',
        'en_proceso',
        'finalizada',
        'cancelada'
    ) DEFAULT 'pendiente',

    prioridad ENUM(
        'baja',
        'media',
        'alta',
        'urgente'
    ) DEFAULT 'media',

    observaciones TEXT,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_asesoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_asesoria_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- TOKENS DE RECUPERACIÓN DE CONTRASEÑA
CREATE TABLE password_resets (
    id_reset INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,

    CONSTRAINT fk_reset_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- VENTAS
-- Registro de la operación comercial (fuente autoritativa para el
-- historial de ventas, reportes diarios y dashboard de ventas).
CREATE TABLE ventas (
    id_venta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    numero_venta VARCHAR(30) NOT NULL UNIQUE,
    id_cliente INT UNSIGNED NOT NULL,
    id_usuario_vendedor INT UNSIGNED NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
    impuesto_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 19,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('pendiente','completada','anulada') NOT NULL DEFAULT 'completada',
    observaciones VARCHAR(500),

    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_venta_vendedor
        FOREIGN KEY (id_usuario_vendedor) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- DETALLE DE VENTAS
CREATE TABLE detalle_ventas (
    id_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_venta INT UNSIGNED NOT NULL,
    id_producto INT UNSIGNED NULL,
    id_servicio INT UNSIGNED NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_detalle_venta_servicio
        FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- FACTURAS
-- La factura es el documento fiscal generado (opcionalmente) a partir
-- de una venta. id_venta es único y nullable: permite tanto facturas
-- generadas automáticamente desde /ventas/ como facturas creadas de
-- forma independiente mediante /facturas/ (flexibilidad para pruebas).
CREATE TABLE facturas (
    id_factura INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(30) NOT NULL UNIQUE,
    id_venta INT UNSIGNED NULL UNIQUE,
    id_cliente INT UNSIGNED NOT NULL,
    id_usuario_emisor INT UNSIGNED NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
    impuesto_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 19,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('pendiente','pagada','anulada') NOT NULL DEFAULT 'pendiente',
    observaciones VARCHAR(500),

    CONSTRAINT fk_factura_venta
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_factura_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_factura_emisor
        FOREIGN KEY (id_usuario_emisor) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- DETALLE DE FACTURAS
CREATE TABLE detalle_facturas (
    id_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_factura INT UNSIGNED NOT NULL,
    id_producto INT UNSIGNED NULL,
    id_servicio INT UNSIGNED NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_detalle_factura
        FOREIGN KEY (id_factura) REFERENCES facturas(id_factura)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_detalle_servicio
        FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- PQR (Peticiones, Quejas y Reclamos)
CREATE TABLE pqr (
    id_pqr INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT UNSIGNED NOT NULL,
    tipo ENUM('peticion','queja','reclamo','sugerencia') NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    estado ENUM('pendiente','en_proceso','respondida','cerrada') NOT NULL DEFAULT 'pendiente',
    respuesta VARCHAR(1000),
    id_usuario_responde INT UNSIGNED NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME NULL,

    CONSTRAINT fk_pqr_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pqr_responde
        FOREIGN KEY (id_usuario_responde) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- CONVERSACIONES DEL CHATBOT
-- id_usuario es NULL cuando la conversación proviene de un visitante
-- anónimo (sin sesión iniciada).
CREATE TABLE conversaciones (
    id_conversacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NULL,
    nombre_visitante VARCHAR(100) NULL,
    estado ENUM('activa','cerrada') NOT NULL DEFAULT 'activa',
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversacion_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- MENSAJES DEL CHATBOT
CREATE TABLE mensajes (
    id_mensaje INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_conversacion INT UNSIGNED NOT NULL,
    remitente ENUM('usuario','bot') NOT NULL,
    contenido VARCHAR(2000) NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mensaje_conversacion
        FOREIGN KEY (id_conversacion) REFERENCES conversaciones(id_conversacion)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- DATOS INICIALES (ROLES Y PERMISOS)
-- ---------------------------------------------------------------------------
-- Los roles "admin", "empleado" y "cliente", junto con el usuario
-- administrador por defecto, se crean automáticamente al iniciar la API
-- (ver backend/app/seed.py). Esto evita guardar contraseñas ya cifradas
-- (hashes de bcrypt) directamente en este script SQL.
--
-- Si prefieres crearlos manualmente desde SQL, puedes usar:
--
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador con acceso total al sistema'),
('empleado', 'Gestiona productos, servicios y solicitudes de clientes'),
('cliente', 'Usuario final que consulta productos, servicios y solicita asesorías');
--
-- Credenciales del administrador por defecto (creadas por app/seed.py):
--   email:    admin@jhmtechsolutions.com
--   password: Admin123!
-- (Cámbialas apenas inicies sesión por primera vez).

-- PERMISOS BASE POR MÓDULO
INSERT INTO permisos (nombre, descripcion, modulo) VALUES
    ('usuarios.ver', 'Ver usuarios del sistema', 'usuarios'),
    ('usuarios.gestionar', 'Crear, editar y cambiar el rol/estado de usuarios', 'usuarios'),
    ('productos.ver', 'Ver productos', 'productos'),
    ('productos.gestionar', 'Crear, editar y desactivar productos', 'productos'),
    ('servicios.ver', 'Ver servicios', 'servicios'),
    ('servicios.gestionar', 'Crear, editar y desactivar servicios', 'servicios'),
    ('asesorias.ver', 'Ver solicitudes de asesoría', 'asesorias'),
    ('asesorias.gestionar', 'Gestionar el estado de las solicitudes de asesoría', 'asesorias');