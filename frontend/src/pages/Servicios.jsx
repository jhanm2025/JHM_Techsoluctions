import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppButton from "../components/WhatsAppButton";
import ModalServicio from "../components/ModalServicio";
import { apiFetch, resolverUrlArchivo } from "../utils/api";
import { calcularIva, formatearMoneda } from "../utils/iva";

function Servicios() {

  // =========================================================
  // SERVICIOS (datos reales gestionados desde el panel administrativo)
  // =========================================================

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setCargando(true);
        const data = await apiFetch("/servicios/?estado=activo", { auth: false });
        setServicios(data);
      } catch (err) {
        setError(err.message || "No fue posible cargar los servicios.");
      } finally {
        setCargando(false);
      }
    };
    cargarServicios();
  }, []);

  // Las categorías se calculan dinámicamente a partir de los servicios
  // registrados desde el panel administrativo (se evita duplicar información).
  const categorias = useMemo(() => {
    const unicas = Array.from(new Set(servicios.map((s) => s.categoria)));
    return ["Todos", ...unicas];
  }, [servicios]);

  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  // =========================================================
  // FILTRAR SERVICIOS
  // =========================================================

  const serviciosFiltrados =
    categoriaActiva === "Todos"
      ? servicios
      : servicios.filter(
          (servicio) => servicio.categoria === categoriaActiva
        );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gray-950">

        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">

          <div className="max-w-4xl">

            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
              JHM Tech Solutions
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">

              Soluciones tecnológicas

              <span className="block text-blue-500">
                diseñadas para tu proyecto
              </span>

            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-400">
              Ofrecemos servicios de consultoría, asesoría, desarrollo e
              innovación tecnológica para empresas, emprendimientos y
              profesionales.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">

              <a
                href="#catalogo"
                className="rounded-lg bg-blue-600 px-7 py-3.5 text-center font-bold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                Explorar servicios
              </a>

              <Link
                to="/contacto"
                className="rounded-lg border border-gray-700 px-7 py-3.5 text-center font-bold text-gray-200 transition duration-300 hover:border-blue-500 hover:text-blue-400"
              >
                Solicitar cotización
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PROPUESTA DE VALOR
      ====================================================== */}

      <section className="bg-white px-6 py-16">

        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl">
              🎯
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Soluciones a la medida
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Diseñamos soluciones adaptadas a las necesidades, objetivos y
              presupuesto de cada proyecto.
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl">
              💬
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Acompañamiento
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Acompañamos cada proyecto desde el diagnóstico hasta la
              implementación y evolución de la solución.
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl">
              📊
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Orientación a resultados
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Buscamos que cada inversión tecnológica genere valor y
              contribuya al crecimiento de nuestros clientes.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          TECNOLOGÍAS ESTRATÉGICAS
      ====================================================== */}

      <section className="bg-gray-950 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Tecnologías emergentes
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Innovación para el futuro
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Incorporamos tecnologías emergentes para ayudar a las
              organizaciones a mejorar procesos, proteger información y
              desarrollar nuevas capacidades digitales.
            </p>

          </div>

          <div className="grid gap-7 md:grid-cols-3">

            {/* IA */}

            <button
              type="button"
              onClick={() => setCategoriaActiva("Inteligencia Artificial")}
              className="group rounded-3xl border border-gray-800 bg-gray-900 p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/20"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-4xl">
                🤖
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Inteligencia Artificial
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Automatización, asistentes inteligentes, análisis de
                información e integración de soluciones basadas en IA.
              </p>

              <div className="mt-6 text-sm font-semibold text-blue-400">
                Ver servicios de IA →
              </div>

            </button>

            {/* CIBERSEGURIDAD */}

            <button
              type="button"
              onClick={() => setCategoriaActiva("Ciberseguridad")}
              className="group rounded-3xl border border-gray-800 bg-gray-900 p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/20"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-4xl">
                🔐
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Ciberseguridad
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Evaluación de riesgos, protección de información, buenas
                prácticas y fortalecimiento de la seguridad tecnológica.
              </p>

              <div className="mt-6 text-sm font-semibold text-blue-400">
                Ver servicios de seguridad →
              </div>

            </button>

            {/* INDUSTRIA 4.0 */}

            <button
              type="button"
              onClick={() => setCategoriaActiva("Industria 4.0")}
              className="group rounded-3xl border border-gray-800 bg-gray-900 p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/20"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-4xl">
                🏭
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Industria 4.0
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                IoT, automatización, analítica de datos, inteligencia
                artificial y tecnologías para transformar procesos.
              </p>

              <div className="mt-6 text-sm font-semibold text-blue-400">
                Ver servicios Industria 4.0 →
              </div>

            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          CATÁLOGO DE SERVICIOS
      ====================================================== */}

      <section
        id="catalogo"
        className="bg-gray-50 px-6 py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Catálogo de servicios
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Encuentra la solución para tu proyecto
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Selecciona una categoría para consultar nuestros servicios de
              asesoría, consultoría, desarrollo e innovación.
            </p>

          </div>

          {/* =================================================
              FILTROS
          ================================================== */}

          {categorias.length > 1 && (
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaActiva(cat)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 ${
                    categoriaActiva === cat
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          )}

          {cargando && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Cargando servicios...
            </div>
          )}

          {/* =================================================
              GRID DE SERVICIOS
          ================================================== */}

          {!cargando && !error && (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serviciosFiltrados.map((servicio) => {
                const imagenUrl = resolverUrlArchivo(servicio.imagen);
                const ivaMin = calcularIva(servicio.precio_minimo);
                const ivaMax = calcularIva(servicio.precio_maximo);
                return (
                  <article
                    key={servicio.id_servicio}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl"
                  >
                    <div className="flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
                      {imagenUrl ? (
                        <img src={imagenUrl} alt={servicio.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-4xl transition duration-300 group-hover:scale-110">
                          🛠️
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {servicio.categoria}
                      </span>
                      <h3 className="mt-3 min-h-[3.5rem] text-lg font-extrabold text-gray-900">
                        {servicio.nombre}
                      </h3>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {servicio.tipo_servicio}
                      </p>
                      <p className="mt-4 min-h-[6rem] text-sm leading-6 text-gray-600">
                        {servicio.descripcion_corta || servicio.descripcion}
                      </p>
                      <div className="mt-auto border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Inversión orientativa (IVA incl.)
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-blue-600">
                          {formatearMoneda(ivaMin.precioTotal)} - {formatearMoneda(ivaMax.precioTotal)}
                        </p>

                        <button
                          type="button"
                          onClick={() => setServicioSeleccionado(servicio)}
                          className="mt-4 flex w-full items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-bold text-white transition duration-300 hover:bg-blue-600"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!cargando && !error && serviciosFiltrados.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-500">
                {servicios.length === 0
                  ? "Aún no hay servicios publicados. Vuelve pronto."
                  : "No encontramos servicios en esta categoría."}
              </p>
            </div>
          )}

          <ModalServicio
            servicio={servicioSeleccionado}
            isOpen={Boolean(servicioSeleccionado)}
            onClose={() => setServicioSeleccionado(null)}
          />

        </div>

      </section>

      {/* =====================================================
          SERVICIOS A LA MEDIDA
      ====================================================== */}

      <section className="bg-gray-950 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Información */}

            <div>

              <span className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Servicios personalizados
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                ¿No encuentras exactamente lo que necesitas?
              </h2>

              <p className="mt-6 leading-8 text-gray-400">
                No todos los proyectos pueden clasificarse dentro de un
                servicio estándar. En JHM Tech Solutions podemos diseñar una
                propuesta personalizada de acuerdo con los objetivos,
                presupuesto y características de tu organización.
              </p>

              <div className="mt-7 space-y-4">

                {[
                  "Análisis de requerimientos",
                  "Definición del alcance",
                  "Estimación de tiempos",
                  "Estimación de recursos",
                  "Propuesta económica",
                  "Plan de trabajo",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3 text-gray-300"
                  >

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      ✓
                    </span>

                    {item}

                  </div>

                ))}

              </div>

              <Link
                to="/contacto"
                className="
                  mt-9
                  inline-flex
                  rounded-lg
                  bg-blue-600
                  px-7
                  py-3.5
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:bg-blue-500
                "
              >
                Solicitar propuesta personalizada
              </Link>

            </div>

            {/* Panel */}

            <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8">

              <div className="text-5xl">
                🧩
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Tu proyecto, tus necesidades
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Podemos combinar diferentes servicios para construir una
                solución integral.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                {[
                  "Consultoría",
                  "UX/UI",
                  "Desarrollo",
                  "Bases de datos",
                  "Inteligencia Artificial",
                  "Ciberseguridad",
                  "IoT",
                  "Industria 4.0",
                ].map((item) => (

                  <div
                    key={item}
                    className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm font-semibold text-gray-300"
                  >
                    {item}
                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRECIOS
      ====================================================== */}

      <section className="bg-white px-6 py-20">

        <div className="mx-auto max-w-5xl text-center">

          <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Transparencia
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            Sobre nuestros precios
          </h2>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-gray-600">
            Los valores publicados son referencias comerciales para 2026.
            El precio definitivo depende del alcance, complejidad, número de
            módulos, tecnologías, integraciones, tiempos de entrega y nivel
            de acompañamiento requerido.
          </p>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-7 text-left">

            <h3 className="font-bold text-gray-900">
              ¿Cómo calculamos una cotización?
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="font-bold text-blue-600">
                  01
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Analizamos la necesidad.
                </p>
              </div>

              <div>
                <p className="font-bold text-blue-600">
                  02
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Definimos el alcance.
                </p>
              </div>

              <div>
                <p className="font-bold text-blue-600">
                  03
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Estimamos recursos y tiempo.
                </p>
              </div>

              <div>
                <p className="font-bold text-blue-600">
                  04
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Presentamos la propuesta.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA FINAL
      ====================================================== */}

      <section className="relative overflow-hidden bg-blue-600 px-6 py-20">

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            ¿Tienes un proyecto en mente?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Cuéntanos qué necesitas y preparemos una solución tecnológica
            ajustada a tu proyecto.
          </p>

          <Link
            to="/contacto"
            className="
              mt-8
              inline-flex
              rounded-lg
              bg-white
              px-8
              py-3.5
              font-bold
              text-blue-600
              shadow-xl
              transition
              duration-300
              hover:-translate-y-1
              hover:bg-gray-100
            "
          >
            Solicitar cotización
          </Link>

        </div>

      </section>
<WhatsAppButton />
    </div>
  );
}
export default Servicios;