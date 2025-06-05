// app/layout.tsx
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata = {
  title: 'eLearning - eDuque',
  description: 'Reserva tus clases de aprendizaje continuo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 pt-16">
        {/* pt-16 deja espacio para el NavBar fijo (h-16) */}
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
