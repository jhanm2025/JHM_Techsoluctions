import React, { useEffect, useState } from "react";
import Input from "../Input";
import Label from "../Label";
import Boton from "../Boton";
import { apiFetch } from "../../utils/api";

const ETIQUETA_ESTADO = {
    pendiente: { texto: "Pendiente", clase: "bg-yellow-100 text-yellow-700" },
    en_proceso: { texto: "En proceso", clase: "bg-blue-100 text-blue-700" },
    respondida: { texto: "Respondida", clase: "bg-green-100 text-green-700" },
    cerrada: { texto: "Cerrada", clase: "bg-gray-200 text-gray-600" },
};

const FORM_VACIO = { tipo: "peticion", asunto: "", descripcion: "" };

const MisPqr = () => {
    const [pqrs, setPqrs] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [formData, setFormData] = useState(FORM_VACIO);
    const [enviando, setEnviando] = useState(false);
    const [pqrDetalle, setPqrDetalle] = useState(null);

    const cargarPqrs = async () => {
        try {
            setCargando(true);
            const data = await apiFetch("/pqr/");
            setPqrs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarPqrs(); }, []);

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        if (formData.asunto.trim().length < 5) {
            setError("El asunto debe tener al menos 5 caracteres.");
            return;
        }
        if (formData.descripcion.trim().length < 10) {
            setError("Cuéntanos con un poco más de detalle (mínimo 10 caracteres).");
            return;
        }
        try {
            setEnviando(true);
            await apiFetch("/pqr/", { method: "POST", body: formData });
            setMensaje("Tu solicitud fue registrada. Te responderemos pronto.");
            setFormData(FORM_VACIO);
            await cargarPqrs();
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div>
            <h2 className="mb-6 text-2xl font-extrabold text-gray-900">Mis PQR</h2>

            <div className="mb-8 max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Registrar una nueva solicitud</h3>
                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">⚠️ {error}</div>}
                {mensaje && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">✅ {mensaje}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="tipo" required>Tipo de solicitud</Label>
                        <select
                            id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        >
                            <option value="peticion">Petición</option>
                            <option value="queja">Queja</option>
                            <option value="reclamo">Reclamo</option>
                            <option value="sugerencia">Sugerencia</option>
                        </select>
                    </div>
                    <Input label="Asunto" name="asunto" value={formData.asunto} onChange={handleChange} required />
                    <div>
                        <Label htmlFor="descripcion" required>Descripción</Label>
                        <textarea
                            id="descripcion" name="descripcion" rows={4} value={formData.descripcion} onChange={handleChange}
                            placeholder="Cuéntanos los detalles de tu solicitud..."
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        />
                    </div>
                    <Boton type="submit" variant="primary" disabled={enviando}>
                        {enviando ? "Enviando..." : "Enviar solicitud"}
                    </Boton>
                </form>
            </div>

            <h3 className="mb-4 text-lg font-bold text-gray-900">Historial de solicitudes</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Tipo</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Asunto</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Fecha</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Cargando...</td></tr>}
                        {!cargando && pqrs.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Aún no has registrado ninguna solicitud.</td></tr>}
                        {pqrs.map((p) => (
                            <tr key={p.id_pqr} className="hover:bg-gray-50">
                                <td className="px-4 py-3 capitalize text-gray-600">{p.tipo}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{p.asunto}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(p.fecha_creacion).toLocaleDateString("es-CO")}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${ETIQUETA_ESTADO[p.estado].clase}`}>
                                        {ETIQUETA_ESTADO[p.estado].texto}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => setPqrDetalle(p)} className="font-bold text-blue-600 hover:text-blue-800">
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pqrDetalle && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-900 px-6 py-4">
                            <h3 className="text-lg font-bold text-white">{pqrDetalle.asunto}</h3>
                            <button type="button" onClick={() => setPqrDetalle(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 hover:bg-white/10 hover:text-white">×</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="mb-1 text-xs font-bold uppercase text-gray-400">Tu solicitud</p>
                            <p className="mb-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{pqrDetalle.descripcion}</p>
                            {pqrDetalle.respuesta ? (
                                <>
                                    <p className="mb-1 text-xs font-bold uppercase text-gray-400">Respuesta de JHM Tech Solutions</p>
                                    <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{pqrDetalle.respuesta}</p>
                                </>
                            ) : (
                                <p className="text-sm italic text-gray-400">Aún no ha sido respondida.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisPqr;
