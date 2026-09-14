"""
Integración del chatbot con un servicio de Inteligencia Artificial
(OpenAI API). La clave de acceso se configura mediante la variable de
entorno OPENAI_API_KEY (nunca se escribe en el código fuente).

Si la variable no está configurada, el chatbot sigue funcionando con un
motor de respuestas basado en reglas (palabras clave), en modo
"desarrollo/demo", de forma consistente con el resto del proyecto
(ver app/email_utils.py para el mismo patrón aplicado al correo).
"""

import os

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """Eres el asistente virtual de JHM Tech Solutions, una empresa \
colombiana de soluciones tecnológicas (productos de hardware/software y \
servicios de asesoría, consultoría, desarrollo, implementación y soporte TI).

Tu trabajo:
- Responder preguntas frecuentes sobre la empresa, sus productos y servicios.
- Orientar sobre el proceso de compra (catálogo en /productos y /servicios).
- Explicar cómo registrar una Petición, Queja o Reclamo (PQR) desde el panel \
del cliente, y orientar sobre su seguimiento.
- Ser breve, claro, amable y profesional. Responde en español.
- Si no tienes información suficiente para responder algo específico de un \
pedido o factura, sugiere que el cliente inicie sesión y consulte su panel, \
o registre una PQR para que un asesor humano lo atienda.
- No inventes precios ni datos específicos que no te den como contexto."""


def _respuesta_basada_en_reglas(mensaje: str) -> str:
    """Motor de respuestas simple basado en palabras clave (modo sin IA)."""
    texto = mensaje.lower()

    if any(p in texto for p in ["hola", "buenas", "buenos días", "buenas tardes"]):
        return (
            "¡Hola! Soy el asistente virtual de JHM Tech Solutions 🤖. "
            "Puedo ayudarte con información sobre nuestros productos, servicios, "
            "el proceso de compra o el registro de una PQR. ¿En qué te ayudo hoy?"
        )
    if any(p in texto for p in ["producto", "catalogo", "catálogo"]):
        return (
            "Puedes consultar nuestro catálogo completo de productos en la "
            "sección 'Productos' del sitio web. Si tienes dudas sobre alguno "
            "en particular, dime el nombre y te oriento."
        )
    if "servicio" in texto:
        return (
            "Ofrecemos servicios de asesoría, consultoría, desarrollo, "
            "implementación y soporte TI. Puedes verlos todos en la sección "
            "'Servicios' del sitio, filtrando por categoría."
        )
    if any(p in texto for p in ["pqr", "queja", "reclamo", "petición", "peticion", "sugerencia"]):
        return (
            "Puedes registrar tu Petición, Queja o Reclamo desde tu panel de "
            "cliente, en la pestaña 'Mis PQR'. Allí también podrás consultar "
            "el estado (pendiente, en proceso, respondida o cerrada)."
        )
    if any(p in texto for p in ["factura", "compra", "pedido"]):
        return (
            "Puedes consultar y descargar tus facturas desde tu panel de "
            "cliente, en la pestaña 'Mis facturas'. Si necesitas ayuda con un "
            "pedido específico, te recomiendo registrar una PQR."
        )
    if any(p in texto for p in ["precio", "costo", "cuanto vale", "cuánto vale"]):
        return (
            "Los precios varían según el producto o servicio, e incluyen el "
            "19% de IVA. Puedes verlos en detalle en el catálogo público, o "
            "contactarnos para una cotización personalizada."
        )
    if any(p in texto for p in ["gracias", "listo", "vale", "ok"]):
        return "¡Con gusto! Si necesitas algo más, aquí estaré. 😊"

    return (
        "Gracias por tu mensaje. Puedo ayudarte con información sobre "
        "productos, servicios, el proceso de compra o el registro de una "
        "PQR. Si tu consulta es más específica, te recomiendo registrar una "
        "PQR desde tu panel para que un asesor te contacte directamente."
    )


def generar_respuesta_chatbot(mensaje: str, historial: list[dict]) -> tuple[str, str]:
    """
    Genera una respuesta del chatbot para el mensaje del usuario.
    Retorna (respuesta, fuente) donde fuente es 'ia' o 'reglas'.
    `historial` es una lista de {"role": "user"|"assistant", "content": str}
    con los últimos mensajes de la conversación (para dar contexto a la IA).
    """
    if not OPENAI_API_KEY:
        return _respuesta_basada_en_reglas(mensaje), "reglas"

    try:
        from openai import OpenAI

        cliente = OpenAI(api_key=OPENAI_API_KEY)
        mensajes = [{"role": "system", "content": SYSTEM_PROMPT}]
        mensajes.extend(historial[-10:])
        mensajes.append({"role": "user", "content": mensaje})

        respuesta = cliente.chat.completions.create(
            model=OPENAI_MODEL,
            messages=mensajes,
            max_tokens=350,
            temperature=0.6,
        )
        texto = respuesta.choices[0].message.content.strip()
        return texto, "ia"
    except Exception as error:  # pragma: no cover
        print(f"[chatbot] Error al llamar al servicio de IA: {error}")
        return _respuesta_basada_en_reglas(mensaje), "reglas"
