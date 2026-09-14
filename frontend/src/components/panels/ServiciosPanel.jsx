import React, { useEffect, useState } from "react";
import Input from "../Input";
import Label from "../Label";
import Boton from "../Boton";
import SubidorImagen from "../SubidorImagen";
import { apiFetch, resolverUrlArchivo } from "../../utils/api";
import { calcularIva, formatearMoneda } from "../../utils/iva";

const FORM_VACIO = {
    id_servicio: null,
    nombre: "",
    categoria: "",
    tipo_servicio: "asesoria",
    descripcion: "",
    descripcion_corta: "",
    precio_minimo: "",
    precio_maximo: "",
    modalidad: "remoto",
    imagen: "",
    estado: "activo",
};

const TIPOS_SERVICIO = [
    "asesoria",
    "consultoria",
    "desarrollo",
    "implementacion",
    "soporte",
    "personalizado",
];

/**
 * Panel de gestión de servicios (CRUD).
 * puedeEliminar: solo el rol admin puede desactivar servicios.
 */
const ServiciosPanel = ({ puedeEliminar = false }) => {
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formData, setFormData] = useState(FORM_VACIO);
    const [guardando, setGuardando] = useState(false);

    const cargarServicios = async () => {
        try {
            setCargando(true);
            const data = await apiFetch("/servicios/");
            setServicios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarServicios();
    }, []);

    const abrirNuevo = () => {
        setFormData(FORM_VACIO);
        setError("");
        setModalAbierto(true);
    };

    const abrirEditar = (servicio) => {
        setFormData({
            id_servicio: servicio.id_servicio,
            nombre: servicio.nombre,
            categoria: servicio.categoria,
            tipo_servicio: servicio.tipo_servicio,
            descripcion: servicio.descripcion,
            descripcion_corta: servicio.descripcion_corta || "",
            precio_minimo: servicio.precio_minimo,
            precio_maximo: servicio.precio_maximo,
            modalidad: servicio.modalidad,
            imagen: servicio.imagen || "",
            estado: servicio.estado,
        });
        setError("");
        setModalAbierto(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        const payload = {
            nombre: formData.nombre.trim(),
            categoria: formData.categoria.trim(),
            tipo_servicio: formData.tipo_servicio,
            descripcion: formData.descripcion.trim(),
            descripcion_corta: formData.descripcion_corta.trim() || null,
            precio_minimo: Number(formData.precio_minimo) || 0,
            precio_maximo: Number(formData.precio_maximo) || 0,
            modalidad: formData.modalidad,
            imagen: formData.imagen || null,
        };

        try {
            setGuardando(true);
            if (formData.id_servicio) {
                await apiFetch(`/servicios/${formData.id_servicio}`, {
                    method: "PUT",
                    body: { ...payload, estado: formData.estado },
                });
                setMensaje("Servicio actualizado correctamente.");
            } else {
                await apiFetch("/servicios/", { method: "POST", body: payload });
                setMensaje("Servicio creado correctamente.");
            }
            setModalAbierto(false);
            await cargarServicios();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleDesactivar = async (servicio) => {
        if (!window.confirm(`¿Desactivar el servicio "${servicio.nombre}"?`)) return;
        try {
            await apiFetch(`/servicios/${servicio.id_servicio}`, { method: "DELETE" });
            setMensaje("Servicio desactivado correctamente.");
            await cargarServicios();
        } catch (err) {
            setError(err.message);
        }
    };

    const estadoBadge = (estado) => (
        <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
                estado === "activo" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
        >
            {estado}
        </span>
    );

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Servicios</h2>
                    <p className="text-sm text-gray-500">Gestiona el portafolio de servicios de la empresa.</p>
                </div>
                <Boton variant="primary" className="w-fit" onClick={abrirNuevo}>
                    + Nuevo servicio
                </Boton>
            </div>

            {mensaje && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✅ {mensaje}
                </div>
            )}
            {error && !modalAbierto && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ⚠️ {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Imagen</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Nombre</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Tipo</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Modalidad</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Rango de precio + IVA</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && (
                            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Cargando servicios...</td></tr>
                        )}
                        {!cargando && servicios.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No hay servicios registrados.</td></tr>
                        )}
                        {servicios.map((servicio) => {
                            const ivaMin = calcularIva(servicio.precio_minimo);
                            const ivaMax = calcularIva(servicio.precio_maximo);
                            return (
                            <tr key={servicio.id_servicio} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                        {servicio.imagen ? (
                                            <img src={resolverUrlArchivo(servicio.imagen)} alt={servicio.nombre} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-lg text-gray-300">🛠️</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{servicio.nombre}</td>
                                <td className="px-4 py-3 capitalize text-gray-600">{servicio.tipo_servicio}</td>
                                <td className="px-4 py-3 capitalize text-gray-600">{servicio.modalidad}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {formatearMoneda(ivaMin.precioTotal)} - {formatearMoneda(ivaMax.precioTotal)}
                                    <span className="ml-1 text-xs text-gray-400">(IVA incl.)</span>
                                </td>
                                <td className="px-4 py-3">{estadoBadge(servicio.estado)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => abrirEditar(servicio)}
                                        className="mr-3 font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        Editar
                                    </button>
                                    {puedeEliminar && servicio.estado !== "inactivo" && (
                                        <button
                                            type="button"
                                            onClick={() => handleDesactivar(servicio)}
                                            className="font-bold text-red-600 hover:text-red-800"
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            {modalAbierto && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
                    <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-900 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">
                                {formData.id_servicio ? "Editar servicio" : "Nuevo servicio"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalAbierto(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        <div className="overflow-y-auto px-6 py-5">
                            {error && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    ⚠️ {error}
                                </div>
                            )}
                            <form onSubmit={handleGuardar} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                    <Input label="Categoría" name="categoria" value={formData.categoria} onChange={handleChange} required />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="tipo_servicio" required>Tipo de servicio</Label>
                                        <select
                                            id="tipo_servicio"
                                            name="tipo_servicio"
                                            value={formData.tipo_servicio}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                        >
                                            {TIPOS_SERVICIO.map((tipo) => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="modalidad" required>Modalidad</Label>
                                        <select
                                            id="modalidad"
                                            name="modalidad"
                                            value={formData.modalidad}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                        >
                                            <option value="remoto">Remoto</option>
                                            <option value="presencial">Presencial</option>
                                            <option value="hibrido">Híbrido</option>
                                        </select>
                                    </div>
                                </div>
                                <Input label="Descripción corta" name="descripcion_corta" value={formData.descripcion_corta} onChange={handleChange} />
                                <div>
                                    <Label htmlFor="descripcion" required>Descripción</Label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        rows={3}
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input label="Precio mínimo (COP)" type="number" name="precio_minimo" value={formData.precio_minimo} onChange={handleChange} />
                                    <Input label="Precio máximo (COP)" type="number" name="precio_maximo" value={formData.precio_maximo} onChange={handleChange} />
                                </div>
                                <SubidorImagen
                                    label="Imagen del servicio"
                                    valor={formData.imagen}
                                    onImagenSubida={(url) => setFormData((prev) => ({ ...prev, imagen: url }))}
                                />
                                {formData.id_servicio && (
                                    <div>
                                        <Label htmlFor="estado">Estado</Label>
                                        <select
                                            id="estado"
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                        >
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                    <Boton type="button" variant="secondary" onClick={() => setModalAbierto(false)} disabled={guardando}>
                                        Cancelar
                                    </Boton>
                                    <Boton type="submit" variant="primary" disabled={guardando}>
                                        {guardando ? "Guardando..." : "Guardar"}
                                    </Boton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiciosPanel;
