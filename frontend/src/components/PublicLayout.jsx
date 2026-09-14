import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatbotWidget from "./ChatbotWidget";

/**
 * Layout del sitio público (Header + contenido + Footer).
 * Los paneles de administrador/empleado/cliente NO usan este layout:
 * tienen su propio Sidebar y no muestran el Header/Footer generales.
 */
const PublicLayout = () => {
    return (
        <>
            <Header />
            <main className="pt-20">
                <Outlet />
            </main>
            <Footer />
            <ChatbotWidget />
        </>
    );
};

export default PublicLayout;
