import React, { useEffect, useState } from "react";
import Boton from "../Boton";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ESTADOS = ["activo", "inactivo", "bloqueado"];

const UsuariosPanel = () => {
    const { usuario: usuarioActual } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [guardandoId, setGuardandoId] = useState(null);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [listaUsuarios, listaRoles] = await Promise.all([
                apiFetch("/usuarios/"),
                apiFetch("/usuarios/roles/lista"),
            ]);
            setUsuarios(listaUsuarios);
            setRoles(listaRoles);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const actualizarUsuario = async (id_usuario, cambios) => {
        setError("");
        setMensaje("");
        try {
            setGuardandoId(id_usuario);
            await apiFetch(`/usuarios/${id_usuario}`, { method: "PATCH", body: cambios });
            setMensaje("Usuario actualizado correctamente.");
            await cargarDatos();
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
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Usuarios</h2>
                <p className="text-sm text-gray-500">
                    Asigna roles (admin, empleado, cliente) y controla el estado de cada cuenta.
                </p>
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
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Rol</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Cargando usuarios...</td></tr>
                        )}
                        {!cargando && usuarios.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No hay usuarios registrados.</td></tr>
                        )}
                        {usuarios.map((u) => {
                            const esUsuarioActual = usuarioActual?.id_usuario === u.id_usuario;
                            return (
                                <tr key={u.id_usuario} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {u.nombres} {u.apellidos}
                                        {esUsuarioActual && (
                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                Tú
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                    <td className="px-4 py-3 text-gray-600">{u.tipo_documento} {u.numero_documento}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={u.id_rol}
                                            disabled={esUsuarioActual || guardandoId === u.id_usuario}
                                            onChange={(e) =>
                                                actualizarUsuario(u.id_usuario, { id_rol: Number(e.target.value) })
                                            }
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 disabled:bg-gray-100"
                                        >
                                            {roles.map((rol) => (
                                                <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {estadoBadge(u.estado)}
                                            <select
                                                value={u.estado}
                                                disabled={esUsuarioActual || guardandoId === u.id_usuario}
                                                onChange={(e) =>
                                                    actualizarUsuario(u.id_usuario, { estado: e.target.value })
                                                }
                                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 disabled:bg-gray-100"
                                            >
                                                {ESTADOS.map((estado) => (
                                                    <option key={estado} value={estado}>{estado}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Boton variant="secondary" className="w-fit" onClick={cargarDatos}>
                    Actualizar lista
                </Boton>
            </div>
        </div>
    );
};

export default UsuariosPanel;
