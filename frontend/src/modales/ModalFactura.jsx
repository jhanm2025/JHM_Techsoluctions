import React, { useEffect, useState } from "react";
import Input from "../components/Input";
import Label from "../components/Label";
import Boton from "../components/Boton";
import { apiFetch } from "../utils/api";

const ITEM_VACIO = { tipo: "producto", id_item: "", cantidad: 1 };

const ModalFactura = ({ isOpen, onClose, onCreada }) => {
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [idCliente, setIdCliente] = useState("");
    const [items, setItems] = useState([{ ...ITEM_VACIO }]);
    const [descuento, setDescuento] = useState(0);
    const [impuesto, setImpuesto] = useState(19);
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const cargarDatos = async () => {
            try {
                setCargandoDatos(true);
                const [listaClientes, listaProductos, listaServicios] = await Promise.all([
                    apiFetch("/usuarios/clientes/lista"),
                    apiFetch("/productos/?estado=activo"),
                    apiFetch("/servicios/?estado=activo"),
                ]);
                setClientes(listaClientes);
                setProductos(listaProductos);
                setServicios(listaServicios);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargandoDatos(false);
            }
        };
        cargarDatos();
    }, [isOpen]);

    if (!isOpen) return null;

    const opcionesPorTipo = (tipo) => (tipo === "producto" ? productos : servicios);

    const actualizarItem = (index, campo, valor) => {
        setItems((prev) => {
            const copia = [...prev];
            copia[index] = { ...copia[index], [campo]: valor };
            if (campo === "tipo") copia[index].id_item = "";
            return copia;
        });
    };

    const agregarItem = () => setItems((prev) => [...prev, { ...ITEM_VACIO }]);
    const quitarItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

    const resetForm = () => {
        setIdCliente("");
        setItems([{ ...ITEM_VACIO }]);
        setDescuento(0);
        setImpuesto(19);
        setObservaciones("");
        setError("");
    };

    const handleClose = () => {
        if (guardando) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!idCliente) {
            setError("Selecciona un cliente.");
            return;
        }
        const itemsValidos = items.filter((item) => item.id_item);
        if (itemsValidos.length === 0) {
            setError("Agrega al menos un producto o servicio.");
            return;
        }

        const payload = {
            id_cliente: Number(idCliente),
            items: itemsValidos.map((item) => ({
                tipo: item.tipo,
                id_item: Number(item.id_item),
                cantidad: Number(item.cantidad) || 1,
            })),
            descuento_porcentaje: Number(descuento) || 0,
            impuesto_porcentaje: Number(impuesto) || 0,
            observaciones: observaciones.trim() || null,
        };

        try {
            setGuardando(true);
            await apiFetch("/facturas/", { method: "POST", body: payload });
            resetForm();
            onCreada?.();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
            <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-blue-900 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Nueva factura</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 transition hover:bg-white/10 hover:text-white"
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

                    {cargandoDatos ? (
                        <p className="text-gray-500">Cargando datos...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Label htmlFor="cliente" required>Cliente</Label>
                                <select
                                    id="cliente"
                                    value={idCliente}
                                    onChange={(e) => setIdCliente(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                >
                                    <option value="">Selecciona un cliente</option>
                                    {clientes.map((c) => (
                                        <option key={c.id_usuario} value={c.id_usuario}>
                                            {c.nombres} {c.apellidos} — {c.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label>Ítems de la factura</Label>
                                    <button type="button" onClick={agregarItem} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                        + Agregar ítem
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-1 items-end gap-2 rounded-xl border border-gray-200 p-3 sm:grid-cols-12">
                                            <div className="sm:col-span-3">
                                                <Label>Tipo</Label>
                                                <select
                                                    value={item.tipo}
                                                    onChange={(e) => actualizarItem(index, "tipo", e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                                >
                                                    <option value="producto">Producto</option>
                                                    <option value="servicio">Servicio</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <Label>Ítem</Label>
                                                <select
                                                    value={item.id_item}
                                                    onChange={(e) => actualizarItem(index, "id_item", e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                                >
                                                    <option value="">Selecciona...</option>
                                                    {opcionesPorTipo(item.tipo).map((opcion) => (
                                                        <option
                                                            key={opcion.id_producto || opcion.id_servicio}
                                                            value={opcion.id_producto || opcion.id_servicio}
                                                        >
                                                            {opcion.nombre} — ${Number(opcion.precio || opcion.precio_minimo).toLocaleString("es-CO")}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <Label>Cantidad</Label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.cantidad}
                                                    onChange={(e) => actualizarItem(index, "cantidad", e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                                />
                                            </div>
                                            <div className="sm:col-span-1">
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => quitarItem(index)}
                                                        className="w-full rounded-lg border border-red-300 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input label="Descuento (%)" type="number" min="0" max="100" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                                <Input label="Impuesto (%)" type="number" min="0" max="100" value={impuesto} onChange={(e) => setImpuesto(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                                <textarea
                                    id="observaciones"
                                    rows={2}
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                <Boton type="button" variant="secondary" onClick={handleClose} disabled={guardando}>
                                    Cancelar
                                </Boton>
                                <Boton type="submit" variant="primary" disabled={guardando}>
                                    {guardando ? "Generando..." : "Generar factura"}
                                </Boton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalFactura;
