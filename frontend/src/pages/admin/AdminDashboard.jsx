import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import DashboardPanel from "../../components/panels/DashboardPanel";
import UsuariosPanel from "../../components/panels/UsuariosPanel";
import EmpleadosPanel from "../../components/panels/EmpleadosPanel";
import ProductosPanel from "../../components/panels/ProductosPanel";
import ServiciosPanel from "../../components/panels/ServiciosPanel";
import VentasPanel from "../../components/panels/VentasPanel";
import FacturasPanel from "../../components/panels/FacturasPanel";
import PqrPanel from "../../components/panels/PqrPanel";
import ReportesPanel from "../../components/panels/ReportesPanel";
import { useAuth } from "../../context/AuthContext";

const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "usuarios", label: "👥 Usuarios" },
    { id: "empleados", label: "🧑‍💼 Empleados" },
    { id: "productos", label: "📦 Productos" },
    { id: "servicios", label: "🛠️ Servicios" },
    { id: "ventas", label: "💰 Ventas" },
    { id: "facturacion", label: "🧾 Facturas" },
    { id: "pqr", label: "📝 PQR" },
    { id: "reportes", label: "📈 Reportes" },
];

const ENTIDADES_REPORTES_ADMIN = ["usuarios", "empleados", "productos", "servicios", "ventas", "facturas"];

const AdminDashboard = () => {
    const { usuario } = useAuth();
    const [tabActiva, setTabActiva] = useState("dashboard");

    return (
        <DashboardLayout
            titulo="Panel de Administrador"
            subtitulo={`Bienvenido, ${usuario?.nombres || ""}`}
            tabs={TABS}
            tabActiva={tabActiva}
            onCambiarTab={setTabActiva}
        >
            {tabActiva === "dashboard" && <DashboardPanel esAdmin />}
            {tabActiva === "usuarios" && <UsuariosPanel />}
            {tabActiva === "empleados" && <EmpleadosPanel />}
            {tabActiva === "productos" && <ProductosPanel puedeEliminar />}
            {tabActiva === "servicios" && <ServiciosPanel puedeEliminar />}
            {tabActiva === "ventas" && <VentasPanel />}
            {tabActiva === "facturacion" && <FacturasPanel puedeCrear={false} />}
            {tabActiva === "pqr" && <PqrPanel />}
            {tabActiva === "reportes" && <ReportesPanel entidadesPermitidas={ENTIDADES_REPORTES_ADMIN} />}
        </DashboardLayout>
    );
};

export default AdminDashboard;
