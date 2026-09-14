"""
Utilidad de envío de correos transaccionales (recuperación de contraseña,
notificaciones, etc.) usando smtplib (librería estándar de Python).

Si no hay credenciales SMTP configuradas en el .env, el sistema entra en
"modo desarrollo": en vez de enviar el correo, imprime el contenido en la
consola del backend. Esto permite probar todo el flujo sin necesidad de
una cuenta de correo real.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM = os.getenv("SMTP_FROM", "no-reply@jhmtechsolutions.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "JHM Tech Solutions")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _enviar_correo(destinatario: str, asunto: str, html: str, texto_plano: str) -> None:
    if not SMTP_HOST:
        # Modo desarrollo: no hay SMTP configurado, se imprime en consola.
        print(
            "\n" + "=" * 70 +
            f"\n[EMAIL - MODO DESARROLLO] Para: {destinatario}"
            f"\nAsunto: {asunto}\n\n{texto_plano}\n" + "=" * 70 + "\n"
        )
        return

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM}>"
    mensaje["To"] = destinatario
    mensaje.attach(MIMEText(texto_plano, "plain"))
    mensaje.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as servidor:
        servidor.starttls()
        if SMTP_USER and SMTP_PASSWORD:
            servidor.login(SMTP_USER, SMTP_PASSWORD)
        servidor.sendmail(SMTP_FROM, [destinatario], mensaje.as_string())


def enviar_correo_recuperacion(
    destinatario: str, nombre: str, token: str, minutos_expiracion: int
) -> None:
    enlace = f"{FRONTEND_URL}/recuperar-contrasena?token={token}"

    texto_plano = (
        f"Hola {nombre},\n\n"
        "Recibimos una solicitud para restablecer tu contraseña en "
        "JHM Tech Solutions.\n\n"
        f"Ingresa al siguiente enlace para crear una nueva contraseña "
        f"(válido por {minutos_expiracion} minutos):\n{enlace}\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje; "
        "tu contraseña actual seguirá funcionando con normalidad.\n\n"
        "— Equipo de JHM Tech Solutions"
    )

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#1d4ed8;">Recuperación de contraseña</h2>
        <p>Hola <strong>{nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña en
        <strong>JHM Tech Solutions</strong>.</p>
        <p style="text-align:center; margin: 28px 0;">
            <a href="{enlace}"
               style="background:#2563eb; color:#fff; padding:12px 24px;
                      border-radius:8px; text-decoration:none; font-weight:bold;">
                Restablecer contraseña
            </a>
        </p>
        <p style="color:#6b7280; font-size: 13px;">
            Este enlace es válido por {minutos_expiracion} minutos. Si no
            solicitaste este cambio, puedes ignorar este correo.
        </p>
    </div>
    """

    _enviar_correo(
        destinatario,
        "Recuperación de contraseña - JHM Tech Solutions",
        html,
        texto_plano,
    )


def enviar_correo_bienvenida_empleado(
    destinatario: str, nombre: str, password_temporal: str
) -> None:
    enlace = f"{FRONTEND_URL}/iniciar-sesion"
    texto_plano = (
        f"Hola {nombre},\n\n"
        "Se ha creado una cuenta de empleado para ti en JHM Tech Solutions.\n\n"
        f"Correo: {destinatario}\nContraseña temporal: {password_temporal}\n\n"
        f"Ingresa en {enlace} y cambia tu contraseña lo antes posible.\n\n"
        "— Equipo de JHM Tech Solutions"
    )
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#1d4ed8;">¡Bienvenido a JHM Tech Solutions!</h2>
        <p>Hola <strong>{nombre}</strong>,</p>
        <p>Se ha creado una cuenta de <strong>empleado</strong> para ti.</p>
        <p><strong>Correo:</strong> {destinatario}<br/>
           <strong>Contraseña temporal:</strong> {password_temporal}</p>
        <p style="text-align:center; margin: 28px 0;">
            <a href="{enlace}"
               style="background:#2563eb; color:#fff; padding:12px 24px;
                      border-radius:8px; text-decoration:none; font-weight:bold;">
                Iniciar sesión
            </a>
        </p>
        <p style="color:#6b7280; font-size: 13px;">
            Por seguridad, cambia esta contraseña temporal apenas inicies sesión.
        </p>
    </div>
    """
    _enviar_correo(
        destinatario, "Bienvenido a JHM Tech Solutions", html, texto_plano
    )
