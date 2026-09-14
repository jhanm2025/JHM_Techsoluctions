import React, { useEffect, useState } from "react";
import Input from "../Input";
import Label from "../Label";
import Boton from "../Boton";
import SubidorImagen from "../SubidorImagen";
import { apiFetch, resolverUrlArchivo } from "../../utils/api";
import { calcularIva, formatearMoneda } from "../../utils/iva";

const FORM_VACIO = {
    id_producto: null,
    nombre: "",
    categoria: "",
    descripcion: "",
    precio: "",
    stock: 0,
    marca: "",
    referencia: "",
    imagen: "",
    estado: "activo",
};

/**
 * Panel de gestión de productos (CRUD).
 * puedeEliminar: solo el rol admin puede desactivar productos.
 */
const ProductosPanel = ({ puedeEliminar = false }) => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formData, setFormData] = useState(FORM_VACIO);
    const [guardando, setGuardando] = useState(false);

    const cargarProductos = async () => {
        try {
            setCargando(true);
            const data = await apiFetch("/productos/");
            setProductos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const abrirNuevo = () => {
        setFormData(FORM_VACIO);
        setError("");
        setModalAbierto(true);
    };

    const abrirEditar = (producto) => {
        setFormData({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            categoria: producto.categoria,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            marca: producto.marca || "",
            referencia: producto.referencia || "",
            imagen: producto.imagen || "",
            estado: producto.estado,
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
            descripcion: formData.descripcion.trim(),
            precio: Number(formData.precio),
            stock: Number(formData.stock) || 0,
            marca: formData.marca.trim() || null,
            referencia: formData.referencia.trim() || null,
            imagen: formData.imagen || null,
        };

        try {
            setGuardando(true);
            if (formData.id_producto) {
                await apiFetch(`/productos/${formData.id_producto}`, {
                    method: "PUT",
                    body: { ...payload, estado: formData.estado },
                });
                setMensaje("Producto actualizado correctamente.");
            } else {
                await apiFetch("/productos/", { method: "POST", body: payload });
                setMensaje("Producto creado correctamente.");
            }
            setModalAbierto(false);
            await cargarProductos();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleDesactivar = async (producto) => {
        if (!window.confirm(`¿Desactivar el producto "${producto.nombre}"?`)) return;
        try {
            await apiFetch(`/productos/${producto.id_producto}`, { method: "DELETE" });
            setMensaje("Producto desactivado correctamente.");
            await cargarProductos();
        } catch (err) {
            setError(err.message);
        }
    };

    const estadoBadge = (estado) => {
        const estilos = {
            activo: "bg-green-100 text-green-700",
            inactivo: "bg-gray-200 text-gray-600",
            agotado: "bg-yellow-100 text-yellow-700",
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
                    <h2 className="text-2xl font-extrabold text-gray-900">Productos</h2>
                    <p className="text-sm text-gray-500">Gestiona el catálogo de productos de la empresa.</p>
                </div>
                <Boton variant="primary" className="w-fit" onClick={abrirNuevo}>
                    + Nuevo producto
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
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Categoría</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Precio base</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">IVA (19%)</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Precio total</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Stock</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cargando && (
                            <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-500">Cargando productos...</td></tr>
                        )}
                        {!cargando && productos.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-500">No hay productos registrados.</td></tr>
                        )}
                        {productos.map((producto) => {
                            const iva = calcularIva(producto.precio);
                            return (
                            <tr key={producto.id_producto} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                        {producto.imagen ? (
                                            <img src={resolverUrlArchivo(producto.imagen)} alt={producto.nombre} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-lg text-gray-300">📦</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{producto.nombre}</td>
                                <td className="px-4 py-3 text-gray-600">{producto.categoria}</td>
                                <td className="px-4 py-3 text-gray-600">{formatearMoneda(iva.precioBase)}</td>
                                <td className="px-4 py-3 text-gray-600">{formatearMoneda(iva.valorIva)}</td>
                                <td className="px-4 py-3 font-bold text-gray-900">{formatearMoneda(iva.precioTotal)}</td>
                                <td className="px-4 py-3 text-gray-600">{producto.stock}</td>
                                <td className="px-4 py-3">{estadoBadge(producto.estado)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => abrirEditar(producto)}
                                        className="mr-3 font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        Editar
                                    </button>
                                    {puedeEliminar && producto.estado !== "inactivo" && (
                                        <button
                                            type="button"
                                            onClick={() => handleDesactivar(producto)}
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
                                {formData.id_producto ? "Editar producto" : "Nuevo producto"}
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Input label="Precio (COP)" type="number" name="precio" value={formData.precio} onChange={handleChange} required />
                                    <Input label="Stock" type="number" name="stock" value={formData.stock} onChange={handleChange} />
                                    <Input label="Marca" name="marca" value={formData.marca} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input label="Referencia" name="referencia" value={formData.referencia} onChange={handleChange} />
                                    <SubidorImagen
                                        label="Imagen del producto"
                                        valor={formData.imagen}
                                        onImagenSubida={(url) => setFormData((prev) => ({ ...prev, imagen: url }))}
                                    />
                                </div>
                                {formData.id_producto && (
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
                                            <option value="agotado">Agotado</option>
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

export default ProductosPanel;
