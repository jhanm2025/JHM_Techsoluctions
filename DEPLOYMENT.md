# Guía de despliegue en Railway — JHM Tech Solutions

> **Nota importante:** esta guía te permite desplegar el proyecto tú mismo.
> No fue posible ejecutar el despliegue de forma automática porque requiere
> una cuenta personal de Railway, acceso a tu repositorio de GitHub y
> credenciales que no debemos manejar por ti (por seguridad). Los archivos
> de configuración (`Procfile`, `railway.json`, `.env.example`) ya están
> listos en el proyecto para que el proceso sea lo más simple posible.

## 0. Requisitos previos

- Cuenta en [GitHub](https://github.com) con el proyecto subido a un repositorio.
- Cuenta en [Railway](https://railway.app) (puedes registrarte con tu cuenta de GitHub).
- (Opcional) Cuenta de correo con contraseña de aplicación para SMTP.
- (Opcional) API Key de [OpenAI](https://platform.openai.com/api-keys) para el chatbot con IA.

## 1. Sube el proyecto a GitHub

```bash
cd "JHM_Tech_Solutions Python_FASTAPI"
git add .
git commit -m "Preparar proyecto para despliegue en Railway"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

⚠️ **Antes de subir**, verifica que `backend/.env` y `frontend/.env` **no**
aparezcan en `git status` (deben estar ignorados). Si ya los tenías
versionados de una sesión anterior, ejecuta:
```bash
git rm --cached backend/.env frontend/.env
```

## 2. Crea la base de datos en Railway

1. Entra a [railway.app](https://railway.app) → **New Project**.
2. Selecciona **Provision MySQL** (o el motor que prefieras; el proyecto
   usa `PyMySQL`, así que MySQL es lo más directo).
3. Cuando el servicio de MySQL esté listo, abre su pestaña **Variables** y
   copia el valor de `MYSQL_URL` (o arma la cadena con `MYSQLHOST`,
   `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`).
4. La cadena que necesita el backend tiene este formato:
   ```
   mysql+pymysql://usuario:password@host:puerto/nombre_bd
   ```
   (Railway te da la URL en formato `mysql://...`; solo agrega `+pymysql`
   después de `mysql`).

## 3. Despliega el backend (FastAPI)

1. En el mismo proyecto de Railway → **New Service → GitHub Repo** → selecciona tu repositorio.
2. En **Settings → Root Directory**, escribe: `backend`
3. Railway detectará `requirements.txt` y `Procfile`/`railway.json`
   automáticamente (usa Nixpacks).
4. Ve a **Variables** y agrega, una por una, las mismas variables de
   `backend/.env.example`, con tus valores reales:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | La cadena `mysql+pymysql://...` del paso 2 |
   | `SECRET_KEY` | Genera una aleatoria larga (ver comando abajo) |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
   | `RESET_TOKEN_EXPIRE_MINUTES` | `30` |
   | `ADMIN_EMAIL` | El correo que quieras para el admin |
   | `ADMIN_PASSWORD` | Una contraseña segura |
   | `ADMIN_DOCUMENTO` | Cualquier número (ej: `1000000000`) |
   | `FRONTEND_URL` | La URL del frontend (la sabrás en el paso 4; puedes dejarla como `http://localhost:5173` y actualizarla después) |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_FROM_NAME` | Tus credenciales SMTP (opcional; sin esto el correo se imprime en logs) |
   | `OPENAI_API_KEY` | Tu clave de OpenAI (opcional; sin esto el chatbot usa respuestas por reglas) |
   | `OPENAI_MODEL` | `gpt-4o-mini` |

   Para generar un `SECRET_KEY` aleatorio:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(48))"
   ```

5. Railway asignará un dominio público (**Settings → Networking →
   Generate Domain**). Copia esa URL (ej: `https://tu-backend.up.railway.app`).
6. Al iniciar, la API crea automáticamente las tablas y el usuario
   administrador (revisa los **Logs** del servicio para confirmarlo).

## 4. Despliega el frontend (React + Vite)

1. En el mismo proyecto → **New Service → GitHub Repo** → mismo repositorio.
2. En **Settings → Root Directory**, escribe: `frontend`
3. En **Variables**, agrega:

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | La URL del backend que copiaste en el paso 3.5 (sin `/` al final) |

4. Railway ejecutará `npm install && npm run build` y luego `npm run start`
   (que sirve el sitio con `vite preview` en el puerto asignado).
5. Genera el dominio público del frontend (**Settings → Networking →
   Generate Domain**).

## 5. Conecta ambos servicios (CORS)

1. Vuelve al servicio del **backend** → **Variables**.
2. Actualiza `FRONTEND_URL` con la URL real del frontend
   (ej: `https://tu-frontend.up.railway.app`).
3. Railway reiniciará el servicio automáticamente. Esto es necesario para
   que el backend acepte peticiones CORS desde tu dominio de producción.

## 6. Prueba el sistema desplegado

- Abre la URL del frontend.
- Inicia sesión con el `ADMIN_EMAIL`/`ADMIN_PASSWORD` que configuraste.
- Verifica: catálogo público, login, paneles por rol, generación de una
  venta/factura, un PQR, y el chatbot.
- Revisa los **Logs** de ambos servicios en Railway si algo falla — los
  errores de CORS, base de datos o variables faltantes aparecen ahí.

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| El frontend no puede llamar al backend (error de red/CORS) | `VITE_API_URL` mal configurada o `FRONTEND_URL` desactualizada | Revisa ambas variables y que no tengan `/` al final |
| Error 500 al iniciar sesión | `DATABASE_URL` incorrecta o la base de datos no está lista | Verifica la cadena de conexión y que el servicio MySQL esté "Active" |
| El chatbot solo da respuestas genéricas | No configuraste `OPENAI_API_KEY` | Es el comportamiento esperado (modo por reglas); agrega la clave si quieres respuestas con IA |
| No llegan correos reales | `SMTP_HOST` vacío | Es el modo desarrollo esperado; configura SMTP real (ver `GUIA_DE_CAMBIOS.md`) |
