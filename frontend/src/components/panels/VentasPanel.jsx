import React, { useEffect, useState } from "react";
import Boton from "../Boton";
import Label from "../Label";
import ModalVenta from "../../modales/ModalVenta";
import { apiFetch } from "../../utils/api";
import { descargarArchivo } from "../../utils/download";
import { formatearMoneda } from "../../utils/iva";

const FILTROS_VACIOS = { fecha_desde: "", fecha_hasta: "", estado: "", buscar: "" };

/**
 * Historial de ventas (admin/empleado): registrar nuevas ventas (que
 * generan automáticamente su factura), consultar el historial con
 * filtros, cambiar el estado y descargar reportes diarios en PDF/Excel.
 */
const VentasPanel = () => {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);
    const [descargando, setDescargando] = useState("");

    const construirQuery = () => {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([k, v]) => v && params.append(k, v));
        const query = params.toString();
        return query ? `?${query}` : "";
    };

    const cargarVentas = async () => {
        try {
            setCargando(true);
            setError("");
            const data = await apiFetch(`/ventas/${construirQuery()}`);
            setVentas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarVentas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFiltroChange = (e) => setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFiltrar = (e) => { e.preventDefault(); cargarVentas(); };
    const handleLimpiar = () => { setFiltros(FILTROS_VACIOS); setTimeout(cargarVentas, 0); };

    const handleDescargarFacturaPdf = async (venta) => {
        if (!venta.factura) return;
        setError("");
        try {
            setDescargando(`factura-${venta.id_venta}`);
            await descargarArchivo(`/ventas/${venta.id_venta}/factura/pdf`, `${venta.factura.numero_factura}.pdf`);
        } catch (err) {
            setError(err.message);
        } finally {
            setDescargando("");
        }
    };

    const handleDescargarReporte = async (formato) => {
        setError("");
        try {
            setDescargando(`reporte-${formato}`);
            const query = construirQuery();
            const extension = formato === "pdf" ? "pdf" : "xlsx";
            await descargarArchivo(`/ventas/reporte/${formato}${query}`, `reporte_ventas.${extension}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setDescargando("");
        }
    };

    const handleCambiarEstado = async (venta, estado) => {
        setError("");
        try {
            await apiFetch(`/ventas/${venta.id_venta}/estado`, { method: "PATCH", body: { estado } });
            setMensaje("Estado de la venta actualizado.");
            await cargarVentas();
        } catch (err) {
            setError(err.message);
        }
    };

    const estadoBadge = (estado) => {
        const estilos = {
            pendiente: "bg-yellow-100 text-yellow-700",
            completada: "bg-green-100 text-green-700",
            anulada: "bg-red-100 text-red-700",
        };
        return <span className={`rounded-full px-3 py-1 text-xs font-bold ${estilos[estado] || "bg-gray-100 text-gray-600"}`}>{estado}</span>;
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Ventas</h2>
                    <p className="text-sm text-gray-500">Registra ventas y consulta el historial completo.</p>
                </div>
                <Boton variant="primary" className="w-fit" onClick={() => setModalAbierto(true)}>
                    + Registrar venta
                </Boton>
            </div>

            {mensaje && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">✅ {mensaje}</div>}
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">⚠️ {error}</div>}

            <form onSubmit={handleFiltrar} className="mb-6 grid grid-cols-1 items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-5">
                <div>
                    <Label htmlFor="fecha_desde">Desde</Label>
                    <input id="fecha_desde" type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFiltroChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                </div>
                <div>
                    <Label htmlFor="fecha_hasta">Hasta</Label>
                    <input id="fecha_hasta" type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFiltroChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                </div>
                <div>
                    <Label htmlFor="estado">Estado</Label>
                    <select id="estado" name="estado" value={filtros.estado} onChange={handleFiltroChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600">
                        <option value="">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="completada">Completada</option>
                        <option value="anulada">Anulada</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="buscar">Buscar</Label>
                    <input id="buscar" name="buscar" value={filtros.buscar} onChange={handleFiltroChange} placeholder="N° venta o producto" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">Filtrar</button>
                    <button type="button" onClick={handleLimpiar} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Limpiar</button>
                </div>
            </form>

            <div className="mb-4 flex flex-wrap gap-2">
                <Boton variant="secondary" className="w-fit" onClick={() => handleDescargarReporte("pdf")} disabled={Boolean(descargando)}>
                    {descargando === "reporte-pdf" ? "Generando..." : "📄 Reporte PDF"}
                </Boton>
                <Boton variant="success" className="w-fit" onClick={() => handleDescargarReporte("excel")} disabled={Boolean(descargando)}>
                    {descargando === "reporte-excel" ? "Generando..." : "📊 Reporte Excel"}
                </Boton>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">N° Venta</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Fecha</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Ítems</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Total</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Cargando ventas...</td></tr>}
                        {!cargando && ventas.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No hay ventas registradas.</td></tr>}
                        {ventas.map((v) => (
                            <tr key={v.id_venta} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">{v.numero_venta}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(v.fecha_venta).toLocaleDateString("es-CO")}</td>
                                <td className="px-4 py-3 text-gray-600">{v.detalles?.map((d) => d.descripcion).join(", ")}</td>
                                <td className="px-4 py-3 font-bold text-gray-900">{formatearMoneda(v.total)}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={v.estado}
                                        onChange={(e) => handleCambiarEstado(v, e.target.value)}
                                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-blue-600"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="completada">Completada</option>
                                        <option value="anulada">Anulada</option>
                                    </select>
                                    <span className="ml-2 hidden sm:inline">{estadoBadge(v.estado)}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {v.factura ? (
                                        <button
                                            type="button"
                                            disabled={descargando === `factura-${v.id_venta}`}
                                            onClick={() => handleDescargarFacturaPdf(v)}
                                            className="font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                        >
                                            {descargando === `factura-${v.id_venta}` ? "Descargando..." : "Descargar factura"}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400">Sin factura</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ModalVenta
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onCreada={() => { setMensaje("Venta registrada correctamente."); cargarVentas(); }}
            />
        </div>
    );
};

export default VentasPanel;
