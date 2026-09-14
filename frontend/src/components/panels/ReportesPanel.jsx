import React, { useState } from "react";
import Boton from "../Boton";
import Label from "../Label";
import { descargarArchivo } from "../../utils/download";

const ENTIDADES_DISPONIBLES = {
    usuarios: {
        label: "Usuarios",
        endpoint: "/reportes/usuarios",
        filtros: ["estado"],
    },
    empleados: {
        label: "Empleados",
        endpoint: "/reportes/empleados",
        filtros: ["estado"],
    },
    productos: {
        label: "Productos",
        endpoint: "/reportes/productos",
        filtros: ["categoria", "estado"],
    },
    servicios: {
        label: "Servicios",
        endpoint: "/reportes/servicios",
        filtros: ["categoria", "estado"],
    },
    ventas: {
        label: "Ventas (diario/rango)",
        endpoint: "/ventas/reporte",
        filtros: ["estado", "fecha_desde", "fecha_hasta"],
    },
    facturas: {
        label: "Facturas",
        endpoint: "/facturas/exportar",
        filtros: ["estado", "fecha_desde", "fecha_hasta"],
        soloExcel: true,
    },
};

/**
 * Panel de reportes. `entidadesPermitidas` controla qué reportes puede ver
 * cada rol (por ejemplo, el empleado no accede a reportes de usuarios).
 */
const ReportesPanel = ({ entidadesPermitidas }) => {
    const [entidad, setEntidad] = useState(entidadesPermitidas[0]);
    const [filtros, setFiltros] = useState({});
    const [descargando, setDescargando] = useState("");
    const [error, setError] = useState("");

    const config = ENTIDADES_DISPONIBLES[entidad];

    const handleFiltroChange = (e) => {
        setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const construirQuery = () => {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([clave, valor]) => {
            if (valor) params.append(clave, valor);
        });
        const query = params.toString();
        return query ? `?${query}` : "";
    };

    const handleDescargar = async (formato) => {
        setError("");
        try {
            setDescargando(formato);
            const query = construirQuery();
            const ruta = config.soloExcel
                ? `${config.endpoint}/excel${query}`
                : `${config.endpoint}/${formato}${query}`;
            const extension = formato === "pdf" ? "pdf" : "xlsx";
            await descargarArchivo(ruta, `reporte_${entidad}.${extension}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setDescargando("");
        }
    };

    const renderFiltro = (nombre) => {
        if (nombre === "estado") {
            const opciones =
                entidad === "usuarios" || entidad === "empleados"
                    ? ["activo", "inactivo", "bloqueado"]
                    : entidad === "facturas"
                    ? ["pendiente", "pagada", "anulada"]
                    : entidad === "ventas"
                    ? ["pendiente", "completada", "anulada"]
                    : ["activo", "inactivo"];
            return (
                <div key={nombre}>
                    <Label htmlFor="estado">Estado</Label>
                    <select
                        id="estado"
                        name="estado"
                        value={filtros.estado || ""}
                        onChange={handleFiltroChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    >
                        <option value="">Todos</option>
                        {opciones.map((op) => (
                            <option key={op} value={op}>{op}</option>
                        ))}
                    </select>
                </div>
            );
        }
        if (nombre === "categoria") {
            return (
                <div key={nombre}>
                    <Label htmlFor="categoria">Categoría</Label>
                    <input
                        id="categoria"
                        name="categoria"
                        value={filtros.categoria || ""}
                        onChange={handleFiltroChange}
                        placeholder="Ej: Software, Hardware..."
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                </div>
            );
        }
        if (nombre === "fecha_desde" || nombre === "fecha_hasta") {
            return (
                <div key={nombre}>
                    <Label htmlFor={nombre}>{nombre === "fecha_desde" ? "Desde" : "Hasta"}</Label>
                    <input
                        id={nombre}
                        type="date"
                        name={nombre}
                        value={filtros[nombre] || ""}
                        onChange={handleFiltroChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Reportes</h2>
                <p className="text-sm text-gray-500">
                    Genera reportes en PDF o Excel con los filtros que necesites.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ⚠️ {error}
                </div>
            )}

            <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <Label htmlFor="entidad">Tipo de reporte</Label>
                    <select
                        id="entidad"
                        value={entidad}
                        onChange={(e) => {
                            setEntidad(e.target.value);
                            setFiltros({});
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    >
                        {entidadesPermitidas.map((clave) => (
                            <option key={clave} value={clave}>{ENTIDADES_DISPONIBLES[clave].label}</option>
                        ))}
                    </select>
                </div>

                {config.filtros.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {config.filtros.map((filtro) => renderFiltro(filtro))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {!config.soloExcel && (
                        <Boton
                            variant="primary"
                            onClick={() => handleDescargar("pdf")}
                            disabled={Boolean(descargando)}
                        >
                            {descargando === "pdf" ? "Generando..." : "📄 Descargar PDF"}
                        </Boton>
                    )}
                    <Boton
                        variant="success"
                        onClick={() => handleDescargar("excel")}
                        disabled={Boolean(descargando)}
                    >
                        {descargando === "excel" ? "Generando..." : "📊 Descargar Excel"}
                    </Boton>
                </div>
            </div>
        </div>
    );
};

export default ReportesPanel;
