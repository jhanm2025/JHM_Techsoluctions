import React, { useEffect, useState } from "react";
import Boton from "../Boton";
import ModalFactura from "../../modales/ModalFactura";
import { apiFetch } from "../../utils/api";
import { descargarArchivo } from "../../utils/download";

/**
 * puedeCrear: admin/empleado pueden generar facturas; el cliente solo
 * consulta y descarga las suyas (el backend ya filtra automáticamente).
 */
const FacturasPanel = ({ puedeCrear = false }) => {
    const [facturas, setFacturas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [descargandoId, setDescargandoId] = useState(null);

    const cargarFacturas = async () => {
        try {
            setCargando(true);
            const data = await apiFetch("/facturas/");
            setFacturas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarFacturas();
    }, []);

    const handleDescargarPdf = async (factura) => {
        setError("");
        try {
            setDescargandoId(factura.id_factura);
            await descargarArchivo(`/facturas/${factura.id_factura}/pdf`, `${factura.numero_factura}.pdf`);
        } catch (err) {
            setError(err.message);
        } finally {
            setDescargandoId(null);
        }
    };

    const handleExportarExcel = async () => {
        setError("");
        try {
            await descargarArchivo("/facturas/exportar/excel", "reporte_facturas.xlsx");
        } catch (err) {
            setError(err.message);
        }
    };

    const estadoBadge = (estado) => {
        const estilos = {
            pendiente: "bg-yellow-100 text-yellow-700",
            pagada: "bg-green-100 text-green-700",
            anulada: "bg-red-100 text-red-700",
        };
        return (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${estilos[estado] || "bg-gray-100 text-gray-600"}`}>
                {estado}
            </span>
        );
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {puedeCrear ? "Facturación" : "Mis facturas"}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {puedeCrear
                            ? "Genera y consulta las facturas emitidas a los clientes."
                            : "Consulta y descarga tus facturas."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {puedeCrear && (
                        <Boton variant="secondary" className="w-fit" onClick={handleExportarExcel}>
                            📊 Exportar Excel
                        </Boton>
                    )}
                    {puedeCrear && (
                        <Boton variant="primary" className="w-fit" onClick={() => setModalAbierto(true)}>
                            + Nueva factura
                        </Boton>
                    )}
                </div>
            </div>

            {mensaje && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✅ {mensaje}
                </div>
            )}
            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ⚠️ {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">N° Factura</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Fecha</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Total</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Cargando facturas...</td></tr>
                        )}
                        {!cargando && facturas.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No hay facturas registradas.</td></tr>
                        )}
                        {facturas.map((f) => (
                            <tr key={f.id_factura} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">{f.numero_factura}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(f.fecha_emision).toLocaleDateString("es-CO")}</td>
                                <td className="px-4 py-3 text-gray-600">${Number(f.total).toLocaleString("es-CO")}</td>
                                <td className="px-4 py-3">{estadoBadge(f.estado)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        disabled={descargandoId === f.id_factura}
                                        onClick={() => handleDescargarPdf(f)}
                                        className="font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                    >
                                        {descargandoId === f.id_factura ? "Descargando..." : "Descargar PDF"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {puedeCrear && (
                <ModalFactura
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    onCreada={() => {
                        setMensaje("Factura generada correctamente.");
                        cargarFacturas();
                    }}
                />
            )}
        </div>
    );
};

export default FacturasPanel;
