import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import DashboardPanel from "../../components/panels/DashboardPanel";
import ProductosPanel from "../../components/panels/ProductosPanel";
import ServiciosPanel from "../../components/panels/ServiciosPanel";
import VentasPanel from "../../components/panels/VentasPanel";
import FacturasPanel from "../../components/panels/FacturasPanel";
import PqrPanel from "../../components/panels/PqrPanel";
import ReportesPanel from "../../components/panels/ReportesPanel";
import { useAuth } from "../../context/AuthContext";

const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "productos", label: "📦 Productos" },
    { id: "servicios", label: "🛠️ Servicios" },
    { id: "ventas", label: "💰 Ventas" },
    { id: "facturacion", label: "🧾 Facturas" },
    { id: "pqr", label: "📝 PQR" },
    { id: "reportes", label: "📈 Reportes" },
];

// El empleado NO tiene acceso a reportes de usuarios/empleados (solo admin).
const ENTIDADES_REPORTES_EMPLEADO = ["productos", "servicios", "ventas", "facturas"];

const EmpleadoDashboard = () => {
    const { usuario } = useAuth();
    const [tabActiva, setTabActiva] = useState("dashboard");

    return (
        <DashboardLayout
            titulo="Panel de Empleado"
            subtitulo={`Bienvenido, ${usuario?.nombres || ""}`}
            tabs={TABS}
            tabActiva={tabActiva}
            onCambiarTab={setTabActiva}
        >
            {tabActiva === "dashboard" && <DashboardPanel />}
            {/* Los empleados pueden crear y editar, pero no eliminar (puedeEliminar=false) */}
            {tabActiva === "productos" && <ProductosPanel puedeEliminar={false} />}
            {tabActiva === "servicios" && <ServiciosPanel puedeEliminar={false} />}
            {tabActiva === "ventas" && <VentasPanel />}
            {tabActiva === "facturacion" && <FacturasPanel puedeCrear={false} />}
            {tabActiva === "pqr" && <PqrPanel />}
            {tabActiva === "reportes" && <ReportesPanel entidadesPermitidas={ENTIDADES_REPORTES_EMPLEADO} />}
        </DashboardLayout>
    );
};

export default EmpleadoDashboard;
