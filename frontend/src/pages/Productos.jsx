import React, { useEffect, useMemo, useState } from "react";
import WhatsAppButton from "../components/WhatsAppButton";
import ModalProducto from "../components/ModalProducto";
import { apiFetch, resolverUrlArchivo } from "../utils/api";
import { calcularIva, formatearMoneda } from "../utils/iva";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        const data = await apiFetch("/productos/?estado=activo", { auth: false });
        setProductos(data);
      } catch (err) {
        setError(err.message || "No fue posible cargar los productos.");
      } finally {
        setCargando(false);
      }
    };
    cargarProductos();
  }, []);

  // Las categorías se calculan dinámicamente a partir de los productos
  // registrados desde el panel administrativo (sin duplicar información).
  const categorias = useMemo(() => {
    const unicas = Array.from(new Set(productos.map((p) => p.categoria)));
    return ["Todos", ...unicas];
  }, [productos]);

  const productosFiltrados = categoria === "Todos" ? productos : productos.filter((p) => p.categoria === categoria);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <section className="relative overflow-hidden bg-gray-950">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">JHM Tech Solutions</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Productos y
              <span className="block text-blue-500">soluciones tecnológicas</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Descubre soluciones tecnológicas diseñadas para apoyar la transformación digital, optimizar procesos y fortalecer la productividad de tu organización.
            </p>
          </div>
        </div>
      </section>

      {categorias.length > 1 && (
        <section className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap gap-2">
              {categorias.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategoria(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 ${categoria === item ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Nuestro portafolio</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Soluciones para diferentes necesidades
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              Selecciona una categoría para conocer las soluciones disponibles y encuentra la alternativa que mejor se adapte a tu proyecto.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          )}

          {cargando && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Cargando productos...
            </div>
          )}

          {!cargando && !error && (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productosFiltrados.map(producto => {
                const imagenUrl = resolverUrlArchivo(producto.imagen);
                const iva = calcularIva(producto.precio);
                return (
                  <article
                    key={producto.id_producto}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl">
                    <div className="flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
                      {imagenUrl ? (
                        <img src={imagenUrl} alt={producto.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-4xl transition duration-300 group-hover:scale-110">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {producto.categoria}
                      </span>
                      <h3 className="mt-3 min-h-[3.5rem] text-lg font-extrabold text-gray-900">
                        {producto.nombre}
                      </h3>
                      <p className="mt-4 min-h-[6rem] text-sm leading-6 text-gray-600">
                        {producto.descripcion}
                      </p>
                      <div className="mt-auto border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Precio (IVA incluido)
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-blue-600">
                          {formatearMoneda(iva.precioTotal)}
                        </p>

                        <button
                          type="button"
                          onClick={() => setProductoSeleccionado(producto)}
                          className="mt-4 flex w-full items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition duration-300 hover:bg-blue-600"
                        >
                          Ver más detalles
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!cargando && !error && productosFiltrados.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-500">
                {productos.length === 0
                  ? "Aún no hay productos publicados. Vuelve pronto."
                  : "No encontramos productos en esta categoría."}
              </p>
            </div>
          )}
        </div>
      </section>

      <ModalProducto
        producto={productoSeleccionado}
        isOpen={Boolean(productoSeleccionado)}
        onClose={() => setProductoSeleccionado(null)}
      />

      <section className="bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Soluciones a la medida</span>

            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              No todos los proyectos necesitan la misma solución
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              En JHM Tech Solutions analizamos las necesidades de cada cliente para recomendar, adaptar o desarrollar una solución tecnológica acorde con sus objetivos.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">🔎</div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">01. Analizamos</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Identificamos los requerimientos, necesidades y objetivos del proyecto.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">💡</div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">02. Proponemos</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Diseñamos una alternativa tecnológica que responda a las necesidades identificadas.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">🚀</div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">03. Implementamos</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">Acompañamos la implementación y evolución de la solución tecnológica.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-blue-600 px-6 py-14 lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            ¿Necesitas una solución personalizada?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-blue-100">
            Cuéntanos sobre tu proyecto y nuestro equipo te ayudará a definir la mejor alternativa tecnológica.
          </p>

          <a
            href="mailto:contacto@jhmtechsolutions.com"
            className="mt-6 inline-flex rounded-xl bg-white px-7 py-3.5 font-bold text-blue-600 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
          >
            Solicitar asesoría
          </a>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}

export default Productos;
