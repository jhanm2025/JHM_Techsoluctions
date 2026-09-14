import { useState, useEffect } from "react";
import '../App.css'; // Archivo CSS para los estilos

import img1 from "../assets/images/Ciberseguridad.png";
import img2 from "../assets/images/automatizacion.png";
import img3 from "../assets/images/industria.png";
import img4 from "../assets/images/iot.png";
import img5 from "../assets/images/analitica.png";
import img6 from "../assets/images/arquitectura.png";
import img7 from "../assets/images/soporte.png";
import img8 from "../assets/images/base_datos.png";
import img9 from "../assets/images/asesoria.png";
import img10 from "../assets/images/desarrollo_software.png";

const carrusel = [
  {
    imagen: img1,
  /*   titulo: "Ciberseguridad", */
    descripcion:
      "Implementamos soluciones de ciberseguridad para proteger los sistemas y datos de las empresas frente a amenazas y ataques cibernéticos."
  },
  {
    imagen: img2,
 /*    titulo: "Automatización e Inteligencia Artificial", */
    descripcion:
      "Implementamos soluciones de automatización e inteligencia artificial para optimizar procesos y mejorar la eficiencia de las empresas."
  },
  {
    imagen: img3,
  /*   titulo: "Industrias 4.0", */
    descripcion:
      "Implementamos soluciones tecnológicas para optimizar la producción y eficiencia de las industrias."
  },
  {
    imagen: img4,
 /*    titulo: "IoT - Internet de las Cosas", */
    descripcion:
      "Nuestro equipo de ingenieros desarrolla soluciones de IoT para mejorar la eficiencia y productividad de las empresas."
  },
  {
    imagen: img5,
/*     titulo: "Analitoca de Datos", */
    descripcion:
      "Analizamos y optimizamos los datos de tu empresa"
  },
  {
    imagen: img6,
   /*  titulo: "Arquitectura de Software", */
    descripcion:
      "Trabajamos para implementar la mejr opción acquitectonoca en tu proyecto de Software"
  },
  {
    imagen: img7,
   /*  titulo: "Soporte y Mantenimiento", */
    descripcion:
      "Tenemos el mejpr personal para brindarte soporte y mantenimiento en equipos de computo."
  },
  {
    imagen: img8,
 /*    titulo: "Base de Datos", */
    descripcion:
      "Soluciones para gestionar y optimizar bases de datos."
  },
  {
    imagen: img9,
  /*   titulo: "Asesoría", */
    descripcion:
      "Servicios de asesoría tecnológica para impulsar la transformación digital."
  },
  {
    imagen: img10,
  /*   titulo: "Desarrollo de Software",  */
    descripcion:
      "Desarrollamos soluciones de software a medida para satisfacer las necesidades específicas de cada cliente."
  }
];
function Carousel() {
  const [indice, setIndice] = useState(0);
  const siguiente = () => {
    setIndice((prevIndice) => (prevIndice + 1) % carrusel.length);
  };
  const anterior = () => {
    setIndice((prevIndice) => (prevIndice - 1 + carrusel.length) % carrusel.length);
  };
  // Temporizador de 4 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((prevIndice) => (prevIndice + 1) % carrusel.length);
    }, 4000);
    return () => clearInterval(intervalo);
  }, []);
  return (
    <div className="relative w-full max-w-3xl h-80 sm:h-96 md:h-[420px] mx-auto overflow-hidden rounded-2xl shadow-xl group">
      {/* IMAGEN: object-cover asegura que todas midan lo mismo */}
      <img
        src={carrusel[indice].imagen}
        alt={carrusel[indice].titulo}
        className="w-full h-full object-cover transition-all duration-500 ease-in-out" />
      {/* OVERLAY: Degradado oscuro en la parte inferior para leer el texto */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 text-white max-h-[50%] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white drop-shadow">
          {carrusel[indice].titulo}
        </h2>
        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
          {carrusel[indice].descripcion}
        </p>
      </div>
      {/* BOTÓN ANTERIOR */}
      <button
        onClick={anterior}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-3 rounded-full transition-all duration-300 opacity-80 group-hover:opacity-100 focus:outline-none"
        aria-label="Anterior" >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {/* BOTÓN SIGUIENTE */}
      <button
        onClick={siguiente}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/75 text-white p-3 rounded-full transition-all duration-300 opacity-80 group-hover:opacity-100 focus:outline-none"
        aria-label="Siguiente" >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
export default Carousel;