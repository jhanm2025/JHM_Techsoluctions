import React from "react";
import { Routes, Route } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import RecuperarContrasena from "./components/RecuperarContrasena";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

import Index from "./pages/Index";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import Servicios from "./pages/Servicios";
import Productos from "./pages/Productos";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EmpleadoDashboard from "./pages/empleado/EmpleadoDashboard";
import PanelCliente from "./pages/panelcliente";


function App() {

  return (
    <Routes>
      {/* ============= SITIO PÚBLICO (con Header y Footer) ============= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      </Route>

      {/* ============= PANELES PROTEGIDOS (sin Header/Footer, con Sidebar propio) ============= */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute rolesPermitidos={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empleado/*"
        element={
          <ProtectedRoute rolesPermitidos={["empleado"]}>
            <EmpleadoDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/panel-cliente/*"
        element={
          <ProtectedRoute rolesPermitidos={["cliente"]}>
            <PanelCliente />
          </ProtectedRoute>
        }
      />
    </Routes>
  )

}

export default App;
