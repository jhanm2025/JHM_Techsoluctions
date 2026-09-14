// Cliente centralizado para consumir la API de JHM Tech Solutions.
// La URL se toma de la variable de entorno VITE_API_URL (configurable en
// Railway/Vercel/etc. mediante el archivo .env del frontend). Si no está
// definida, se usa localhost para desarrollo.
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "jhm_token";
const USER_KEY = "jhm_user";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function saveSession(token, usuario) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Wrapper de fetch que agrega la URL base, el header de autenticación
 * (cuando hay sesión activa) y unifica el manejo de errores del backend.
 */
export async function apiFetch(path, { method = "GET", body, auth = true, headers = {} } = {}) {
    const finalHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
    };

    if (auth) {
        const token = getToken();
        if (token) {
            finalHeaders.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
        if (response.status === 401) {
            clearSession();
        }
        const mensaje =
            (data && typeof data.detail === "string" && data.detail) ||
            (data && Array.isArray(data.detail) && data.detail.map(d => d.msg).join(" ")) ||
            "Ocurrió un error al comunicarse con el servidor.";
        throw new Error(mensaje);
    }

    return data;
}

/**
 * Sube un archivo (imagen) al backend usando multipart/form-data.
 * Retorna { url, nombre_archivo }. La URL es relativa; usar
 * `resolverUrlArchivo` para construir la URL absoluta al mostrarla.
 */
export async function subirImagen(archivo) {
    const token = getToken();
    const formData = new FormData();
    formData.append("archivo", archivo);

    const response = await fetch(`${API_URL}/uploads/imagen`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error((data && data.detail) || "No fue posible subir la imagen.");
    }
    return data;
}

/**
 * Construye la URL absoluta de un archivo/imagen almacenado en el backend
 * (rutas que empiezan con /archivos/...). Si ya es una URL absoluta
 * (http/https), la retorna sin cambios.
 */
export function resolverUrlArchivo(rutaImagen) {
    if (!rutaImagen) return null;
    if (rutaImagen.startsWith("http://") || rutaImagen.startsWith("https://")) {
        return rutaImagen;
    }
    return `${API_URL}${rutaImagen}`;
}
