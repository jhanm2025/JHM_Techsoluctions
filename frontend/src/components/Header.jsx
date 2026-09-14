import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Chevron = ({ open }) => (
    <svg className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const PanelIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zM13 21h8v-8h-8v8zM13 3h8v6h-8V3zM3 21h8v-6H3v6z" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
);

const MenuIcon = ({ open }) => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        )}
    </svg>
);

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, usuario, rutaPanel, logout } = useAuth();

    const navItems = [
        { name: "Inicio", path: "/" },
        { name: "¿Quiénes Somos?", path: "/quienes-somos" },
        { name: "Contacto", path: "/contacto" },
        { name: "Servicios", path: "/servicios" },
        { name: "Productos", path: "/productos" }
    ];

    const isActive = (path) => location.pathname === path;

    const closeMenus = () => {
        setMenuOpen(false);
        setUserMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        closeMenus();
        navigate("/iniciar-sesion");
    };

    return (
        <header className="fixed inset-x-0 top-0 z-[9999] w-full border-b border-gray-200 bg-gray-100 shadow-xl">
            <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                <Link to="/" onClick={closeMenus} className="flex shrink-0 items-center transition duration-300 hover:scale-[1.02]">
                    <img src="/logotech3.png" alt="JHM Tech Solutions" className="h-14 w-auto object-contain sm:h-16 lg:h-[70px]" />
                </Link>

                {/* ================= DESKTOP ================= */}
                <nav className="hidden shrink-0 items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setUserMenuOpen(false)}
                            className={`group relative whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${isActive(item.path) ? "text-blue-400" : "text-gray-600 hover:text-blue-400"}`}>
                            {item.name}
                            <span className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-blue-500 transition-all duration-300 ${isActive(item.path) ? "w-3/4" : "w-0 group-hover:w-3/4"}`} />
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <div className="relative ml-3">
                            <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-expanded={userMenuOpen}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gray-200">
                                <div className="hidden max-w-[160px] text-right xl:block">
                                    <p className="truncate text-sm font-bold text-gray-900">{usuario?.nombres} {usuario?.apellidos}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">{usuario?.rol}</p>
                                </div>
                                <Chevron open={userMenuOpen} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full z-[10000] mt-3 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                        <p className="truncate text-sm font-bold text-gray-900">{usuario?.nombres} {usuario?.apellidos}</p>
                                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-blue-600">{usuario?.rol}</p>
                                    </div>

                                    <Link to={rutaPanel(usuario?.rol)} onClick={closeMenus}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-600">
                                        <PanelIcon /> <span>Mi panel</span>
                                    </Link>

                                    <button type="button" onClick={handleLogout}
                                        className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600">
                                        <LogoutIcon /> <span>Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/iniciar-sesion"
                            className={`ml-3 flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${isActive("/iniciar-sesion") ? "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "border-blue-500 bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"}`}>
                            Iniciar Sesión
                        </Link>
                    )}
                </nav>

                {/* ================= MOBILE BUTTON ================= */}
                <button type="button" onClick={() => { setMenuOpen(!menuOpen); setUserMenuOpen(false); }}
                    className="rounded-lg border border-gray-700 p-2 text-gray-700 transition hover:border-blue-500 hover:text-blue-500 md:hidden"
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>
                    <MenuIcon open={menuOpen} />
                </button>
            </div>

            {/* ================= MOBILE MENU ================= */}
            <div className={`border-t border-gray-800 bg-gray-950 transition-all duration-300 md:hidden ${menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
                <nav className="flex flex-col px-5 py-4">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={closeMenus}
                            className={`border-b border-gray-800 px-3 py-4 text-sm font-semibold transition ${isActive(item.path) ? "text-blue-400" : "text-gray-200 hover:text-blue-400"}`}>
                            {item.name}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <div className="mt-4">
                            <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-left transition hover:border-blue-500">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">{usuario?.nombres} {usuario?.apellidos}</p>
                                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-blue-400">{usuario?.rol}</p>
                                </div>
                                <Chevron open={userMenuOpen} />
                            </button>

                            {userMenuOpen && (
                                <div className="mt-2 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                                    <Link to={rutaPanel(usuario?.rol)} onClick={closeMenus}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-blue-600 hover:text-white">
                                        <PanelIcon /> <span>Mi panel</span>
                                    </Link>

                                    <button type="button" onClick={handleLogout}
                                        className="flex w-full items-center gap-3 border-t border-gray-700 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white">
                                        <LogoutIcon /> <span>Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/iniciar-sesion" onClick={closeMenus}
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500">
                            Iniciar Sesión
                        </Link>
                    )}
                </nav>
            </div>

            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </header>
    );
}

export default Header;