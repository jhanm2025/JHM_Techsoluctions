import React, { useEffect, useState } from "react";
import Boton from "../Boton";
import ModalEmpleado from "../../modales/ModalEmpleado";
import { apiFetch } from "../../utils/api";

const EmpleadosPanel = () => {
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [guardandoId, setGuardandoId] = useState(null);

    const cargarEmpleados = async () => {
        try {
            setCargando(true);
            const data = await apiFetch("/usuarios/empleados/lista");
            setEmpleados(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const cambiarEstado = async (empleado, nuevoEstado) => {
        setError("");
        setMensaje("");
        try {
            setGuardandoId(empleado.id_usuario);
            await apiFetch(`/usuarios/${empleado.id_usuario}`, {
                method: "PATCH",
                body: { estado: nuevoEstado },
            });
            setMensaje(
                `Empleado ${nuevoEstado === "activo" ? "activado" : "desactivado"} correctamente.`
            );
            await cargarEmpleados();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardandoId(null);
        }
    };

    const estadoBadge = (estado) => {
        const estilos = {
            activo: "bg-green-100 text-green-700",
            inactivo: "bg-gray-200 text-gray-600",
            bloqueado: "bg-red-100 text-red-700",
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
                    <h2 className="text-2xl font-extrabold text-gray-900">Empleados</h2>
                    <p className="text-sm text-gray-500">Registra y administra a los empleados de la empresa.</p>
                </div>
                <Boton variant="primary" className="w-fit" onClick={() => setModalAbierto(true)}>
                    + Nuevo empleado
                </Boton>
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
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Nombre</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Correo</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Documento</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Teléfono</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && (
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Cargando empleados...</td></tr>
                        )}
                        {!cargando && empleados.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Aún no hay empleados registrados.</td></tr>
                        )}
                        {empleados.map((emp) => (
                            <tr key={emp.id_usuario} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">{emp.nombres} {emp.apellidos}</td>
                                <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                                <td className="px-4 py-3 text-gray-600">{emp.tipo_documento} {emp.numero_documento}</td>
                                <td className="px-4 py-3 text-gray-600">{emp.telefono || "—"}</td>
                                <td className="px-4 py-3">{estadoBadge(emp.estado)}</td>
                                <td className="px-4 py-3 text-right">
                                    {emp.estado === "activo" ? (
                                        <button
                                            type="button"
                                            disabled={guardandoId === emp.id_usuario}
                                            onClick={() => cambiarEstado(emp, "inactivo")}
                                            className="font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                                        >
                                            Desactivar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={guardandoId === emp.id_usuario}
                                            onClick={() => cambiarEstado(emp, "activo")}
                                            className="font-bold text-green-600 hover:text-green-800 disabled:opacity-50"
                                        >
                                            Activar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ModalEmpleado
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onCreado={() => {
                    setMensaje("Empleado registrado correctamente.");
                    cargarEmpleados();
                }}
            />
        </div>
    );
};

export default EmpleadosPanel;
