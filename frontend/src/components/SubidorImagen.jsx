import React, { useRef, useState } from "react";
import { subirImagen, resolverUrlArchivo } from "../utils/api";

const EXTENSIONES_PERMITIDAS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANO_MAXIMO_MB = 5;

/**
 * Selector de imagen reutilizable para productos y servicios.
 * - Permite cargar un archivo desde el equipo local (no URLs externas).
 * - Valida formato y tamaño en el cliente antes de subir.
 * - Muestra una vista previa y sube el archivo al backend, entregando
 *   la ruta relativa (`onImagenSubida`) para guardarla en el producto/servicio.
 */
const SubidorImagen = ({ valor, onImagenSubida, label = "Imagen" }) => {
    const inputRef = useRef(null);
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState("");
    const [previaLocal, setPreviaLocal] = useState(null);

    const urlMostrada = previaLocal || resolverUrlArchivo(valor);

    const handleSeleccionar = () => inputRef.current?.click();

    const handleArchivo = async (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
        setError("");

        if (!EXTENSIONES_PERMITIDAS.includes(archivo.type)) {
            setError("Formato no permitido. Usa JPG, PNG, WEBP o GIF.");
            return;
        }
        if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
            setError(`La imagen supera el tamaño máximo permitido (${TAMANO_MAXIMO_MB} MB).`);
            return;
        }

        setPreviaLocal(URL.createObjectURL(archivo));

        try {
            setSubiendo(true);
            const resultado = await subirImagen(archivo);
            onImagenSubida(resultado.url);
        } catch (err) {
            setError(err.message || "No fue posible subir la imagen.");
            setPreviaLocal(null);
        } finally {
            setSubiendo(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleQuitar = () => {
        setPreviaLocal(null);
        onImagenSubida(null);
    };

    return (
        <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">{label}</label>
            <input
                ref={inputRef}
                type="file"
                accept={EXTENSIONES_PERMITIDAS.join(",")}
                onChange={handleArchivo}
                className="hidden"
            />

            <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {urlMostrada ? (
                        <img src={urlMostrada} alt="Vista previa" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-3xl text-gray-300">🖼️</span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={handleSeleccionar}
                        disabled={subiendo}
                        className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:opacity-50"
                    >
                        {subiendo ? "Subiendo..." : urlMostrada ? "Cambiar imagen" : "Cargar imagen"}
                    </button>
                    {urlMostrada && !subiendo && (
                        <button
                            type="button"
                            onClick={handleQuitar}
                            className="text-xs font-bold text-red-500 hover:text-red-700"
                        >
                            Quitar imagen
                        </button>
                    )}
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP o GIF · máx. {TAMANO_MAXIMO_MB} MB</p>
                </div>
            </div>

            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
};

export default SubidorImagen;
