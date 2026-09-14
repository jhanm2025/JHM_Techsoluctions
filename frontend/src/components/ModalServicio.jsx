import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { resolverUrlArchivo } from "../utils/api";
import { calcularIva, formatearMoneda } from "../utils/iva";

/**
 * Modal de detalle para servicios, reutilizable en el sitio público y en
 * los paneles administrativos. Sigue el mismo diseño que ModalProducto.
 */
const ModalServicio = ({ servicio, isOpen, onClose }) => {
    useEffect(() => {
        const handleEscape = e => e.key === "Escape" && onClose();
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !servicio) return null;

    const imagenUrl = resolverUrlArchivo(servicio.imagen);
    const ivaMin = calcularIva(servicio.precio_minimo);
    const ivaMax = calcularIva(servicio.precio_maximo);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/80 px-4 py-6 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
            <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-950 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-3xl overflow-hidden">
                            {imagenUrl ? <img src={imagenUrl} alt={servicio.nombre} className="h-full w-full object-cover" /> : "🛠️"}
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{servicio.categoria}</span>
                            <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">{servicio.nombre}</h2>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar modal" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-gray-300 transition hover:bg-white/10 hover:text-white">×</button>
                </div>
                <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-6 sm:p-8">
                    <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
                        <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
                            {imagenUrl ? (
                                <img src={imagenUrl} alt={servicio.nombre} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 text-7xl shadow-2xl">🛠️</div>
                            )}
                        </div>
                        <div>
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold capitalize text-blue-600">{servicio.tipo_servicio}</span>
                            <h3 className="mt-4 text-2xl font-extrabold text-gray-900">{servicio.nombre}</h3>
                            <p className="mt-4 text-sm leading-7 text-gray-600">{servicio.descripcion}</p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">✓</span>
                                    <span className="text-sm font-medium capitalize text-gray-700">Modalidad: {servicio.modalidad}</span>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">✓</span>
                                    <span className="text-sm font-medium capitalize text-gray-700">Tipo: {servicio.tipo_servicio}</span>
                                </div>
                            </div>

                            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Inversión orientativa (IVA incluido)</p>
                                <p className="mt-2 text-2xl font-extrabold text-blue-600">
                                    {formatearMoneda(ivaMin.precioTotal)} - {formatearMoneda(ivaMax.precioTotal)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Base: {formatearMoneda(ivaMin.precioBase)} - {formatearMoneda(ivaMax.precioBase)} · IVA 19% incluido.
                                    El precio final puede variar según los requerimientos del proyecto.
                                </p>
                            </div>

                            <Link
                                to="/contacto"
                                onClick={onClose}
                                className="mt-4 block w-full rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-500"
                            >
                                Solicitar este servicio →
                            </Link>
                            <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ModalServicio;
