import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  const servicios = [
    "Desarrollo de Software",
    "Diseño Web",
    "Consultoría TI",
    "Asesoría Tecnológica",
    "Transformación Digital",
    "Ciberseguridad",
  ];
  const enlacesEmpresa = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "¿Quiénes Somos?", ruta: "/quienes-somos" },
    { nombre: "Servicios", ruta: "/servicios" },
    { nombre: "Contacto", ruta: "/contacto" },
    { nombre: "Iniciar Sesión", ruta: "/iniciar-sesion" },
  ];
  return (
    <footer className="relative overflow-hidden bg-gray-950 text-gray-300">
      {/* Línea superior */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      {/* Efectos decorativos */}
      <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      {/* Contenido */}
      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
       <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Empresa */}
          <div className="text-left lg:col-span-1">
            <Link to="/" className="inline-flex transition duration-300 hover:opacity-90">
              <img src="/logoblanco-remo.png" alt="JHM Tech Solutions" className="h-20 w-auto object-contain" />
            </Link>
            <p className="mt-4 max-w-sm text-left text-sm leading-6 text-gray-400">
              Soluciones tecnológicas para impulsar la transformación digital
              de tu negocio mediante innovación, desarrollo de software y
              consultoría especializada.
            </p>
            {/* Redes sociales */}
            <div className="mt-5 text-left">
              <p className="mb-3 text-sm font-semibold text-white">
                Síguenos en nuestras redes
              </p>
              <div className="flex gap-2.5">
                {/* Facebook */}
                <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-gray-400 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white">
                  <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 8h3V5h-3c-2.21 0-4 1.79-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9c0-.55.45-1 1-1z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-gray-400 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-gray-400 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white">
                  <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.5 8A2.5 2.5 0 1 0 6.5 3a2.5 2.5 0 0 0 0 5ZM4 10h5v10H4V10Zm7 0h5v1.36c.7-1.02 1.94-1.86 3.72-1.86C22.28 9.5 23 12.04 23 15.1V20h-5v-4.3c0-1.03-.02-2.7-1.65-2.7-1.65 0-1.9 1.28-1.9 2.62V20h-3V10Z" />
                  </svg>
                </a>             
              </div>
            </div>
          </div>
          {/* Servicios */}
          <div className="text-left">
            <h3 className="relative mb-5 inline-block text-base font-bold text-white">
              Servicios
              <span className="absolute -bottom-2 left-0 h-0.5 w-7 rounded-full bg-blue-500" />
            </h3>
            <ul className="space-y-2.5 text-sm">
              {servicios.map((servicio) => (
                <li key={servicio}>
                  <Link to="/servicios" className="group flex items-center text-gray-400 transition duration-300 hover:text-blue-400">
                    <span className="mr-2 text-blue-500 transition group-hover:translate-x-1">→</span>
                    {servicio}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Empresa */}
          <div className="text-left">
            <h3 className="relative mb-5 inline-block text-base font-bold text-white">
              Empresa
              <span className="absolute -bottom-2 left-0 h-0.5 w-7 rounded-full bg-blue-500" />
            </h3>
            <ul className="space-y-2.5 text-sm">
              {enlacesEmpresa.map((enlace) => (
                <li key={enlace.nombre}>
                  <Link to={enlace.ruta} className="flex items-center text-gray-400 transition hover:translate-x-1 hover:text-blue-400">
                    <span className="mr-2 text-blue-500">→</span>
                    {enlace.nombre}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-gray-800 pt-4">
              <p className="text-xs leading-5 text-gray-500">
                Tecnología, innovación y soluciones digitales para empresas.
              </p>
            </div>
          </div>
          {/* Contacto */}
          <div className="text-left">
            <h3 className="relative mb-5 inline-block text-base font-bold text-white">
              Contacto
              <span className="absolute -bottom-2 left-0 h-0.5 w-7 rounded-full bg-blue-500" />
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  ✉
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-200">Email</p>
                  <a href="mailto:contacto@jhmtechsolutions.com" className="mt-0.5 block break-all text-gray-400 transition hover:text-blue-400">
                    contacto@jhmtechsolutions.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  ☎
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Teléfono</p>
                  <a href="tel:+573000000000" className="mt-0.5 block text-gray-400 transition hover:text-blue-400">
                    +57 300 000 0000
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  📍
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Ubicación</p>
                  <p className="mt-0.5 text-gray-400">
                    Medellín, Antioquia, Colombia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="border-t border-gray-800 bg-black/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-4 text-left text-xs text-gray-500 sm:flex-row sm:items-center lg:px-8">
          <p>
            © {year}{" "}
            <span className="font-semibold text-gray-300">
              JHM Tech Solutions
            </span>
            . Todos los derechos reservados.
          </p>
          <p className="text-gray-300 ">
            Soluciones tecnológicas para tu negocio.
          </p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;