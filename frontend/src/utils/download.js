import { API_URL, getToken } from "./api";

/**
 * Descarga un archivo (PDF/Excel) desde un endpoint protegido de la API,
 * disparando la descarga en el navegador con el nombre indicado.
 */
export async function descargarArchivo(path, nombreArchivo) {
    const token = getToken();
    const response = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
        let mensaje = "No fue posible generar el archivo.";
        try {
            const data = await response.json();
            mensaje = data.detail || mensaje;
        } catch (_) {
            // ignorar si la respuesta no es JSON
        }
        throw new Error(mensaje);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(url);
}
