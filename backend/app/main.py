from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import Base, engine
from .routes import usuarios, auth, productos, servicios, facturas, reportes, uploads, ventas, pqr, chatbot
from .seed import run_seed
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API JHM Tech Solutions",
    version="1.4.0"
)

_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({"http://localhost:5173", _frontend_url}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(uploads.DIRECTORIO_UPLOADS, exist_ok=True)
app.mount("/archivos", StaticFiles(directory=uploads.DIRECTORIO_UPLOADS), name="archivos")


@app.on_event("startup")
def sembrar_datos_iniciales():
    """Crea roles básicos (admin, empleado, cliente) y un usuario admin
    por defecto la primera vez que se levanta la API."""
    try:
        run_seed()
    except Exception as error:  # pragma: no cover
        # No detiene el arranque de la API si la siembra falla
        # (por ejemplo, si la base de datos aún no está lista).
        print(f"[seed] No fue posible sembrar datos iniciales: {error}")


app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(productos.router)
app.include_router(servicios.router)
app.include_router(ventas.router)
app.include_router(facturas.router)
app.include_router(reportes.router)
app.include_router(uploads.router)
app.include_router(pqr.router)
app.include_router(chatbot.router)


@app.get("/")
def inicio():
    return {
        "success": True,
        "message": "API funcionando correctamente"
    }