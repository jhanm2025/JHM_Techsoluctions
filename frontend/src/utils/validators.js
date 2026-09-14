// Validaciones reutilizables en formularios (registro, empleados, recuperación de contraseña).

export const REGLAS_PASSWORD_TEXTO =
    "Mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial.";

/**
 * Valida que una contraseña cumpla las mismas reglas de seguridad que exige
 * el backend (ver backend/app/utils.py -> validar_password_fuerte).
 */
export function validarPassword(password) {
    if (!password || password.length < 8) {
        return { valido: false, mensaje: REGLAS_PASSWORD_TEXTO };
    }
    if (!/[A-Z]/.test(password)) return { valido: false, mensaje: REGLAS_PASSWORD_TEXTO };
    if (!/[a-z]/.test(password)) return { valido: false, mensaje: REGLAS_PASSWORD_TEXTO };
    if (!/[0-9]/.test(password)) return { valido: false, mensaje: REGLAS_PASSWORD_TEXTO };
    if (!/[^A-Za-z0-9]/.test(password)) return { valido: false, mensaje: REGLAS_PASSWORD_TEXTO };
    return { valido: true, mensaje: "" };
}

export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regex.test(email)) {
        return { valido: false, mensaje: "Ingresa un correo electrónico válido." };
    }
    return { valido: true, mensaje: "" };
}

export function validarRequerido(valor, etiqueta = "Este campo") {
    if (!valor || String(valor).trim().length === 0) {
        return { valido: false, mensaje: `${etiqueta} es obligatorio.` };
    }
    return { valido: true, mensaje: "" };
}

export function calcularFortalezaPassword(password) {
    if (!password) return 0;
    let puntos = 0;
    if (password.length >= 8) puntos += 1;
    if (password.length >= 12) puntos += 1;
    if (/[A-Z]/.test(password)) puntos += 1;
    if (/[a-z]/.test(password)) puntos += 1;
    if (/[0-9]/.test(password)) puntos += 1;
    if (/[^A-Za-z0-9]/.test(password)) puntos += 1;
    return Math.min(puntos, 6);
}
