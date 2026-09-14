import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Label from "../components/Label";
import Boton from "../components/Boton";
import Alert from "../components/Alert";
import "../App.css";
import { API_URL } from "../utils/api";
const LIMITS = {
    nombres: { min: 2, max: 30 },
    apellidos: { min: 2, max: 30 },
    numero_documento: { min: 5, max: 15 },
    direccion: { min: 5, max: 50 },
    telefono: { min: 7, max: 12 },
    email: { min: 5, max: 50 },
    password: { min: 8, max: 72 },
    confirmar_password: { min: 8, max: 72 }
};
const initialForm = {
    nombres: "",
    apellidos: "",
    tipo_documento: "",
    numero_documento: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
    confirmar_password: "",
    terminos: false
};
const EyeIcon = ({ visible }) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {!visible && <path d="M4 4l16 16" />}
    </svg>
);
const ModalRegister = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
/*     const [submitted, setSubmitted] = useState(false); */
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const validateField = (name, value, data = formData) => {
        const limit = LIMITS[name];
        const text = typeof value === "string" ? value.trim() : value;
        if (name === "tipo_documento") return value ? "" : "Selecciona el tipo de documento.";
        if (name === "terminos") return value ? "" : "Debes aceptar los términos y condiciones.";
        if (!text) return "Este campo es obligatorio.";
        if (limit && text.length < limit.min) return `Mínimo ${limit.min} caracteres.`;
        if (limit && text.length > limit.max) return `Máximo ${limit.max} caracteres.`;
        if (name === "nombres" || name === "apellidos") {
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(value)) return "Solo se permiten letras y espacios.";
        }
        if (name === "numero_documento" || name === "telefono") {
            if (!/^\d+$/.test(value)) return "Solo se permiten números.";
        }
        if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            return "Ingresa un correo electrónico válido.";
        }
        if (name === "password") {
            if (!/[A-Z]/.test(value)) return "Debe contener al menos una mayúscula.";
            if (!/[a-z]/.test(value)) return "Debe contener al menos una minúscula.";
            if (!/\d/.test(value)) return "Debe contener al menos un número.";
            if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return "Debe contener al menos un carácter especial.";
        }
        if (name === "confirmar_password" && value !== data.password) {
            return "Las contraseñas no coinciden.";
        }
        return "";
    };
    const validateAll = (data = formData) => {
        const newErrors = {};

        Object.keys(data).forEach(name => {
            const error = validateField(name, data[name], data);
            if (error) newErrors[name] = error;
        });
        return newErrors;
    };
    const handleChange = e => {
        const { name, value } = e.target;
        const limit = LIMITS[name];
        let newValue = value;
        if (name === "nombres" || name === "apellidos") {
            newValue = newValue.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
        }
        if (name === "numero_documento" || name === "telefono") {
            newValue = newValue.replace(/\D/g, "");
        }
        if (name === "email") {
            newValue = newValue.toLowerCase();
        }
        if (limit) {
            newValue = newValue.slice(0, limit.max);
        }
        const updatedData = { ...formData, [name]: newValue };
        const fieldError = validateField(name, newValue, updatedData);
        if (name === "password") {
            setErrors(prev => ({
                ...prev,
                general: undefined,
                password: fieldError,
                confirmar_password: formData.confirmar_password
                    ? validateField("confirmar_password", formData.confirmar_password, updatedData)
                    : ""
            }));
        } else if (name === "confirmar_password") {
            setErrors(prev => ({
                ...prev,
                general: undefined,
                confirmar_password: fieldError
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                general: undefined,
                [name]: fieldError
            }));
        }
        setFormData(updatedData);
        setSuccess("");
    };
    const handleTerms = e => {
        const checked = e.target.checked;
        const updatedData = { ...formData, terminos: checked };
        setFormData(updatedData);
        setErrors(prev => ({
            ...prev,
            general: undefined,
            terminos: validateField("terminos", checked, updatedData)
        }));
        setSuccess("");
    };
    const generatePassword = () => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const special = "!@#$%^&*()_+-=[]{};:,.<>?";
        const all = upper + lower + numbers + special;
        const randomChar = source => {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return source[array[0] % source.length];
        };
        const passwordArray = [
            randomChar(upper),
            randomChar(lower),
            randomChar(numbers),
            randomChar(special)
        ];
        while (passwordArray.length < 12) {
            passwordArray.push(randomChar(all));
        }
        for (let i = passwordArray.length - 1; i > 0; i--) {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            const j = array[0] % (i + 1);
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }
        const generated = passwordArray.join("");
        const updatedData = {
            ...formData,
            password: generated,
            confirmar_password: generated
        };
        setFormData(updatedData);
        setErrors(validateAll(updatedData));
        setSuccess("Contraseña segura generada correctamente.");
    };
    const handleSubmit = async e => {
        e.preventDefault();
         setSuccess("");
        const validationErrors = validateAll(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        const payload = {
            nombres: formData.nombres.trim(),
            apellidos: formData.apellidos.trim(),
            tipo_documento: formData.tipo_documento,
            numero_documento: formData.numero_documento.trim(),
            direccion: formData.direccion.trim(),
            telefono: formData.telefono.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password
        };
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/usuarios/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(payload)
            });
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await response.json()
                : {};
            if (!response.ok) {
                if (response.status === 422 && Array.isArray(data.detail)) {
                    const backendErrors = {};
                    data.detail.forEach(item => {
                        const field = item.loc?.[1];
                        if (field) {
                            backendErrors[field] = item.msg;
                        }
                    });
                    setErrors(backendErrors);
                    throw new Error("Corrige los campos indicados.");
                }
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "No fue posible registrar el usuario."
                );
            }
            setFormData(initialForm);
            setErrors({});
           /*  setSubmitted(false); */
            setSuccess("");
            setShowAlert(true);
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                general: error.message || "No fue posible registrar el usuario."
            }));
        } finally {
            setLoading(false);
        }
    };
    const handleClose = () => {
        if (loading) return;
        setFormData(initialForm);
        setErrors({});
   /*      setSubmitted(false); */
        setSuccess("");
        setShowAlert(false);
        onClose();
    };
    const counter = name =>
        `${formData[name]?.length || 0}/${LIMITS[name]?.max || 0}`;

    const passwordRequirements = [
        {
            label: "8-72 caracteres",
            valid: formData.password.length >= 8 && formData.password.length <= 72
        },
        {
            label: "Una mayúscula",
            valid: /[A-Z]/.test(formData.password)
        },
        {
            label: "Una minúscula",
            valid: /[a-z]/.test(formData.password)
        },
        {
            label: "Un número",
            valid: /\d/.test(formData.password)
        },
        {
            label: "Un carácter especial",
            valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)
        }
    ];
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
            <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-900 px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Crear una cuenta</h2>
                        <p className="mt-0.5 text-sm text-gray-300">Regístrate en JHM Tech Solutions</p>
                    </div>
                    <button type="button" onClick={handleClose} disabled={loading} className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
                        ×
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-4">
                    <div className="mb-4 flex justify-center">
                        <img src="/logotech3.png" alt="JHM Tech Solutions" className="h-16 w-auto object-contain" onError={e => (e.currentTarget.style.display = "none")} />
                    </div>
                    {errors.general && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                            ⚠️ {errors.general}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                            ✅ {success}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} noValidate className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <Input label="Nombres" name="nombres" placeholder="Ingresa tus nombres" value={formData.nombres} onChange={handleChange} maxLength={LIMITS.nombres.max} required />

                                <div className="flex justify-between text-xs">
                                    <span className={errors.nombres ? "text-red-600" : "text-gray-500"}>
                                        {errors.nombres || `Mínimo ${LIMITS.nombres.min} caracteres`}
                                    </span>
                                    <span className="text-gray-500">{counter("nombres")}</span>
                                </div>
                            </div>
                            <div>
                                <Input label="Apellidos" name="apellidos" placeholder="Ingresa tus apellidos" value={formData.apellidos} onChange={handleChange} maxLength={LIMITS.apellidos.max} required />

                                <div className="flex justify-between text-xs">
                                    <span className={errors.apellidos ? "text-red-600" : "text-gray-500"}>
                                        {errors.apellidos || `Mínimo ${LIMITS.apellidos.min} caracteres`}
                                    </span>
                                    <span className="text-gray-500">{counter("apellidos")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <Label htmlFor="tipo_documento" required>Tipo de documento</Label>
                                <select id="tipo_documento" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className={`w-full rounded-xl border bg-white px-4 py-2.5 text-gray-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 ${errors.tipo_documento ? "border-red-500" : "border-gray-300"}`}>
                                    <option value="">Selecciona una opción</option>
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="TI">Tarjeta de identidad</option>
                                    <option value="PASAPORTE">Pasaporte</option>
                                    <option value="NIT">NIT</option>
                                </select>
                                <p className={`mt-1 text-xs ${errors.tipo_documento ? "text-red-600" : "text-gray-500"}`}>
                                    {errors.tipo_documento || "Selecciona el tipo de documento"}
                                </p>
                            </div>
                            <div>
                                <Input label="Número de documento" name="numero_documento" type="text" inputMode="numeric" placeholder="Número de documento" value={formData.numero_documento} onChange={handleChange} maxLength={LIMITS.numero_documento.max} required />
                                <div className="flex justify-between text-xs">
                                    <span className={errors.numero_documento ? "text-red-600" : "text-gray-500"}>
                                        {errors.numero_documento || `Solo números · mínimo ${LIMITS.numero_documento.min}`}
                                    </span>
                                    <span className="text-gray-500">{counter("numero_documento")}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Input label="Dirección" name="direccion" placeholder="Ingresa tu dirección" value={formData.direccion} onChange={handleChange} maxLength={LIMITS.direccion.max} required />
                            <div className="flex justify-between text-xs">
                                <span className={errors.direccion ? "text-red-600" : "text-gray-500"}>
                                    {errors.direccion || `Mínimo ${LIMITS.direccion.min} caracteres`}
                                </span>
                                <span className="text-gray-500">{counter("direccion")}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <Input label="Teléfono" type="text" name="telefono" inputMode="numeric" placeholder="3000000000" value={formData.telefono} onChange={handleChange} maxLength={LIMITS.telefono.max} required />

                                <div className="flex justify-between text-xs">
                                    <span className={errors.telefono ? "text-red-600" : "text-gray-500"}>
                                        {errors.telefono || `Solo números · mínimo ${LIMITS.telefono.min}`}
                                    </span>
                                    <span className="text-gray-500">{counter("telefono")}</span>
                                </div>
                            </div>
                            <div>
                                <Input label="Correo electrónico" type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} maxLength={LIMITS.email.max} required />

                                <div className="flex justify-between text-xs">
                                    <span className={errors.email ? "text-red-600" : "text-gray-500"}>
                                        {errors.email || `Mínimo ${LIMITS.email.min} caracteres`}
                                    </span>
                                    <span className="text-gray-500">{counter("email")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <div className="relative">
                                    <Input label="Contraseña" type={showPassword ? "text" : "password"} name="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange} maxLength={LIMITS.password.max} required />

                                    <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-9 text-gray-500 transition hover:text-blue-600" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                        <EyeIcon visible={showPassword} />
                                    </button>
                                </div>
                                <div className="mt-1 flex justify-between text-xs">
                                    <span className={errors.password ? "text-red-600" : "text-gray-500"}>
                                        {errors.password || "Debe cumplir todos los requisitos"}
                                    </span>
                                    <span className="text-gray-500">{counter("password")}</span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                    {passwordRequirements.map(item => (
                                        <span key={item.label} className={item.valid ? "text-green-600" : "text-gray-500"}>
                                            {item.valid ? "✓" : "○"} {item.label}
                                        </span>
                                    ))}
                                </div>
                                <button type="button" onClick={generatePassword} className="mt-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800">
                                    Generar contraseña segura
                                </button>
                            </div>
                            <div>
                                <div className="relative">
                                    <Input label="Confirmar contraseña" type={showConfirmPassword ? "text" : "password"} name="confirmar_password" placeholder="Repite la contraseña" value={formData.confirmar_password} onChange={handleChange} maxLength={LIMITS.confirmar_password.max} required />

                                    <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute right-3 top-9 text-gray-500 transition hover:text-blue-600" aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                        <EyeIcon visible={showConfirmPassword} />
                                    </button>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className={errors.confirmar_password ? "text-red-600" : "text-gray-500"}>
                                        {errors.confirmar_password || "Debe coincidir con la contraseña"}
                                    </span>
                                    <span className="text-gray-500">{counter("confirmar_password")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                            <div className="flex items-start gap-3">
                                <input type="checkbox" id="terminos" checked={formData.terminos} onChange={handleTerms} className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />

                                <label htmlFor="terminos" className="text-sm leading-5 text-gray-600">
                                    Acepto los términos y condiciones y autorizo el tratamiento de mis datos personales.
                                </label>
                            </div>
                            {errors.terminos && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.terminos}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                            <Boton type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                                Cancelar
                            </Boton>
                            <Boton type="submit" variant="primary" disabled={loading}>
                                {loading ? "Registrando..." : "Crear cuenta"}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
            <Alert
                isOpen={showAlert}
                type="success"
                title="¡Registro exitoso!"
                message="Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión con tus credenciales."
                buttonText="Ir al inicio de sesión"
                onClose={() => {
                    setShowAlert(false);
                    navigate("/iniciar-sesion", { replace: true });
                    onClose();
                }}
            />
        </div>
    );
};

export default ModalRegister;
