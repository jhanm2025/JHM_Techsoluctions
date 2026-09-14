import React, { useEffect, useState } from "react";
import Label from "../Label";
import Boton from "../Boton";
import { apiFetch } from "../../utils/api";

const ESTADOS = ["pendiente", "en_proceso", "respondida", "cerrada"];

const ETIQUETA_ESTADO = {
    pendiente: { texto: "Pendiente", clase: "bg-yellow-100 text-yellow-700" },
    en_proceso: { texto: "En proceso", clase: "bg-blue-100 text-blue-700" },
    respondida: { texto: "Respondida", clase: "bg-green-100 text-green-700" },
    cerrada: { texto: "Cerrada", clase: "bg-gray-200 text-gray-600" },
};

const PqrPanel = () => {
    const [pqrs, setPqrs] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [pqrSeleccionada, setPqrSeleccionada] = useState(null);
    const [respuesta, setRespuesta] = useState("");
    const [nuevoEstado, setNuevoEstado] = useState("en_proceso");
    const [guardando, setGuardando] = useState(false);

    const cargarPqrs = async () => {
        try {
            setCargando(true);
            const query = filtroEstado ? `?estado=${filtroEstado}` : "";
            const data = await apiFetch(`/pqr/${query}`);
            setPqrs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPqrs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroEstado]);

    const abrirPqr = (pqr) => {
        setPqrSeleccionada(pqr);
        setRespuesta(pqr.respuesta || "");
        setNuevoEstado(pqr.estado === "pendiente" ? "en_proceso" : pqr.estado);
        setError("");
    };

    const handleGuardarRespuesta = async (e) => {
        e.preventDefault();
        setError("");
        try {
            setGuardando(true);
            await apiFetch(`/pqr/${pqrSeleccionada.id_pqr}`, {
                method: "PATCH",
                body: { respuesta: respuesta.trim() || null, estado: nuevoEstado },
            });
            setMensaje("PQR actualizada correctamente.");
            setPqrSeleccionada(null);
            await cargarPqrs();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">PQR</h2>
                    <p className="text-sm text-gray-500">Peticiones, quejas, reclamos y sugerencias de los clientes.</p>
                </div>
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                >
                    <option value="">Todos los estados</option>
                    {ESTADOS.map((e) => (
                        <option key={e} value={e}>{ETIQUETA_ESTADO[e].texto}</option>
                    ))}
                </select>
            </div>

            {mensaje && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">✅ {mensaje}</div>}
            {error && !pqrSeleccionada && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">⚠️ {error}</div>}

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Cliente</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Tipo</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Asunto</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Fecha</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Cargando PQR...</td></tr>}
                        {!cargando && pqrs.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No hay PQR registradas.</td></tr>}
                        {pqrs.map((p) => (
                            <tr key={p.id_pqr} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">{p.cliente ? `${p.cliente.nombres} ${p.cliente.apellidos}` : "—"}</td>
                                <td className="px-4 py-3 capitalize text-gray-600">{p.tipo}</td>
                                <td className="px-4 py-3 text-gray-600">{p.asunto}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(p.fecha_creacion).toLocaleDateString("es-CO")}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${ETIQUETA_ESTADO[p.estado].clase}`}>
                                        {ETIQUETA_ESTADO[p.estado].texto}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => abrirPqr(p)} className="font-bold text-blue-600 hover:text-blue-800">
                                        Ver / Responder
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pqrSeleccionada && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
                    <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-900 px-6 py-4">
                            <h3 className="text-lg font-bold text-white">{pqrSeleccionada.asunto}</h3>
                            <button type="button" onClick={() => setPqrSeleccionada(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 hover:bg-white/10 hover:text-white">×</button>
                        </div>
                        <div className="overflow-y-auto px-6 py-5">
                            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">⚠️ {error}</div>}
                            <p className="mb-1 text-xs font-bold uppercase text-gray-400">
                                {pqrSeleccionada.cliente?.nombres} {pqrSeleccionada.cliente?.apellidos} · {pqrSeleccionada.tipo}
                            </p>
                            <p className="mb-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{pqrSeleccionada.descripcion}</p>

                            <form onSubmit={handleGuardarRespuesta} className="space-y-4">
                                <div>
                                    <Label htmlFor="respuesta">Respuesta</Label>
                                    <textarea
                                        id="respuesta"
                                        rows={4}
                                        value={respuesta}
                                        onChange={(e) => setRespuesta(e.target.value)}
                                        placeholder="Escribe la respuesta para el cliente..."
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <select
                                        id="estado"
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                    >
                                        {ESTADOS.map((e) => (
                                            <option key={e} value={e}>{ETIQUETA_ESTADO[e].texto}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                    <Boton type="button" variant="secondary" onClick={() => setPqrSeleccionada(null)} disabled={guardando}>Cancelar</Boton>
                                    <Boton type="submit" variant="primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Boton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PqrPanel;
