import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";

const MENSAJE_BIENVENIDA = {
    remitente: "bot",
    contenido: "¡Hola! Soy el asistente virtual de JHM Tech Solutions 🤖. ¿En qué puedo ayudarte hoy?",
};

/**
 * Chatbot flotante para atención al cliente. Funciona tanto para
 * visitantes anónimos como para usuarios autenticados (el backend
 * asocia la conversación al usuario cuando hay sesión activa).
 */
const ChatbotWidget = () => {
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [conversacionId, setConversacionId] = useState(null);
    const finRef = useRef(null);

    useEffect(() => {
        finRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes, abierto]);

    const enviarMensaje = async (e) => {
        e.preventDefault();
        const contenido = texto.trim();
        if (!contenido || enviando) return;

        setMensajes((prev) => [...prev, { remitente: "usuario", contenido }]);
        setTexto("");
        setEnviando(true);

        try {
            const data = await apiFetch("/chatbot/mensaje", {
                method: "POST",
                auth: true,
                body: { mensaje: contenido, conversacion_id: conversacionId },
            });
            setConversacionId(data.conversacion_id);
            setMensajes((prev) => [...prev, { remitente: "bot", contenido: data.respuesta }]);
        } catch (err) {
            setMensajes((prev) => [
                ...prev,
                { remitente: "bot", contenido: "Lo siento, tuve un problema para responder. Intenta de nuevo en un momento." },
            ]);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-label="Abrir chat de ayuda"
                className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-2xl shadow-blue-600/40 transition hover:scale-105 hover:bg-blue-500"
            >
                {abierto ? "×" : "💬"}
            </button>

            {abierto && (
                <div className="fixed bottom-24 right-6 z-[9998] flex h-[28rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-gray-950 via-gray-900 to-blue-950 px-4 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-lg">🤖</span>
                        <div>
                            <p className="text-sm font-bold text-white">Asistente JHM Tech</p>
                            <p className="text-xs text-gray-400">Normalmente responde al instante</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
                        {mensajes.map((m, idx) => (
                            <div key={idx} className={`flex ${m.remitente === "usuario" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                        m.remitente === "usuario"
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-200 bg-white text-gray-700"
                                    }`}
                                >
                                    {m.contenido}
                                </div>
                            </div>
                        ))}
                        {enviando && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400">
                                    Escribiendo...
                                </div>
                            </div>
                        )}
                        <div ref={finRef} />
                    </div>

                    <form onSubmit={enviarMensaje} className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
                        <input
                            type="text"
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                        />
                        <button
                            type="submit"
                            disabled={enviando || !texto.trim()}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
