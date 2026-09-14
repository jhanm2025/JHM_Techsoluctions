import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import WhatsAppButton from "../components/WhatsAppButton";
function Index() {
  const servicios = [
    { icon: "💻", title: "Desarrollo de Software", description: "Diseñamos y desarrollamos aplicaciones web modernas, escalables y adaptadas a las necesidades de cada negocio." },
    { icon: "🌐", title: "Diseño Web", description: "Creamos sitios web profesionales, responsivos y optimizados para ofrecer una excelente experiencia de usuario." },
    { icon: "☁️", title: "Soluciones Cloud", description: "Implementamos soluciones en la nube para mejorar la disponibilidad, seguridad y escalabilidad de tus aplicaciones." },
    { icon: "📊", title: "Datos y Analítica", description: "Convertimos los datos de tu organización en información útil para apoyar la toma de decisiones estratégicas." },
    { icon: "🔐", title: "Ciberseguridad", description: "Evaluamos y fortalecemos la seguridad de sistemas, aplicaciones e infraestructura tecnológica." },
    { icon: "🤖", title: "Automatización e IA", description: "Integramos automatización e inteligencia artificial para optimizar procesos y aumentar la productividad." },
  ];
  const consultorias = [
    { icon: "🧠", title: "Asesoría Tecnológica", description: "Te ayudamos a identificar las tecnologías adecuadas para resolver las necesidades de tu empresa." },
    { icon: "🚀", title: "Transformación Digital", description: "Diseñamos estrategias para modernizar procesos empresariales mediante herramientas digitales." },
    { icon: "🏗️", title: "Arquitectura de Software", description: "Analizamos y diseñamos arquitecturas robustas, escalables y preparadas para el crecimiento." },
    { icon: "⚙️", title: "Consultoría TI", description: "Evaluamos tu infraestructura tecnológica y proponemos soluciones alineadas con tus objetivos." },
  ];
  const tecnologias = [
    "React", "Vite", "Node.js", "JavaScript", "MySQL",
    "MongoDB", "Docker", "Git", "GitHub", "APIs REST",
    "Cloud", "IA"
  ];
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* HERO + CAROUSEL */}
      <section className="relative overflow-hidden bg-gray-950">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
          {/* INFORMACIÓN */}
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
              🚀 Tecnología para impulsar tu negocio
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Soluciones
              <span className="block text-blue-500">
                tecnológicas
              </span>
              para tu negocio
           </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-400">
              En{" "}
              <strong className="text-white">
                JHM Tech Solutions
              </strong>{" "}
              transformamos ideas y necesidades empresariales en soluciones
              tecnológicas innovadoras, eficientes y escalables.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contacto"
                className="rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white shadow-lg shadow-blue-600/30 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                Solicitar asesoría
              </Link>
              <Link
                to="/servicios"
                className="rounded-lg border border-gray-700 px-6 py-3 text-center font-bold text-gray-200 transition duration-300 hover:border-blue-500 hover:text-blue-400"
              >
                Ver servicios
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-800 pt-6">
              <div>
                <p className="text-2xl font-bold text-white">
                  +10
                </p>
                <p className="text-xs text-gray-500">
                  Soluciones
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  100%
                </p>
                <p className="text-xs text-gray-500">
                  Orientación
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">
                  24/7
                </p>
                <p className="text-xs text-gray-500">
                  Disponibilidad
                </p>
              </div>
            </div>

          </div>

          {/* CAROUSEL */}
          <div className="flex items-center justify-center">

            <div className="w-full max-w-xl rounded-3xl border border-gray-800 bg-gray-900/70 p-3 shadow-2xl backdrop-blur-sm sm:p-4">

              <Carousel />

            </div>

          </div>

        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Servicios tecnológicos
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Soluciones para cada necesidad
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Desarrollamos soluciones tecnológicas pensadas para las
              necesidades reales de tu organización.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio) => (
              <article
                key={servicio.title}
                className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl transition duration-300 group-hover:bg-blue-600">
                  {servicio.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  {servicio.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {servicio.description}
                </p>

                <Link
                  to="/servicios"
                  className="mt-5 inline-flex font-semibold text-blue-600 hover:text-blue-800"
                >
                  Conocer servicio →
                </Link>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* CONSULTORÍAS */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-12 max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Asesorías y consultorías
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Te acompañamos en cada decisión tecnológica
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Analizamos tus necesidades y proponemos alternativas
              tecnológicas alineadas con los objetivos de tu organización.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {consultorias.map((consultoria) => (
              <article
                key={consultoria.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {consultoria.icon}
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  {consultoria.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {consultoria.description}
                </p>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* TECNOLOGÍAS */}
      <section className="bg-gray-950 px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Tecnologías
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white">
              Herramientas que utilizamos
            </h2>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {tecnologias.map((tecnologia) => (
              <span
                key={tecnologia}
                className="rounded-full border border-gray-700 bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-blue-500 hover:text-blue-400"
              >
                {tecnologia}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            ¿Tienes un proyecto en mente?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Conversemos sobre tu idea y encontremos juntos una solución
            tecnológica.
          </p>

          <Link
            to="/contacto"
            className="mt-7 inline-flex rounded-lg bg-white px-8 py-3.5 font-bold text-blue-600 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
          >
            Solicitar asesoría
          </Link>

        </div>
      </section>

      {/* WHATSAPP */}
      <WhatsAppButton />

    </div>
  );
}

export default Index;