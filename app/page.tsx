// app/page.tsx
'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a EduApp</h1>
      <p className="text-lg mb-8">
        Reserva tu clase de idiomas y practica Inglés, Alemán o Quechua con nuestros expertos.
        ¡Aprende de forma fácil y divertida!
      </p>
      <Link href="/reservas">
        <button className="bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700 transition">
          Reservar Ahora
        </button>
      </Link>
    </section>
  );
}
