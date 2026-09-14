import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Label from "../Label";
import { apiFetch } from "../../utils/api";
import { formatearMoneda } from "../../utils/iva";

const COLORES = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const TarjetaKpi = ({ titulo, valor, subtitulo, icono, color = "blue" }) => {
    const estilos = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
    };
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{titulo}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${estilos[color]}`}>{icono}</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-gray-900">{valor}</p>
            {subtitulo && <p className="mt-1 text-xs text-gray-400">{subtitulo}</p>}
        </div>
    );
};

/**
 * Dashboard centralizado de analítica del negocio. Consume
 * GET /reportes/dashboard con filtros de fecha y categoría, y presenta
 * KPIs, gráficos de barras/torta/línea y tablas resumen.
 */
const DashboardPanel = ({ esAdmin = false }) => {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [filtros, setFiltros] = useState({ fecha_desde: "", fecha_hasta: "", categoria: "" });

    const cargarDashboard = async () => {
        try {
            setCargando(true);
            setError("");
            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([k, v]) => v && params.append(k, v));
            const query = params.toString() ? `?${params.toString()}` : "";
            const data = await apiFetch(`/reportes/dashboard${query}`);
            setDatos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFiltroChange = (e) => {
        setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAplicarFiltros = (e) => {
        e.preventDefault();
        cargarDashboard();
    };

    const handleLimpiarFiltros = () => {
        setFiltros({ fecha_desde: "", fecha_hasta: "", categoria: "" });
        setTimeout(cargarDashboard, 0);
    };

    if (cargando && !datos) {
        return <p className="text-gray-500">Cargando dashboard...</p>;
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                ⚠️ {error}
            </div>
        );
    }

    if (!datos) return null;
    const { kpis, ventas_por_periodo, ventas_por_categoria, productos_mas_vendidos, servicios_mas_solicitados, productos_bajo_inventario, productos_agotados } = datos;

    const ventasPorPeriodoFormato = ventas_por_periodo.map((v) => ({
        fecha: new Date(v.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        total: v.total,
    }));

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-500">Indicadores y analítica del negocio en tiempo real.</p>
            </div>

            {/* FILTROS */}
            <form onSubmit={handleAplicarFiltros} className="mb-6 grid grid-cols-1 items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-4">
                <div>
                    <Label htmlFor="fecha_desde">Desde</Label>
                    <input id="fecha_desde" type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFiltroChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                </div>
                <div>
                    <Label htmlFor="fecha_hasta">Hasta</Label>
                    <input id="fecha_hasta" type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFiltroChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                </div>
                <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <input id="categoria" name="categoria" value={filtros.categoria} onChange={handleFiltroChange} placeholder="Ej: Software" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Filtrar</button>
                    <button type="button" onClick={handleLimpiarFiltros} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Limpiar</button>
                </div>
            </form>

            {/* KPIS */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <TarjetaKpi titulo="Ventas totales" valor={formatearMoneda(kpis.ventas_totales)} icono="💰" color="blue" />
                <TarjetaKpi titulo="N° de ventas" valor={kpis.num_ventas} icono="🧾" color="green" />
                <TarjetaKpi titulo="Ticket promedio" valor={formatearMoneda(kpis.ticket_promedio)} icono="📊" color="purple" />
                <TarjetaKpi titulo="IVA generado (19%)" valor={formatearMoneda(kpis.total_iva_generado)} icono="🧮" color="amber" />
                <TarjetaKpi titulo="Descuentos otorgados" valor={formatearMoneda(kpis.total_descuentos)} icono="🏷️" color="red" />
                <TarjetaKpi titulo="Productos activos" valor={kpis.num_productos} icono="📦" color="blue" />
                <TarjetaKpi titulo="Servicios activos" valor={kpis.num_servicios} icono="🛠️" color="green" />
                <TarjetaKpi titulo="Clientes registrados" valor={kpis.clientes_registrados} icono="👥" color="purple" />
                {esAdmin && (
                    <TarjetaKpi titulo="Usuarios totales" valor={kpis.total_usuarios} icono="🧑‍🤝‍🧑" color="blue" />
                )}
                <TarjetaKpi titulo="PQR pendientes" valor={kpis.pqr_pendientes} subtitulo={`${kpis.total_pqr} en total`} icono="📝" color={kpis.pqr_pendientes > 0 ? "amber" : "green"} />
            </div>

            {(kpis.productos_bajo_inventario_count > 0 || kpis.productos_agotados_count > 0) && (
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TarjetaKpi titulo="Bajo inventario (≤5)" valor={kpis.productos_bajo_inventario_count} icono="⚠️" color="amber" />
                    <TarjetaKpi titulo="Productos agotados" valor={kpis.productos_agotados_count} icono="🚫" color="red" />
                </div>
            )}

            {/* GRÁFICOS */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-gray-700">Ventas por periodo</h3>
                    {ventasPorPeriodoFormato.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={ventasPorPeriodoFormato}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => formatearMoneda(v)} />
                                <Line type="monotone" dataKey="total" name="Ventas" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="py-10 text-center text-sm text-gray-400">Sin datos para el periodo seleccionado.</p>}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-gray-700">Ventas por categoría</h3>
                    {ventas_por_categoria.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={ventas_por_categoria} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={90} label={(entry) => entry.categoria}>
                                    {ventas_por_categoria.map((_, idx) => (
                                        <Cell key={idx} fill={COLORES[idx % COLORES.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatearMoneda(v)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="py-10 text-center text-sm text-gray-400">Sin datos para el periodo seleccionado.</p>}
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-gray-700">Productos más vendidos</h3>
                    {productos_mas_vendidos.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={productos_mas_vendidos} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="cantidad" name="Unidades" fill="#2563eb" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="py-10 text-center text-sm text-gray-400">Aún no hay ventas de productos.</p>}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-gray-700">Servicios más solicitados</h3>
                    {servicios_mas_solicitados.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={servicios_mas_solicitados} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="cantidad" name="Solicitudes" fill="#22c55e" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="py-10 text-center text-sm text-gray-400">Aún no hay ventas de servicios.</p>}
                </div>
            </div>

            {/* TABLAS RESUMEN */}
            {(productos_bajo_inventario.length > 0 || productos_agotados.length > 0) && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {productos_bajo_inventario.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-sm font-bold text-gray-700">⚠️ Bajo inventario</h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    {productos_bajo_inventario.map((p) => (
                                        <tr key={p.id_producto}>
                                            <td className="py-2 font-medium text-gray-700">{p.nombre}</td>
                                            <td className="py-2 text-gray-400">{p.categoria}</td>
                                            <td className="py-2 text-right font-bold text-amber-600">{p.stock} und.</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {productos_agotados.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-sm font-bold text-gray-700">🚫 Productos agotados</h3>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    {productos_agotados.map((p) => (
                                        <tr key={p.id_producto}>
                                            <td className="py-2 font-medium text-gray-700">{p.nombre}</td>
                                            <td className="py-2 text-right text-gray-400">{p.categoria}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardPanel;
