import React from "react";
import WhatsAppButton from "../components/WhatsAppButton";
function Contacto() {

    // Datos de contacto
    const datosContacto = [
        { icon: "📍", titulo: "Ubicación", contenido: "Medellín, Antioquia, Colombia", detalle: "Atendemos proyectos presenciales y remotos." },
        { icon: "📞", titulo: "Teléfono", contenido: "+57 300 000 0000", detalle: "Lunes a viernes, 8:00 a.m. - 6:00 p.m." },
        { icon: "✉️", titulo: "Correo electrónico", contenido: "contacto@jhmtechsolutions.com", detalle: "Respondemos tus solicitudes lo antes posible." },
        { icon: "🕐", titulo: "Horario de atención", contenido: "Lunes - Viernes", detalle: "8:00 a.m. - 6:00 p.m." },
    ];

    // Servicios
    const servicios = [
        "Asesoría tecnológica",
        "Desarrollo de aplicaciones web",
        "Consultoría TI",
        "Transformación digital",
        "Diseño y arquitectura de software",
        "Automatización de procesos",
    ];

    return (
        <div className="min-h-screen bg-white text-gray-800">

            {/* Hero */}
            <section className="relative overflow-hidden bg-gray-950">
                <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-24">
                    <div className="max-w-3xl">
                        <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">JHM Tech Solutions</span>

                        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Conectemos para
                            <span className="block text-blue-500">transformar tus ideas</span>
                            en soluciones.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                            Cuéntanos sobre tu proyecto, necesidad o desafío tecnológico. Nuestro equipo está preparado para orientarte y encontrar una solución adecuada para tu organización.
                        </p>
                    </div>
                </div>
            </section>

            {/* Información de contacto */}
            <section className="bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Información de contacto</span>
                        <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">Estamos aquí para ayudarte</h2>
                        <p className="mt-4 leading-7 text-gray-600">Puedes comunicarte con nosotros a través de cualquiera de nuestros canales de atención.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {datosContacto.map((dato) => (
                            <article key={dato.titulo} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl transition duration-300 group-hover:bg-blue-600">{dato.icon}</div>
                                <h3 className="mt-5 font-bold text-gray-900">{dato.titulo}</h3>
                                <p className="mt-2 font-semibold text-blue-600">{dato.contenido}</p>
                                <p className="mt-2 text-sm leading-6 text-gray-500">{dato.detalle}</p>
                            </article>
                        ))}
                    </div>

                </div>
            </section>

            {/* Contacto y formulario */}
            <section className="bg-white px-6 py-20">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">

                    {/* Información */}
                    <div>
                        <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Hablemos de tecnología</span>

                        <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">Cuéntanos qué necesitas</h2>

                        <p className="mt-5 leading-8 text-gray-600">
                            Si tienes una idea, proyecto o necesitas orientación para seleccionar una solución tecnológica, escríbenos. Analizaremos tu necesidad y te ayudaremos a definir el camino más adecuado.
                        </p>

                        {/* Servicios */}
                        <div className="mt-8 space-y-4">
                            {servicios.map((servicio) => (
                                <div key={servicio} className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">✓</span>
                                    <span className="text-gray-700">{servicio}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-xl sm:p-8">
                        <div className="mb-7">
                            <h3 className="text-2xl font-bold text-gray-900">Solicita una asesoría</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-500">Completa el formulario y nos pondremos en contacto contigo.</p>
                        </div>

                        <form className="space-y-5">

                            {/* Nombre */}
                            <div>
                                <label htmlFor="nombre" className="mb-2 block text-sm font-semibold text-gray-700">Nombre completo</label>
                                <input id="nombre" name="nombre" type="text" placeholder="Ingresa tu nombre" required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">Correo electrónico</label>
                                <input id="email" name="email" type="email" placeholder="correo@empresa.com" required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label htmlFor="telefono" className="mb-2 block text-sm font-semibold text-gray-700">Teléfono</label>
                                <input id="telefono" name="telefono" type="tel" placeholder="+57 300 000 0000" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            {/* Servicio */}
                            <div>
                                <label htmlFor="servicio" className="mb-2 block text-sm font-semibold text-gray-700">¿En qué podemos ayudarte?</label>
                                <select id="servicio" name="servicio" required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                                    <option value="">Selecciona un servicio</option>
                                    <option value="desarrollo">Desarrollo de software</option>
                                    <option value="web">Diseño web</option>
                                    <option value="consultoria">Consultoría TI</option>
                                    <option value="asesoria">Asesoría tecnológica</option>
                                    <option value="ia">Inteligencia Artificial</option>
                                    <option value="ciberseguridad">Ciberseguridad</option>
                                    <option value="industria40">Industria 4.0</option>
                                    <option value="transformacion">Transformación digital</option>
                                    <option value="otros">Otro</option>
                                </select>
                            </div>

                            {/* Mensaje */}
                            <div>
                                <label htmlFor="mensaje" className="mb-2 block text-sm font-semibold text-gray-700">Cuéntanos sobre tu proyecto</label>
                                <textarea id="mensaje" name="mensaje" rows="5" placeholder="Describe brevemente tu necesidad..." className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            {/* Botón */}
                            <button type="submit" className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl">
                                Enviar solicitud →
                            </button>

                        </form>
                    </div>

                </div>
            </section>

            {/* Ubicación y mapa */}
            <section className="bg-gray-950 px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-2">

                        {/* Información */}
                        <div>
                            <span className="text-sm font-bold uppercase tracking-widest text-blue-400">Nuestra ubicación</span>
                            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Estamos en Medellín</h2>

                            <p className="mt-5 leading-8 text-gray-400">
                                JHM Tech Solutions tiene como punto de referencia la ciudad de Medellín, Antioquia, Colombia, y ofrece acompañamiento tecnológico tanto presencial como remoto.
                            </p>

                            <div className="mt-8 space-y-5">

                                <div className="flex gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">📍</div>
                                    <div>
                                        <h3 className="font-bold text-white">Dirección</h3>
                                        <p className="mt-1 text-gray-400">Medellín, Antioquia, Colombia</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">📞</div>
                                    <div>
                                        <h3 className="font-bold text-white">Teléfono</h3>
                                        <a href="tel:+573000000000" className="mt-1 block text-gray-400 transition hover:text-blue-400">+57 300 000 0000</a>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl">✉️</div>
                                    <div>
                                        <h3 className="font-bold text-white">Correo</h3>
                                        <a href="mailto:contacto@jhmtechsolutions.com" className="mt-1 block text-gray-400 transition hover:text-blue-400">contacto@jhmtechsolutions.com</a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Google Maps */}
                        <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl">
                            <iframe title="Ubicación JHM Tech Solutions" src="https://www.google.com/maps?q=Medellín,Antioquia,Colombia&output=embed" className="h-[420px] w-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA final */}
            <section className="relative overflow-hidden bg-blue-600 px-6 py-16">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="relative mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">¿Listo para llevar tu proyecto al siguiente nivel?</h2>

                    <p className="mx-auto mt-4 max-w-2xl text-blue-100">
                        Conversemos sobre tus necesidades y encontremos juntos una solución tecnológica.
                    </p>

                    <a href="mailto:contacto@jhmtechsolutions.com" className="mt-7 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 font-bold text-blue-600 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-gray-100">
                        ✉️ Contactar por correo
                    </a>
                </div>
            </section>

<WhatsAppButton />
        </div>
    );
}

export default Contacto;