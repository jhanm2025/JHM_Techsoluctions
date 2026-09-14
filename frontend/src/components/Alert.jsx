import React from "react"; 

const Alert = ({ isOpen, type = "success", title, message, buttonText = "Continuar", onClose }) => {
    if (!isOpen) return null;
    const styles = {
        success: {
            icon: "✓",
            title: title || "Registro exitoso",
            iconStyle: "bg-green-100 text-green-600",
            button: "bg-blue-700 hover:bg-blue-800"
        },
        error: {
            icon: "!",
            title: title || "Ha ocurrido un error",
            iconStyle: "bg-red-100 text-red-600",
            button: "bg-red-600 hover:bg-red-700"
        },
        warning: {
            icon: "!",
            title: title || "Advertencia",
            iconStyle: "bg-yellow-100 text-yellow-600",
            button: "bg-yellow-600 hover:bg-yellow-700"
        },
        info: {
            icon: "i",
            title: title || "Información",
            iconStyle: "bg-blue-100 text-blue-600",
            button: "bg-blue-700 hover:bg-blue-800"
        }
    };
    const current = styles[type] || styles.success;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-gray-950 via-blue-800 to-blue-500" />
                <div className="px-6 py-6 text-center">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ${current.iconStyle}`}>
                        {current.icon}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900">{current.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{message}</p>
                    <button type="button" onClick={onClose} className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition duration-200 ${current.button}`}>
                        {buttonText}
                    </button>
                    <p className="mt-4 text-xs font-medium text-gray-400">JHM Tech Solutions</p>
                </div>
            </div>
        </div>
    );
};
export default Alert;