import React from "react";
const Boton = ({ children, type = "button", onClick, disabled = false, variant = "primary", className = "" }) => {
    const estilos = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        outline: "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`w-full rounded-xl px-5 py-3 font-bold shadow-md transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variant]} ${className}`}>
            {children}
        </button>
    );
};
export default Boton;