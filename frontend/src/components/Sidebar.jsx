import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Sidebar reutilizable para los paneles de administrador, empleado y cliente.
 * - Logo de la empresa en la parte superior.
 * - Pestañas de navegación adaptadas al rol (recibidas por props).
 * - Enlace "Ir al sitio web" (mantiene la sesión activa).
 * - Datos del usuario y botón "Cerrar sesión" en la parte inferior.
 */
const Sidebar = ({ tabs, tabActiva, onCambiarTab, abierto, onCerrar }) => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/iniciar-sesion", { replace: true });
    };

    return (
        <>
            {/* Overlay para móvil */}
            {abierto && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onCerrar}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-800 bg-gray-950 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
                    abierto ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* LOGO */}
                <div className="flex items-center justify-center border-b border-gray-800 px-6 py-6">
                    <Link to="/" className="flex items-center transition hover:scale-[1.02]">
                        <img
                            src="/logotech3.png"
                            alt="JHM Tech Solutions"
                            className="h-14 w-auto object-contain"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                    </Link>
                </div>
                {/* NAVEGACIÓN */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                onCambiarTab(tab.id);
                                onCerrar?.();
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition duration-200 ${
                                tabActiva === tab.id
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* IR AL SITIO WEB */}
                <div className="border-t border-gray-800 px-4 py-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-blue-400 transition hover:bg-gray-800 hover:text-blue-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Ir al sitio web
                    </Link>
                </div>

                {/* USUARIO + CERRAR SESIÓN */}
                <div className="border-t border-gray-800 px-4 py-4">
                    <div className="mb-3 rounded-xl bg-gray-900 px-4 py-3">
                        <p className="truncate text-sm font-bold text-white">
                            {usuario?.nombres} {usuario?.apellidos}
                        </p>
                        <p className="truncate text-xs text-gray-400">{usuario?.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-blue-600/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-400">
                            {usuario?.rol}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-600/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
