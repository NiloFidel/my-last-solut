// components/NavBar.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Nosotros', href: '/' },
  { label: 'Servicios', href: '/services' },
  { label: 'Feedback', href: '/feedback' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-teal-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="font-bold text-xl">EduApp</span>
            </Link>
          </div>
          <div className="hidden md:flex md:space-x-8 items-center">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center md:hidden">
            <button onClick={() => setOpen(!open)}>
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
      </div>
      {open && (
        <div className="md:hidden bg-teal-700">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 hover:bg-teal-500"
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