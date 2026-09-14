import React, { useState } from "react";
import Input from "../components/Input";
import Label from "../components/Label";
import Boton from "../components/Boton";
import { apiFetch } from "../utils/api";
import { REGLAS_PASSWORD_TEXTO } from "../utils/validators";

const LIMITS = {
    nombres: { min: 2, max: 30 },
    apellidos: { min: 2, max: 30 },
    numero_documento: { min: 5, max: 15 },
    direccion: { min: 0, max: 50 },
    telefono: { min: 0, max: 12 },
    email: { min: 5, max: 50 },
};

const FORM_VACIO = {
    nombres: "",
    apellidos: "",
    tipo_documento: "CC",
    numero_documento: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
    generarPassword: true,
};

/**
 * Modal reutilizable para que el administrador registre un nuevo empleado
 * sin salir del panel. Incluye validaciones en tiempo real por campo.
 * Si no se define contraseña, el backend genera una temporal y notifica
 * al empleado por correo electrónico.
 */
const ModalEmpleado = ({ isOpen, onClose, onCreado }) => {
    const [formData, setFormData] = useState(FORM_VACIO);
    const [errors, setErrors] = useState({});
    const [errorGeneral, setErrorGeneral] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const validateField = (name, value, data = formData) => {
        const limit = LIMITS[name];
        const text = typeof value === "string" ? value.trim() : value;

        if (name === "password" && data.generarPassword) return "";

        if (["direccion", "telefono"].includes(name) && !text) return "";

        if (!text && name !== "generarPassword") return "Este campo es obligatorio.";
        if (limit && text.length < limit.min && limit.min > 0) return `Mínimo ${limit.min} caracteres.`;
        if (limit && text.length > limit.max) return `Máximo ${limit.max} caracteres.`;

        if (name === "nombres" || name === "apellidos") {
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(value)) return "Solo se permiten letras y espacios.";
        }
        if (name === "numero_documento" || name === "telefono") {
            if (text && !/^\d+$/.test(text)) return "Solo se permiten números.";
        }
        if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            return "Ingresa un correo electrónico válido.";
        }
        if (name === "password" && !data.generarPassword) {
            if (!/[A-Z]/.test(value)) return "Debe contener al menos una mayúscula.";
            if (!/[a-z]/.test(value)) return "Debe contener al menos una minúscula.";
            if (!/\d/.test(value)) return "Debe contener al menos un número.";
            if (!/[^A-Za-z0-9]/.test(value)) return "Debe contener al menos un carácter especial.";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "nombres" || name === "apellidos") {
            newValue = newValue.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
        }
        if (name === "numero_documento" || name === "telefono") {
            newValue = newValue.replace(/\D/g, "");
        }
        if (name === "email") newValue = newValue.toLowerCase();

        const updated = { ...formData, [name]: newValue };
        setFormData(updated);
        setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue, updated) }));
        setErrorGeneral("");
    };

    const handleToggleGenerar = (e) => {
        const checked = e.target.checked;
        const updated = { ...formData, generarPassword: checked, password: checked ? "" : formData.password };
        setFormData(updated);
        setErrors((prev) => ({ ...prev, password: "" }));
    };

    const validarTodo = () => {
        const nuevosErrores = {};
        Object.keys(formData).forEach((name) => {
            if (name === "generarPassword") return;
            const error = validateField(name, formData[name], formData);
            if (error) nuevosErrores[name] = error;
        });
        return nuevosErrores;
    };

    const resetForm = () => {
        setFormData(FORM_VACIO);
        setErrors({});
        setErrorGeneral("");
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nuevosErrores = validarTodo();
        setErrors(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        const payload = {
            nombres: formData.nombres.trim(),
            apellidos: formData.apellidos.trim(),
            tipo_documento: formData.tipo_documento,
            numero_documento: formData.numero_documento.trim(),
            direccion: formData.direccion.trim() || null,
            telefono: formData.telefono.trim() || null,
            email: formData.email.trim(),
            password: formData.generarPassword ? null : formData.password,
        };

        try {
            setLoading(true);
            await apiFetch("/usuarios/empleados", { method: "POST", body: payload });
            resetForm();
            onCreado?.();
            onClose();
        } catch (error) {
            setErrorGeneral(error.message || "No fue posible registrar el empleado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
            <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-900 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Registrar nuevo empleado</h2>
                        <p className="mt-0.5 text-sm text-gray-300">Se le asignará el rol "empleado" automáticamente</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-5">
                    {errorGeneral && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            ⚠️ {errorGeneral}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Input label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} required />
                                {errors.nombres && <p className="mt-1 text-xs text-red-600">{errors.nombres}</p>}
                            </div>
                            <div>
                                <Input label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                                {errors.apellidos && <p className="mt-1 text-xs text-red-600">{errors.apellidos}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="tipo_documento" required>Tipo de documento</Label>
                                <select
                                    id="tipo_documento"
                                    name="tipo_documento"
                                    value={formData.tipo_documento}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                >
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="TI">Tarjeta de identidad</option>
                                    <option value="PASAPORTE">Pasaporte</option>
                                    <option value="NIT">NIT</option>
                                </select>
                            </div>
                            <div>
                                <Input
                                    label="Número de documento"
                                    name="numero_documento"
                                    inputMode="numeric"
                                    value={formData.numero_documento}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.numero_documento && <p className="mt-1 text-xs text-red-600">{errors.numero_documento}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Input label="Teléfono (opcional)" name="telefono" inputMode="numeric" value={formData.telefono} onChange={handleChange} />
                                {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
                            </div>
                            <div>
                                <Input label="Correo electrónico" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <Input label="Dirección (opcional)" name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={formData.generarPassword}
                                    onChange={handleToggleGenerar}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Generar contraseña temporal automáticamente
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                                Se le enviará al empleado por correo electrónico junto con el enlace de acceso.
                            </p>

                            {!formData.generarPassword && (
                                <div className="mt-3">
                                    <Input
                                        label="Contraseña"
                                        type="password"
                                        name="password"
                                        placeholder="Define una contraseña"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">{REGLAS_PASSWORD_TEXTO}</p>
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                            <Boton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                                Cancelar
                            </Boton>
                            <Boton type="submit" variant="primary" disabled={loading}>
                                {loading ? "Registrando..." : "Registrar empleado"}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalEmpleado;
