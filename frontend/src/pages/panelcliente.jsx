import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FacturasPanel from "../components/panels/FacturasPanel";
import MisPqr from "../components/panels/MisPqr";
import { useAuth } from "../context/AuthContext";
import { apiFetch, resolverUrlArchivo } from "../utils/api";
import { calcularIva, formatearMoneda } from "../utils/iva";
const TABS = [
    { id: "perfil", label: "👤 Mi perfil" },
    { id: "productos", label: "📦 Productos" },
    { id: "servicios", label: "🛠️ Servicios" },
    { id: "facturas", label: "🧾 Mis facturas" },
    { id: "pqr", label: "📝 Mis PQR" },
];
const PanelCliente = () => {
    const { usuario } = useAuth();
    const [tabActiva, setTabActiva] = useState("perfil");
    const [perfil, setPerfil] = useState(null);
    const [productos, setProductos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [resumen, setResumen] = useState({ numCompras: 0, totalGastado: 0, pqrPendientes: 0 });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const cargarTodo = async () => {
            try {
                setCargando(true);
                const [perfilData, productosData, serviciosData, misVentas, misPqr] = await Promise.all([
                    apiFetch("/usuarios/me"),
                    apiFetch("/productos/?estado=activo"),
                    apiFetch("/servicios/?estado=activo"),
                    apiFetch("/ventas/"),
                    apiFetch("/pqr/"),
                ]);
                setPerfil(perfilData);
                setProductos(productosData);
                setServicios(serviciosData);
                const ventasValidas = misVentas.filter((v) => v.estado !== "anulada");
                setResumen({
                    numCompras: ventasValidas.length,
                    totalGastado: ventasValidas.reduce((acc, v) => acc + Number(v.total), 0),
                    pqrPendientes: misPqr.filter((p) => ["pendiente", "en_proceso"].includes(p.estado)).length,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargarTodo();
    }, []);
    return (
        <DashboardLayout
            titulo="Panel de Cliente"
            subtitulo={`Bienvenido, ${usuario?.nombres || ""}`}
            tabs={TABS}
            tabActiva={tabActiva}
            onCambiarTab={setTabActiva}
            mostrarChatbot
        >
            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ⚠️ {error}
                </div>
            )}

            {tabActiva === "perfil" && (
                <div>
                    <h2 className="mb-6 text-2xl font-extrabold text-gray-900">Mi perfil</h2>

                    {!cargando && (
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Compras realizadas</p>
                                <p className="mt-2 text-2xl font-extrabold text-blue-600">{resumen.numCompras}</p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Total invertido</p>
                                <p className="mt-2 text-2xl font-extrabold text-blue-600">{formatearMoneda(resumen.totalGastado)}</p>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">PQR pendientes</p>
                                <p className={`mt-2 text-2xl font-extrabold ${resumen.pqrPendientes > 0 ? "text-amber-600" : "text-green-600"}`}>{resumen.pqrPendientes}</p>
                            </div>
                        </div>
                    )}

                    {cargando && <p className="text-gray-500">Cargando información...</p>}
                    {!cargando && perfil && (
                        <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <dl className="divide-y divide-gray-100 text-sm">
                                <div className="grid grid-cols-3 gap-2 py-3">
                                    <dt className="font-bold text-gray-500">Nombre</dt>
                                    <dd className="col-span-2 text-gray-800">{perfil.nombres} {perfil.apellidos}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-3">
                                    <dt className="font-bold text-gray-500">Correo</dt>
                                    <dd className="col-span-2 text-gray-800">{perfil.email}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-3">
                                    <dt className="font-bold text-gray-500">Documento</dt>
                                    <dd className="col-span-2 text-gray-800">{perfil.tipo_documento} {perfil.numero_documento}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-3">
                                    <dt className="font-bold text-gray-500">Teléfono</dt>
                                    <dd className="col-span-2 text-gray-800">{perfil.telefono || "No registrado"}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-3">
                                    <dt className="font-bold text-gray-500">Dirección</dt>
                                    <dd className="col-span-2 text-gray-800">{perfil.direccion || "No registrada"}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-3">
                                    <dt className="font-bold text-gray-500">Rol</dt>
                                    <dd className="col-span-2 text-gray-800 capitalize">{perfil.rol?.nombre || usuario?.rol}</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            )}
            {tabActiva === "productos" && (
                <div>
                    <h2 className="mb-6 text-2xl font-extrabold text-gray-900">Catálogo de productos</h2>
                    {cargando && <p className="text-gray-500">Cargando productos...</p>}
                    {!cargando && productos.length === 0 && (
                        <p className="text-gray-500">No hay productos disponibles por el momento.</p>
                    )}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {productos.map((p) => {
                            const imagenUrl = resolverUrlArchivo(p.imagen);
                            const iva = calcularIva(p.precio);
                            return (
                            <div key={p.id_producto} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                                <div className="flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
                                    {imagenUrl ? (
                                        <img src={imagenUrl} alt={p.nombre} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">📦</span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{p.categoria}</span>
                                    <h3 className="mt-3 text-lg font-bold text-gray-900">{p.nombre}</h3>
                                    <p className="mt-1 line-clamp-3 flex-1 text-sm text-gray-500">{p.descripcion}</p>
                                    <p className="mt-3 text-xl font-extrabold text-blue-600">
                                        {formatearMoneda(iva.precioTotal)}
                                    </p>
                                    <p className="text-xs text-gray-400">IVA (19%) incluido</p>
                                </div>
                            </div>
                        );})}
                    </div>
                </div>
            )}
            {tabActiva === "servicios" && (
                <div>
                    <h2 className="mb-6 text-2xl font-extrabold text-gray-900">Catálogo de servicios</h2>
                    {cargando && <p className="text-gray-500">Cargando servicios...</p>}
                    {!cargando && servicios.length === 0 && (
                        <p className="text-gray-500">No hay servicios disponibles por el momento.</p>
                    )}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {servicios.map((s) => {
                            const imagenUrl = resolverUrlArchivo(s.imagen);
                            const ivaMin = calcularIva(s.precio_minimo);
                            const ivaMax = calcularIva(s.precio_maximo);
                            return (
                            <div key={s.id_servicio} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                                <div className="flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
                                    {imagenUrl ? (
                                        <img src={imagenUrl} alt={s.nombre} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">🛠️</span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-600">{s.tipo_servicio}</span>
                                    <h3 className="mt-3 text-lg font-bold text-gray-900">{s.nombre}</h3>
                                    <p className="mt-1 line-clamp-3 flex-1 text-sm text-gray-500">
                                        {s.descripcion_corta || s.descripcion}
                                    </p>
                                    <p className="mt-3 text-sm font-extrabold text-blue-600">
                                        {formatearMoneda(ivaMin.precioTotal)} - {formatearMoneda(ivaMax.precioTotal)}
                                    </p>
                                    <p className="text-xs text-gray-400">IVA (19%) incluido</p>
                                </div>
                            </div>
                        );})}
                    </div>
                </div>
            )}
            {tabActiva === "facturas" && <FacturasPanel puedeCrear={false} />}
            {tabActiva === "pqr" && <MisPqr />}
        </DashboardLayout>
    );
};
export default PanelCliente;
