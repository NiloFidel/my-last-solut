// components/NavBar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
//import clsx from 'clsx';

const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Reservas', href: '/reservas' },
  { label: 'Feedback', href: '/feedback' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-teal-600 text-white h-16 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo / Título */}
        <Link href="/">
          <span className="font-bold text-xl">EduApp</span>
        </Link>

        {/* Menú escritorio */}
        <div className="hidden md:flex md:space-x-8 items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Botón hamburguesa móvil */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menú"
            aria-expanded={open}
            className="focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {open && (
        <div className="md:hidden bg-teal-700">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 hover:bg-teal-500 focus:bg-teal-500 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
