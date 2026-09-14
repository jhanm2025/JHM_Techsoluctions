import React from "react";
import { Link } from "react-router-dom";
import WhatsAppButton from "../components/WhatsAppButton";

function QuienesSomos() {
  const valores = [
    {
      icon: "💡",
      title: "Innovación",
      description:
        "Buscamos nuevas formas de utilizar la tecnología para resolver problemas y generar oportunidades.",
    },
    {
      icon: "🎯",
      title: "Compromiso",
      description:
        "Trabajamos con responsabilidad y dedicación para cumplir los objetivos de cada proyecto.",
    },
    {
      icon: "🤝",
      title: "Confianza",
      description:
        "Construimos relaciones profesionales basadas en transparencia, comunicación y respeto.",
    },
    {
      icon: "⚡",
      title: "Eficiencia",
      description:
        "Diseñamos soluciones orientadas a optimizar recursos, procesos y resultados.",
    },
  ];

  const aliados = [
    {
      icon: "☁️",
      title: "Tecnología Cloud",
      description: "Soluciones y servicios basados en la nube.",
    },
    {
      icon: "💻",
      title: "Desarrollo de Software",
      description: "Tecnologías modernas para aplicaciones empresariales.",
    },
    {
      icon: "🔐",
      title: "Seguridad TI",
      description: "Buenas prácticas para proteger información y sistemas.",
    },
    {
      icon: "🤖",
      title: "Innovación e IA",
      description: "Automatización e inteligencia artificial aplicada.",
    },
  ];

  const testimonios = [
    {
      nombre: "Cliente empresarial",
      cargo: "Proyecto tecnológico",
      comentario:
        "El acompañamiento recibido nos permitió entender mejor nuestras necesidades tecnológicas y encontrar una solución adecuada para nuestro proyecto.",
    },
    {
      nombre: "Emprendedor",
      cargo: "Transformación digital",
      comentario:
        "Destacamos la orientación, el compromiso y la capacidad para convertir nuestras ideas en una propuesta tecnológica clara.",
    },
    {
      nombre: "Empresa aliada",
      cargo: "Consultoría TI",
      comentario:
        "Encontramos un equipo dispuesto a escuchar, analizar nuestras necesidades y proponer alternativas orientadas a resultados.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gray-950">

        {/* Luces decorativas */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">

          <div className="max-w-4xl">

            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
              JHM Tech Solutions
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Tecnología que
              <span className="block text-blue-500">
                transforma ideas
              </span>
              en soluciones
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-400">
              Somos una empresa orientada a la asesoría, consultoría y
              desarrollo de soluciones tecnológicas para organizaciones que
              buscan innovar, optimizar sus procesos y avanzar en su
              transformación digital.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">

              <Link
                to="/contacto"
                className="rounded-lg bg-blue-600 px-7 py-3.5 text-center font-bold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                Hablemos de tu proyecto
              </Link>

              <a
                href="#mision"
                className="rounded-lg border border-gray-700 px-7 py-3.5 text-center font-bold text-gray-200 transition hover:border-blue-500 hover:text-blue-400"
              >
                Conócenos
              </a>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          QUIÉNES SOMOS
      ====================================================== */}
      <section className="bg-white px-6 py-20">

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          {/* Texto */}
          <div>

            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              ¿Quiénes somos?
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Un aliado tecnológico para tu organización
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              En <strong className="text-gray-900">JHM Tech Solutions</strong>
              creemos que la tecnología debe ser una herramienta para
              solucionar problemas, mejorar procesos y crear nuevas
              oportunidades.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              Nuestro enfoque combina conocimiento técnico, análisis de
              necesidades y acompañamiento para desarrollar soluciones
              alineadas con los objetivos de nuestros clientes.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              Ofrecemos servicios relacionados con desarrollo de software,
              diseño web, asesoría tecnológica, consultoría TI,
              transformación digital y adopción de nuevas tecnologías.
            </p>

          </div>

          {/* Panel */}
          <div className="relative">

            <div className="absolute inset-0 rounded-3xl bg-blue-600/10 blur-3xl" />

            <div className="relative rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-xl">

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="rounded-2xl bg-gray-950 p-6">
                  <span className="text-3xl">🚀</span>

                  <h3 className="mt-4 font-bold text-white">
                    Innovación
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Exploramos nuevas tecnologías para generar valor.
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-600 p-6">
                  <span className="text-3xl">🎯</span>

                  <h3 className="mt-4 font-bold text-white">
                    Resultados
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Orientamos nuestras soluciones hacia objetivos concretos.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <span className="text-3xl">🤝</span>

                  <h3 className="mt-4 font-bold text-gray-900">
                    Cercanía
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Acompañamos al cliente durante todo el proceso.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <span className="text-3xl">⚙️</span>

                  <h3 className="mt-4 font-bold text-gray-900">
                    Soluciones
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Diseñamos alternativas adaptadas a cada necesidad.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          MISIÓN Y VISIÓN
      ====================================================== */}
      <section
        id="mision"
        className="bg-gray-950 px-6 py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-14 max-w-3xl text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Nuestro propósito
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Misión y visión
            </h2>

          </div>

          <div className="grid gap-8 lg:grid-cols-2">

            {/* MISIÓN */}
            <article className="group rounded-3xl border border-gray-800 bg-gray-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-500/50">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
                🎯
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Nuestra Misión
              </h3>

              <p className="mt-5 leading-8 text-gray-400">
                Brindar asesoría, consultoría y soluciones tecnológicas
                innovadoras que permitan a nuestros clientes optimizar sus
                procesos, fortalecer sus capacidades digitales y aprovechar
                la tecnología como un instrumento para alcanzar sus objetivos
                empresariales.
              </p>

            </article>

            {/* VISIÓN */}
            <article className="group rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-gray-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-500/60">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
                🔭
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                Nuestra Visión
              </h3>

              <p className="mt-5 leading-8 text-gray-300">
                Consolidarnos como un aliado estratégico en tecnología para
                empresas y emprendimientos, reconocidos por la calidad de
                nuestras soluciones, el acompañamiento a nuestros clientes y
                nuestra capacidad para incorporar innovación y nuevas
                tecnologías.
              </p>

            </article>

          </div>
        </div>
      </section>

      {/* =====================================================
          VALORES
      ====================================================== */}
      <section className="bg-gray-50 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-14 text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Lo que nos representa
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Nuestros valores
            </h2>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {valores.map((valor) => (

              <article
                key={valor.title}
                className="group rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl transition group-hover:bg-blue-600">
                  {valor.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  {valor.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {valor.description}
                </p>

              </article>

            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          ALIADOS
      ====================================================== */}
      <section className="bg-white px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-14 max-w-3xl text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Ecosistema tecnológico
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Aliados y áreas de colaboración
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Construimos relaciones y oportunidades de colaboración alrededor
              de diferentes áreas del ecosistema tecnológico.
            </p>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {aliados.map((aliado) => (

              <div
                key={aliado.title}
                className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-lg"
              >

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-950 text-3xl">
                  {aliado.icon}
                </div>

                <h3 className="mt-5 font-bold text-gray-900">
                  {aliado.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {aliado.description}
                </p>

              </div>

            ))}

          </div>

          {/* Espacio para logos reales */}
          <div className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

            <p className="text-sm font-semibold text-gray-500">
              Espacio destinado para los logos de aliados tecnológicos
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">

              {["ALIADO 01", "ALIADO 02", "ALIADO 03", "ALIADO 04"].map(
                (aliado) => (
                  <div
                    key={aliado}
                    className="flex h-16 min-w-36 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-xs font-bold tracking-wider text-gray-400"
                  >
                    {aliado}
                  </div>
                )
              )}

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          CLIENTES SATISFECHOS
      ====================================================== */}
      <section className="bg-gray-950 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-14 max-w-3xl text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Experiencias
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Clientes que confían en nuestro trabajo
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Cada proyecto representa una oportunidad para crear relaciones
              basadas en confianza, comunicación y resultados.
            </p>

          </div>

          {/* Estadísticas */}
          <div className="mb-12 grid gap-5 sm:grid-cols-3">

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7 text-center">
              <p className="text-4xl font-extrabold text-blue-500">
                +10
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Proyectos y soluciones
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7 text-center">
              <p className="text-4xl font-extrabold text-blue-500">
                100%
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Orientación al cliente
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7 text-center">
              <p className="text-4xl font-extrabold text-blue-500">
                ⭐
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Compromiso y acompañamiento
              </p>
            </div>

          </div>

          {/* Testimonios */}
          <div className="grid gap-6 lg:grid-cols-3">

            {testimonios.map((testimonio, index) => (

              <article
                key={index}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-7"
              >

                <div className="text-2xl text-blue-500">
                  “
                </div>

                <p className="mt-3 leading-7 text-gray-400">
                  {testimonio.comentario}
                </p>

                <div className="mt-6 border-t border-gray-800 pt-5">

                  <p className="font-bold text-white">
                    {testimonio.nombre}
                  </p>

                  <p className="mt-1 text-sm text-blue-400">
                    {testimonio.cargo}
                  </p>

                </div>

              </article>

            ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          CTA FINAL
      ====================================================== */}
      <section className="relative overflow-hidden bg-blue-600 px-6 py-20">

        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Hagamos crecer tu proyecto
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Si tienes una idea, un proyecto o una necesidad tecnológica,
            estamos listos para escucharte y ayudarte a encontrar una
            solución.
          </p>

          <Link
            to="/contacto"
            className="mt-8 inline-flex rounded-lg bg-white px-8 py-3.5 font-bold text-blue-600 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
          >
            Solicitar asesoría
          </Link>

        </div>

      </section>
<WhatsAppButton />
    </div>
  );
}

export default QuienesSomos;