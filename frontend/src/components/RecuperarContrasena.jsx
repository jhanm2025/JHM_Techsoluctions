import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Input from "./Input";
import Boton from "./Boton";
import { apiFetch } from "../utils/api";
import { validarPassword, REGLAS_PASSWORD_TEXTO } from "../utils/validators";

const RecuperarContrasena = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenDeUrl = searchParams.get("token") || "";

    // PASO 1: solicitar el enlace/token de recuperación
    const [email, setEmail] = useState("");
    const [mensajeSolicitud, setMensajeSolicitud] = useState("");
    const [errorSolicitud, setErrorSolicitud] = useState("");
    const [loadingSolicitud, setLoadingSolicitud] = useState(false);

    // PASO 2: restablecer la contraseña con el token
    const [token, setToken] = useState(tokenDeUrl);
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [mensajeReset, setMensajeReset] = useState("");
    const [errorReset, setErrorReset] = useState("");
    const [loadingReset, setLoadingReset] = useState(false);

    const handleSolicitar = async (e) => {
        e.preventDefault();
        setErrorSolicitud("");
        setMensajeSolicitud("");
        if (!email.trim()) {
            setErrorSolicitud("Ingresa tu correo electrónico.");
            return;
        }
        try {
            setLoadingSolicitud(true);
            const data = await apiFetch("/auth/forgot-password", {
                method: "POST",
                auth: false,
                body: { email: email.trim().toLowerCase() },
            });
            setMensajeSolicitud(data.message);
        } catch (error) {
            setErrorSolicitud(error.message || "No fue posible procesar la solicitud.");
        } finally {
            setLoadingSolicitud(false);
        }
    };

    const handleRestablecer = async (e) => {
        e.preventDefault();
        setErrorReset("");
        setMensajeReset("");
        if (!token.trim()) {
            setErrorReset("Ingresa el token de recuperación.");
            return;
        }
        const validacion = validarPassword(password);
        if (!validacion.valido) {
            setErrorReset(validacion.mensaje);
            return;
        }
        if (password !== confirmarPassword) {
            setErrorReset("Las contraseñas no coinciden.");
            return;
        }
        try {
            setLoadingReset(true);
            await apiFetch("/auth/reset-password", {
                method: "POST",
                auth: false,
                body: { token: token.trim(), password },
            });
            setMensajeReset("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
            setTimeout(() => navigate("/iniciar-sesion", { replace: true }), 1800);
        } catch (error) {
            setErrorReset(error.message || "No fue posible restablecer la contraseña.");
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-blue-100 px-4 py-10">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                <div className="bg-blue-50 px-6 py-8 text-center">
                    <img
                        src="/logotech3.png"
                        alt="JHM Tech Solutions"
                        className="mx-auto max-h-24 w-auto object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <p className="mt-4 text-sm text-gray-400">
                        Recupera el acceso a tu cuenta
                    </p>
                </div>

                <div className="px-6 py-8 sm:px-8 space-y-8">
                    {/* PASO 1: SOLICITAR TOKEN */}
                    <section>
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            ¿Olvidaste tu contraseña?
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Ingresa tu correo y te indicaremos cómo continuar.
                        </p>

                        {errorSolicitud && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                ⚠️ {errorSolicitud}
                            </div>
                        )}
                        {mensajeSolicitud && (
                            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 break-words">
                                ✅ {mensajeSolicitud}
                            </div>
                        )}

                        <form onSubmit={handleSolicitar} className="mt-4 space-y-4">
                            <Input
                                label="Correo electrónico"
                                type="email"
                                name="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Boton type="submit" variant="primary" disabled={loadingSolicitud}>
                                {loadingSolicitud ? "Enviando..." : "Enviar token de recuperación"}
                            </Boton>
                        </form>
                    </section>

                    <hr className="border-gray-200" />

                    {/* PASO 2: RESTABLECER CONTRASEÑA */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900">
                            Ya tengo un token
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Pega el token recibido y define tu nueva contraseña.
                        </p>

                        {errorReset && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                ⚠️ {errorReset}
                            </div>
                        )}
                        {mensajeReset && (
                            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                ✅ {mensajeReset}
                            </div>
                        )}

                        <form onSubmit={handleRestablecer} className="mt-4 space-y-4">
                            <Input
                                label="Token de recuperación"
                                type="text"
                                name="token"
                                placeholder="Pega aquí el token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                            />
                            <Input
                                label="Nueva contraseña"
                                type="password"
                                name="password"
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <p className="-mt-2 text-xs text-gray-400">{REGLAS_PASSWORD_TEXTO}</p>
                            <Input
                                label="Confirmar nueva contraseña"
                                type="password"
                                name="confirmarPassword"
                                placeholder="Repite la contraseña"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.target.value)}
                                required
                            />
                            <Boton type="submit" variant="success" disabled={loadingReset}>
                                {loadingReset ? "Actualizando..." : "Restablecer contraseña"}
                            </Boton>
                        </form>
                    </section>

                    <div className="border-t border-gray-200 pt-6 text-center">
                        <Link
                            to="/iniciar-sesion"
                            className="text-sm font-bold text-blue-600 transition hover:text-blue-800 hover:underline"
                        >
                            Volver a iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RecuperarContrasena;
