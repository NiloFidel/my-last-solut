// app/page.tsx
'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="text-center py-0">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">Bienvenido a eDuque</h1>
      <p className="text-lg text-gray-700 mb-10">
        Una plataforma que se me ocurrio para pasar mis ratos libres en las tardes, enseñar y compartir lo que aprendí, 
        practicar para mejorar los idiomas que voy aprendiendo y sumarte valor en la medida de mis posibilidades; 
        estoy convencido que un enfoque de PERSONA a PERSONA siempre será mejor, más fluido, más humano, 
        más divertido y sincero, así que, si también tienes tiempos libres, te invito a que lo inviertas aprendiendo y 
        creciendo 
        constantemente.
      </p>
      <p className="text-lg text-gray-700 mb-10">
        Reserva tu clase de acompañamiento de la PRE, del COLE u otros temas PARTICULARES, adicionalmente, si deseas, puedes
        reservar tu clase para repasar y practicar Inglés, Alemán o Quechua de manera dinámica y divertida.
      </p>
      <p className="text-lg text-gray-700 mb-10">
        ¡Espero verte pronto para aprender juntos!
      </p>
      <Link href="/reservas">
        <button className="px-8 py-4 bg-blue-400 text-white font-semibold rounded-full shadow-lg hover:bg-blue-500 transition">
          Reservar Ahora
        </button>
      </Link>
    </section>
  );
}
