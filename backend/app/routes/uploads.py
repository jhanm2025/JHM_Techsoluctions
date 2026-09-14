import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from ..auth import require_roles

router = APIRouter(prefix="/uploads", tags=["Archivos"])

DIRECTORIO_UPLOADS = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(DIRECTORIO_UPLOADS, exist_ok=True)

EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
TIPOS_MIME_PERMITIDOS = {"image/jpeg", "image/png", "image/webp", "image/gif"}
TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/imagen", dependencies=[Depends(require_roles("admin", "empleado"))])
async def subir_imagen(archivo: UploadFile = File(...)):
    """
    Sube una imagen (producto o servicio) al servidor y retorna la URL
    relativa donde quedó almacenada. Valida formato y tamaño máximo.
    """
    extension = os.path.splitext(archivo.filename or "")[1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato de archivo no permitido. Usa "
                f"{', '.join(sorted(EXTENSIONES_PERMITIDAS))}."
            ),
        )
    if archivo.content_type not in TIPOS_MIME_PERMITIDOS:
        raise HTTPException(
            status_code=400, detail="El archivo debe ser una imagen válida."
        )

    contenido = await archivo.read()
    if len(contenido) > TAMANO_MAXIMO_BYTES:
        raise HTTPException(
            status_code=400,
            detail="La imagen supera el tamaño máximo permitido (5 MB).",
        )
    if len(contenido) == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_destino = os.path.join(DIRECTORIO_UPLOADS, nombre_unico)
    with open(ruta_destino, "wb") as f:
        f.write(contenido)

    return {"url": f"/archivos/{nombre_unico}", "nombre_archivo": nombre_unico}
