# Guía de mejoras — JHM Tech Solutions (FastAPI + React)

## -2. Cuarta ronda de mejoras (Quinto Avance — más reciente)

- **Módulo de Ventas** (nuevo, entidad separada de Facturas):
  - Tablas `ventas` y `detalle_ventas`. Cada venta puede generar
    automáticamente su factura asociada (`facturas.id_venta`, 1 a 1).
  - `POST /ventas/` registra la venta y genera la factura en la misma
    operación. `GET /ventas/` (historial con filtros por fecha, cliente,
    estado y texto). `PATCH /ventas/{id}/estado`.
  - Reporte diario de ventas (`GET /ventas/reporte/diario`, JSON) y
    reportes en PDF/Excel por rango de fechas, con logo corporativo.
  - Frontend: pestaña "Ventas" en Admin/Empleado (`VentasPanel.jsx` +
    `ModalVenta.jsx`). La pestaña "Facturas" pasó a ser de solo consulta
    y exportación (la creación ahora se hace desde Ventas).
- **Módulo PQR** (Peticiones, Quejas, Reclamos y Sugerencias):
  - Tabla `pqr`. El cliente registra y consulta las suyas
    (`components/panels/MisPqr.jsx`, pestaña "Mis PQR"); admin/empleado
    ven todas, filtran por estado y responden (`PqrPanel.jsx`).
  - Nuevo KPI "PQR pendientes" en el dashboard (visible para admin y empleado).
- **Chatbot con Inteligencia Artificial**:
  - Tablas `conversaciones` y `mensajes`. Integración con la API de OpenAI
    (`app/chatbot_ai.py`), con **modo de respaldo basado en reglas** si no
    se configura `OPENAI_API_KEY` (igual que el patrón ya usado para el
    correo). Funciona para visitantes anónimos y usuarios autenticados.
  - Widget flotante (`components/ChatbotWidget.jsx`) visible en todo el
    sitio público y en el panel de cliente.
- **Dashboard por rol ampliado**:
  - La fuente de datos del dashboard pasó de `Factura` a `Venta` (la
    entidad correcta según el modelo de negocio).
  - Nuevos KPIs: `total_usuarios` (solo visible para admin),
    `total_pqr` / `pqr_pendientes` (visibles para admin y empleado).
  - Mini-dashboard en el panel de Cliente: compras realizadas, total
    invertido y PQR pendientes propias.
- **Seguridad reforzada**:
  - Se detectó y corrigió que `backend/.env` estaba versionado en git sin
    ignorar — se removió del control de versiones, se agregó al
    `.gitignore`, y se crearon plantillas seguras `backend/.env.example`
    y `frontend/.env.example` (sin credenciales reales) para subir a GitHub.
  - Se limpiaron archivos `__pycache__` y un archivo de imagen de prueba
    que se habían colado al repositorio.
- **Preparado para despliegue (Railway)**:
  - `backend/Procfile` y `backend/railway.json` (arranque con `uvicorn`).
  - `frontend/railway.json` (build + `vite preview` como servidor estático)
    y `frontend/vite.config.js` ajustado (`preview.allowedHosts`) para
    aceptar el dominio dinámico de Railway.
  - La URL del backend en el frontend ahora es configurable vía
    `VITE_API_URL` (antes estaba fija a `http://127.0.0.1:8000` en dos
    archivos: `utils/api.js` y `modales/ModalRegister.jsx`).
  - Ver `DEPLOYMENT.md` en la raíz del proyecto para la guía paso a paso.
  - **Importante:** no fue posible ejecutar el despliegue real (requiere
    tus propias cuentas de GitHub/Railway y credenciales); la guía te
    permite hacerlo tú mismo con los archivos ya preparados.
- **Colección de Postman**: `JHM_Tech_Solutions_API.postman_collection.json`
  en la raíz del proyecto, con 53 requests organizadas en 11 carpetas
  (Auth, Usuarios, Empleados, Productos, Servicios, Uploads, Ventas,
  Facturas, PQR, Chatbot, Reportes y Dashboard). El login guarda el token
  automáticamente en una variable de colección para encadenar peticiones.
- **Limpieza**: se eliminaron nuevamente `modales/ModalProductos.jsx` y
  `modales/ModalServicios.jsx` (stubs vacíos que habían reaparecido).

## -1. Tercera ronda de mejoras

- **Usuario autenticado visible en el navbar**: el `Header` del sitio público
  ahora muestra el nombre completo y el rol del usuario autenticado (desktop y
  móvil), actualizándose dinámicamente según la sesión (`AuthContext`).
- **Productos y servicios del panel administrativo visibles en el sitio público**:
  - `pages/Productos.jsx` y el catálogo de `pages/Servicios.jsx` ahora consumen
    `GET /productos/?estado=activo` y `GET /servicios/?estado=activo` en vez de
    datos hardcodeados. Las categorías de los filtros se calculan dinámicamente
    a partir de los datos reales, evitando duplicar información.
  - Se conservó el modal de detalle existente para productos
    (`components/ModalProducto.jsx`), adaptado para mostrar imagen real e IVA.
  - Se creó `components/ModalServicio.jsx`, un modal reutilizable con el mismo
    diseño/UX, para el detalle de servicios (antes no existía).
- **Carga de imágenes desde el equipo local**:
  - Nuevo endpoint `POST /uploads/imagen` (admin/empleado) que valida formato
    (jpg/png/webp/gif) y tamaño (máx. 5 MB), y almacena el archivo en el
    servidor (`backend/uploads/`), sirviéndolo desde `/archivos/...`.
  - Nuevo componente `components/SubidorImagen.jsx`, reutilizado en
    `ProductosPanel` y `ServiciosPanel`, que reemplaza el campo de "URL de
    imagen" por un selector de archivo con vista previa y validación en el
    cliente. Ya no se depende de URLs externas.
  - La imagen se muestra tanto en las tablas del panel administrativo como en
    el sitio público y el catálogo del panel de cliente.
- **IVA del 19% (Colombia)**:
  - `backend/app/utils.py -> calcular_iva()` es la fuente única de verdad;
    `frontend/src/utils/iva.js -> calcularIva()` replica el mismo cálculo.
  - `ProductoResponse`/`ServicioResponse` ahora incluyen campos calculados
    (`iva_porcentaje`, `valor_iva`, `precio_total` / `precio_minimo_con_iva`,
    `precio_maximo_con_iva`), y `FacturaResponse` incluye
    `valor_descuento`, `base_gravable` y `valor_iva`.
  - El precio base, el IVA y el precio total se muestran diferenciados en
    tablas administrativas, catálogo público, panel de cliente y facturas.
- **Reportes PDF/Excel con logo corporativo**: todos los reportes
  (`app/reportes_utils.py`) y las facturas (`app/facturas_pdf.py`) ahora
  incluyen el logo de la empresa, el nombre de quien generó el reporte y el
  periodo consultado. Las facturas en PDF muestran también el empleado que
  las emitió. Los reportes de productos/servicios incluyen el desglose de IVA.
- **Dashboard administrativo con analítica**: nuevo endpoint
  `GET /reportes/dashboard` (con filtros `fecha_desde`, `fecha_hasta`,
  `categoria`) que calcula KPIs (ventas totales, N° de ventas, ticket
  promedio, IVA generado, descuentos, productos/servicios activos, clientes
  registrados, inventario bajo/agotado), series (ventas por periodo, ventas
  por categoría) y rankings (productos más vendidos, servicios más
  solicitados). En el frontend, `components/panels/DashboardPanel.jsx` (usando
  `recharts`) presenta esta información con cards, gráfico de líneas, gráfico
  de torta, gráficos de barras y tablas resumen — es ahora la primera pestaña
  de los paneles de Admin y Empleado.
- **Limpieza del frontend**: se eliminaron archivos sin uso: carpeta `Hooks/`
  (vacía), `modales/ModalProductos.jsx` (stub duplicado y vacío),
  `modales/ModalServicios.jsx` (reemplazado por `components/ModalServicio.jsx`),
  y assets sin referencias (`react.svg`, `vite.svg`, `logo2.png` duplicado,
  `favicon.svg`, `icons.svg`, `react_02-remo.png`, `react_03-remo.png`).
  `pages/Servicios.jsx` se redujo de 1183 a ~700 líneas al eliminar el catálogo
  hardcodeado (se conservaron íntegramente el hero, la sección de propuesta de
  valor y las secciones de cierre/CTA).

## 0. Segunda ronda de mejoras

- **Layout de paneles independiente**: Admin/Empleado/Cliente ya NO muestran el
  `Header` ni el `Footer` del sitio público. Cada panel tiene su propio `Sidebar`
  (`components/Sidebar.jsx`) con:
  - Logo de la empresa en la parte superior.
  - Navegación adaptada al rol.
  - Enlace **"Ir al sitio web"** (la sesión permanece activa: el `Header` público
    sigue mostrando "Mi panel" / "Cerrar sesión" al volver).
  - Datos del usuario y **"Cerrar sesión"** en la parte inferior del Sidebar.
- **Recuperación de contraseña con envío real de correo** (`app/email_utils.py`):
  ya no se expone el token en la respuesta del API; se envía por correo con un
  enlace `/recuperar-contrasena?token=...`. Si no hay SMTP configurado, el
  sistema entra en "modo desarrollo" e imprime el correo en la consola del backend.
- **Validación de contraseñas seguras** (mínimo 8 caracteres, mayúscula,
  minúscula, número y carácter especial), aplicada tanto en el backend
  (`app/utils.py -> validar_password_fuerte`, usada en los schemas con Pydantic)
  como en el frontend (`utils/validators.js`), con feedback en tiempo real.
- **Gestión de empleados desde el panel de administrador**:
  - Pestaña "Empleados" con tabla, activar/desactivar.
  - Modal reutilizable `modales/ModalEmpleado.jsx` con validaciones en tiempo
    real por campo (nombres, documento, correo, teléfono, contraseña).
  - El rol se asigna automáticamente como "empleado"; si no se define
    contraseña, se genera una temporal y se notifica por correo.
- **Reportes en PDF y Excel** (`reportlab` + `openpyxl`):
  - Endpoints `/reportes/usuarios`, `/reportes/empleados`, `/reportes/productos`,
    `/reportes/servicios` (cada uno con `/pdf` y `/excel`), con filtros por
    estado/categoría.
  - Pestaña "Reportes" en los paneles de Admin y Empleado
    (`components/panels/ReportesPanel.jsx`), con selector de entidad, filtros y
    botones de descarga.
- **Módulo de facturación**:
  - Modelos `Factura` / `DetalleFactura`, numeración automática
    (`FAC-000001`, `FAC-000002`, ...).
  - `POST /facturas/` calcula subtotal, descuento, impuesto y total a partir de
    los productos/servicios seleccionados.
  - `GET /facturas/{id}/pdf` genera la factura en PDF (reportlab) con datos del
    cliente, ítems, cantidades, precios, descuentos, impuestos y total.
  - `GET /facturas/exportar/excel` exporta el listado de facturas a Excel.
  - Un cliente solo puede ver/descargar **sus propias** facturas; admin y
    empleado ven todas y pueden generarlas (`modales/ModalFactura.jsx`,
    `components/panels/FacturasPanel.jsx`).
  - Pestaña "Mis facturas" en el panel de Cliente (solo lectura/descarga).
- **Seguridad**: CORS ahora también permite `FRONTEND_URL` desde `.env`;
  las contraseñas se siguen almacenando con `bcrypt`; todas las rutas nuevas
  están protegidas con `require_roles(...)`.
- Se corrigió un bug existente: `ModalRegister.jsx` redirigía a una ruta
  inexistente (`/Login`) tras el registro; ahora redirige a `/iniciar-sesion`.

## 1. Qué se agregó (primera ronda)

### Backend (FastAPI)
- **Autenticación real con JWT** (`app/auth.py`, `app/routes/auth.py`):
  - `POST /auth/login` – inicia sesión y devuelve un token.
  - `GET /auth/me` – perfil del usuario autenticado.
  - `POST /auth/forgot-password` – genera un token de recuperación.
  - `POST /auth/reset-password` – define una nueva contraseña con el token.
- **Permisos por rol** con `require_roles("admin", "empleado", ...)`, aplicados en cada endpoint sensible.
- **CRUD completo de Productos y Servicios** (`app/routes/productos.py`, `app/routes/servicios.py`):
  - Lectura pública (catálogo).
  - Creación/edición: `admin` y `empleado`.
  - Eliminación (baja lógica): solo `admin`.
- **Gestión de usuarios** (`app/routes/usuarios.py`):
  - `GET /usuarios/` (solo admin) – listar usuarios.
  - `PATCH /usuarios/{id}` (solo admin) – cambiar rol o estado (activo/inactivo/bloqueado).
  - `GET /usuarios/roles/lista` – roles disponibles.
- **Siembra automática de datos** (`app/seed.py`): al iniciar la API se crean los roles
  `admin`, `empleado`, `cliente` y un usuario administrador por defecto si no existen.
- **Base de datos**: se agregó la tabla `password_resets` y se documentaron los
  permisos base en `backend/basedatos/bd.sql`.

### Frontend (React + Vite + Tailwind)
- `context/AuthContext.jsx` + `utils/api.js`: manejo de sesión (token/rol) y llamadas a la API.
- `components/ProtectedRoute.jsx`: protege rutas según autenticación y rol.
- `pages/Login.jsx`: ahora se conecta al backend real (antes solo simulaba el login).
- `components/RecuperarContrasena.jsx`: flujo completo de recuperación de
  contraseña (antes el archivo existía pero estaba vacío y con el nombre corrupto).
- **Tres paneles nuevos**, reutilizando los mismos componentes y estilos del proyecto
  (`Boton`, `Input`, `Label`, paleta azul/gris, `rounded-2xl`, etc.):
  - `pages/admin/AdminDashboard.jsx` → Usuarios, Productos, Servicios.
  - `pages/empleado/EmpleadoDashboard.jsx` → Productos, Servicios (sin gestión de usuarios ni eliminar).
  - `pages/panelcliente.jsx` → Perfil + catálogo de productos/servicios (antes vacío).
- `components/DashboardLayout.jsx`: layout compartido (sidebar + topbar) para los 3 paneles.
- `components/panels/ProductosPanel.jsx`, `ServiciosPanel.jsx`, `UsuariosPanel.jsx`: CRUD reutilizable.
- `Header.jsx`: ahora muestra "Mi panel" / "Cerrar sesión" cuando hay sesión activa.

## 2. Matriz de permisos por rol

| Acción                          | Admin | Empleado | Cliente |
|----------------------------------|:-----:|:--------:|:-------:|
| Ver productos/servicios (catálogo) | ✅ | ✅ | ✅ |
| Crear/editar productos y servicios | ✅ | ✅ | ❌ |
| Eliminar (desactivar) productos/servicios | ✅ | ❌ | ❌ |
| Ver listado de usuarios | ✅ | ❌ | ❌ |
| Cambiar rol / estado de un usuario | ✅ | ❌ | ❌ |
| Registrar / activar / desactivar empleados | ✅ | ❌ | ❌ |
| Listar clientes (para facturar) | ✅ | ✅ | ❌ |
| Generar facturas | ✅ | ✅ | ❌ |
| Ver/descargar facturas propias | ✅ | ✅ | ✅ (solo las suyas) |
| Reportes de usuarios / empleados | ✅ | ❌ | ❌ |
| Reportes de productos / servicios / facturas | ✅ | ✅ | ❌ |
| Ver dashboard analítico (KPIs, gráficos) | ✅ | ✅ | ❌ |
| Cargar imágenes de productos/servicios | ✅ | ✅ | ❌ |
| Registrar ventas (genera factura automática) | ✅ | ✅ | ❌ |
| Ver historial de ventas / reportes de ventas | ✅ | ✅ | Solo las propias |
| Ver total de usuarios (KPI) | ✅ | ❌ | ❌ |
| Registrar una PQR | ✅ (como cualquier usuario) | ✅ (como cualquier usuario) | ✅ |
| Ver todas las PQR / responder | ✅ | ✅ | Solo las propias (sin responder) |
| Usar el chatbot | ✅ | ✅ | ✅ (incluso sin sesión) |
| Ver su propio perfil | ✅ | ✅ | ✅ |

## 3. Credenciales de acceso como administrador

Se crean automáticamente la primera vez que se levanta la API:

```
Correo:     admin@jhmtechsolutions.com
Contraseña: Admin123!
```

Puedes cambiarlas antes del primer arranque editando `backend/.env`
(`ADMIN_EMAIL`, `ADMIN_PASSWORD`), o cambiando la contraseña desde el
panel una vez inicies sesión. **Cámbiala en producción.**

## 4. Cómo ejecutar el proyecto

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload
```
La API queda en `http://127.0.0.1:8000` (documentación interactiva en `/docs`).
Al iniciar, se crean automáticamente los roles y el usuario administrador.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
La app queda en `http://localhost:5173`.

## 5. Notas importantes

- **Configurar el envío real de correos**: edita `backend/.env` con los datos de
  tu proveedor SMTP (por ejemplo Gmail con una "contraseña de aplicación",
  SendGrid, Amazon SES, etc.):
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=tu_correo@gmail.com
  SMTP_PASSWORD=tu_contraseña_de_aplicacion
  SMTP_FROM=tu_correo@gmail.com
  ```
  Si `SMTP_HOST` queda vacío, el sistema no falla: en su lugar imprime el
  correo (asunto + enlace) en la consola del backend, para que puedas probar
  el flujo de principio a fin sin credenciales reales.
- Los productos/servicios se eliminan mediante **baja lógica** (`estado = inactivo`)
  para conservar el historial, en vez de borrarse físicamente de la base de datos.
- Las páginas públicas `Servicios.jsx` y `Productos.jsx` siguen usando datos de
  ejemplo escritos en el propio archivo (no consumen la API todavía). Si quieres que
  el catálogo público también se alimente del backend (y así lo que gestionan
  admin/empleado se refleje ahí), es un siguiente paso recomendado.
- Los reportes y facturas requieren `reportlab` y `openpyxl` (ya incluidos en
  `requirements.txt`); instálalos con `pip install -r requirements.txt`.
- Los precios de los ítems en una factura se toman del precio actual del
  producto/servicio en el momento de generar la factura (no se pueden editar
  manualmente desde el modal, para evitar inconsistencias).
- Se corrigieron dos bugs previos: el archivo de "Recuperar contraseña" tenía un
  nombre de archivo corrupto (`RecuperarContrase#U00f1a.jsx`) y el import de la
  página de inicio (`./pages/index` vs `Index.jsx`) tenía una diferencia de
  mayúsculas que falla en sistemas de archivos sensibles a mayúsculas (Linux).
  Además, `ModalRegister.jsx` redirigía a una ruta inexistente tras el registro.
