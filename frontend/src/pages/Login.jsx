import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import Label from "../components/Label";
import Boton from "../components/Boton";
import ModalRegister from "../modales/ModalRegister";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, rutaPanel } = useAuth();
    // ESTADO DEL MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);

    // DATOS DEL LOGIN
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    // ESTADO DE ERROR
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // CAMBIAR DATOS DEL FORMULARIO
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
    };

    // ABRIR MODAL
    const openModal = () => {
        setIsModalOpen(true);
        setError("");
    };

    // CERRAR MODAL
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // INICIAR SESIÓN
    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        if (!formData.email.trim()) {
            setError("Ingresa tu correo electrónico.");
            return;
        }
        if (!formData.password.trim()) {
            setError("Ingresa tu contraseña.");
            return;
        }
        try {
            setLoading(true);

            const usuarioAutenticado = await login(
                formData.email.trim().toLowerCase(),
                formData.password
            );

            const destino = location.state?.from || rutaPanel(usuarioAutenticado.rol);
            navigate(destino, { replace: true });

        } catch (error) {
            console.error("Error en el login:", error);

            setError(
                error.message || "No fue posible iniciar sesión."
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {/* =================================================
                CONTENEDOR PRINCIPAL
            ================================================== */}

            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-blue-100 px-4 py-10">

                {/* CARD LOGIN */}

                <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">

                    {/* ENCABEZADO */}

                    <div className="bg-blue-50 px-6 py-8 text-center">

                        <img
                            src="/logotech3.png"
                            alt="JHM Tech Solutions"
                            className="mx-auto max-h-24 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />

                        <p className="mt-4 text-sm text-gray-400">
                            Soluciones tecnológicas para tu negocio
                        </p>

                    </div>

                    {/* FORMULARIO */}

                    <div className="px-6 py-8 sm:px-8">

                        {/* TÍTULO */}

                        <div className="mb-7 text-center">

                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Iniciar Sesión
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Ingresa a tu cuenta para continuar
                            </p>

                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* FORM */}

                        <form onSubmit={handleLogin} className="space-y-5">

                            {/* CORREO */}

                            <div>
                                <Input
                                    label="Correo electrónico"
                                    type="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* CONTRASEÑA */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <Label htmlFor="password" required>
                                        Contraseña
                                    </Label>

                                    <Link
                                        to="/recuperar-contrasena"
                                        className="text-sm font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>

                                </div>

                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="•••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />

                            </div>

                            {/* RECORDAR USUARIO */}

                            <div className="flex items-center">

                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <Label htmlFor="remember" className="ml-2 mb-0 font-normal">
                                    Recordar usuario
                                </Label>

                            </div>

                            {/* BOTÓN LOGIN */}

                            <Boton
                                type="submit"
                                variant="primary"
                                disabled={loading}>
                                {loading ? "Ingresando..." : "Iniciar Sesión"}
                            </Boton>
                            {/* REGISTRO */}
                            <div className="border-t border-gray-200 pt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    ¿No tienes una cuenta?
                                </p>
                                <button
                                    type="button"
                                    onClick={openModal}
                                    className="mt-2 font-bold text-blue-600 transition hover:text-blue-800 hover:underline"
                                >
                                    Regístrate aquí
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            {/* MODAL REGISTRO */}
            <ModalRegister
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </>
    );
};

export default Login;