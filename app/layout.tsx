// app/layout.tsx
import './globals.css';
import NavBar from '@/components/NavBar';
import { GiEyeOfHorus } from 'react-icons/gi';

export const metadata = {
  title: 'eDuque - Clases de idiomas y ...',
  description:
    'Aprende idiomas (Inglés, Alemán, Quechua) y refuerza tus estudios escolares o preuniversitarios con clases personalizadas en eDuque. Enfoque humano, dinámico y efectivo.',
  icons: {
    icon: '/star3.png', // Usa tu propio favicon personalizado
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />

        {/* SEO extendido: Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:url" content="https://www.tusitio.com" />

        {/* SEO para Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="/og-image.jpg" />

        {/* Favicon */}
        <link rel="icon" href="/book.png" type="image/png" />
        <title>{metadata.title}</title>
      </head>

      <body className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen text-gray-800 font-sans">
        {/* Ícono decorativo de la plataforma */}
        <div className="flex justify-center pt-4 text-4xl text-blue-800">
          <GiEyeOfHorus />
        </div>

        <NavBar />

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
