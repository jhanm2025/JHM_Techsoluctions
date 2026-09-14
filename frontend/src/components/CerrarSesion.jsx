import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Botón de cerrar sesión reutilizable. Limpia el token/usuario del
 * AuthContext (y del localStorage) y redirige al login.
 */
const CerrarSesion = ({ className = "btn-logout" }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Cerrar sesión
    </button>
  );
};

export default CerrarSesion;
