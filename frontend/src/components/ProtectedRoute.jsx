import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege una ruta según autenticación y, opcionalmente, un listado de
 * roles permitidos. Si el usuario no cumple, se redirige apropiadamente.
 */
const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
    const { isAuthenticated, rol, rutaPanel } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
        return <Navigate to={rutaPanel(rol)} replace />;
    }

    return children;
};

export default ProtectedRoute;
