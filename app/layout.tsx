import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata = {
  title: 'EduApp - Reservas',
  description: 'Reserva tus clases de idiomas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}