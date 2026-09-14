import React, { createContext, useContext, useState, useCallback } from "react";
import { apiFetch, saveSession, clearSession, getStoredUser, getToken } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(getStoredUser());
    const [token, setToken] = useState(getToken());

    const login = useCallback(async (email, password) => {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            auth: false,
            body: { email, password },
        });
        saveSession(data.access_token, data.usuario);
        setToken(data.access_token);
        setUsuario(data.usuario);
        return data.usuario;
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setToken(null);
        setUsuario(null);
    }, []);

    const rutaPanel = (rol) => {
        if (rol === "admin") return "/admin";
        if (rol === "empleado") return "/empleado";
        return "/panel-cliente";
    };

    const value = {
        usuario,
        token,
        isAuthenticated: Boolean(token && usuario),
        rol: usuario?.rol || null,
        login,
        logout,
        rutaPanel,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
    }
    return context;
}
