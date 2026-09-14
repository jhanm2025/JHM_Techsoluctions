import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatbotWidget from "./ChatbotWidget";

/**
 * Layout compartido por los paneles de administrador, empleado y cliente.
 * No incluye el Header ni el Footer del sitio público: cada panel es una
 * experiencia independiente con su propio Sidebar.
 */
const DashboardLayout = ({ titulo, subtitulo, tabs, tabActiva, onCambiarTab, children, mostrarChatbot = false }) => {
    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                tabs={tabs}
                tabActiva={tabActiva}
                onCambiarTab={onCambiarTab}
                abierto={sidebarAbierto}
                onCerrar={() => setSidebarAbierto(false)}
            />

            <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
                {/* BARRA SUPERIOR (solo visible en móvil para abrir el sidebar) */}
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4 shadow-sm lg:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarAbierto(true)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                        aria-label="Abrir menú"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-base font-extrabold text-gray-900">{titulo}</h1>
                        {subtitulo && <p className="text-xs text-gray-500">{subtitulo}</p>}
                    </div>
                </header>

                {/* ENCABEZADO DESKTOP */}
                <div className="hidden border-b border-gray-200 bg-white px-8 py-6 lg:block">
                    <h1 className="text-2xl font-extrabold text-gray-900">{titulo}</h1>
                    {subtitulo && <p className="text-sm text-gray-500">{subtitulo}</p>}
                </div>

                {/* CONTENIDO */}
                <main className="min-h-[70vh] flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </div>
            {mostrarChatbot && <ChatbotWidget />}
        </div>
    );
};

export default DashboardLayout;
