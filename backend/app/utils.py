import re
import unicodedata


def slugify(texto: str) -> str:
    """Convierte un texto en un slug URL-friendly (sin tildes ni caracteres especiales)."""
    texto = unicodedata.normalize("NFKD", texto)
    texto = texto.encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    texto = re.sub(r"-+", "-", texto).strip("-")
    return texto or "item"


def generar_slug_unico(db, modelo, nombre: str, id_excluir: int | None = None) -> str:
    """Genera un slug único para un modelo dado, agregando un sufijo numérico si ya existe."""
    base = slugify(nombre)
    slug = base
    contador = 1
    columna_id = list(modelo.__table__.primary_key.columns)[0]
    while True:
        query = db.query(modelo).filter(modelo.slug == slug)
        if id_excluir is not None:
            query = query.filter(columna_id != id_excluir)
        if not query.first():
            return slug
        contador += 1
        slug = f"{base}-{contador}"


# ---------------------------------------------------------------------------
# VALIDACIÓN DE CONTRASEÑAS SEGURAS
# ---------------------------------------------------------------------------

REGLAS_PASSWORD = (
    "La contraseña debe tener mínimo 8 caracteres e incluir al menos una "
    "letra mayúscula, una minúscula, un número y un carácter especial "
    "(por ejemplo: @, #, $, %, &)."
)


def validar_password_fuerte(password: str) -> str:
    """
    Valida que una contraseña cumpla las reglas de seguridad del sistema.
    Lanza ValueError con un mensaje claro si no las cumple; de lo
    contrario, retorna la misma contraseña (para usarse como validador
    de Pydantic).
    """
    if len(password) < 8:
        raise ValueError(REGLAS_PASSWORD)
    if not re.search(r"[A-Z]", password):
        raise ValueError(REGLAS_PASSWORD)
    if not re.search(r"[a-z]", password):
        raise ValueError(REGLAS_PASSWORD)
    if not re.search(r"[0-9]", password):
        raise ValueError(REGLAS_PASSWORD)
    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError(REGLAS_PASSWORD)
    return password


def generar_password_temporal() -> str:
    """Genera una contraseña temporal segura para nuevos empleados."""
    import secrets
    import string

    alfabeto = string.ascii_letters + string.digits
    base = "".join(secrets.choice(alfabeto) for _ in range(10))
    return f"{base}#1"


# ---------------------------------------------------------------------------
# IVA (Colombia) - 19%
# ---------------------------------------------------------------------------

IVA_PORCENTAJE_COLOMBIA = 19


def calcular_iva(precio_base) -> dict:
    """
    Calcula el desglose de IVA (19% Colombia) para un precio base.
    Retorna un diccionario con precio_base, iva_porcentaje, valor_iva y
    precio_total, todo redondeado a 2 decimales.
    """
    from decimal import Decimal, ROUND_HALF_UP

    base = Decimal(str(precio_base or 0))
    porcentaje = Decimal(str(IVA_PORCENTAJE_COLOMBIA))
    valor_iva = (base * porcentaje / Decimal("100")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    total = (base + valor_iva).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return {
        "precio_base": float(base),
        "iva_porcentaje": float(porcentaje),
        "valor_iva": float(valor_iva),
        "precio_total": float(total),
    }
