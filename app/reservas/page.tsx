// components/ReservationForm.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

const RangeCalendar = dynamic(() => import('@/components/RangeCalendar'), { ssr: false });

// Definimos cada servicio con id y label
const LANGUAGES = [
  { id: '1', label: 'Matemáticas y Todo Números' },
  { id: '2', label: 'Lenguaje y Todo Letras' },
  { id: '3', label: 'Historia, Geografía y Sociales' },
  { id: '4', label: 'Practiquemos Alemán' },
  { id: '5', label: 'Practiquemos Inglés' },
  { id: '6', label: 'Practiquemos Quechua' },
  { id: '7', label: 'Hablemos de Business' },
];

const TIME_SLOTS = [
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
];

interface UserInfo {
  fullName: string;
  age: string;      // label="Edad"
  email: string;    // label="Correo"
  city: string;     // label="Ciudad"
}

export default function ReservationForm() {
  const [startISO, setStartISO] = useState<string>('');
  const [defaultSlot, setDefaultSlot] = useState<string>(TIME_SLOTS[0]);
  const [languageId, setLanguageId] = useState<string>(LANGUAGES[0].id);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [user, setUser] = useState<UserInfo>({ fullName: '', age: '', email: '', city: '' });
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [bookedName, setBookedName] = useState<string>('');

  // 1) Calcular startISO (hoy) y slot por defecto basándose en hora Lima
  useEffect(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const offsetMin = -5 * 60;
    const now = new Date();
    const limaMs = now.getTime() + (now.getTimezoneOffset() + offsetMin) * 60000;
    const limaNow = new Date(limaMs);

    const iso = `${limaNow.getFullYear()}-${pad(limaNow.getMonth() + 1)}-${pad(limaNow.getDate())}`;
    setStartISO(iso);
    setSelectedDate(iso);

    // Determinar primer slot disponible hoy
    const slot = TIME_SLOTS.find((s) => {
      const [h, m] = s.split(' - ')[0].split(':').map(Number);
      return (
        limaNow.getHours() < h || (limaNow.getHours() === h && limaNow.getMinutes() < m)
      );
    }) || TIME_SLOTS[TIME_SLOTS.length - 1];

    setDefaultSlot(slot);
    setSelectedSlot(slot);
  }, []);

  // 2) Cuando cambian startISO o defaultSlot → reset de fecha y slot
  useEffect(() => {
    setSelectedDate(startISO);
    setSelectedSlot(defaultSlot);
  }, [startISO, defaultSlot]);

  // Validaciones simples
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validateAge = (age: string) => /^\d+$/.test(age) && Number(age) > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // Validación básica de campos
    if (!languageId || !selectedDate || !selectedSlot) {
      return setStatus({ type: 'error', message: 'Completa fecha, servicio y horario.' });
    }
    const missing = (Object.entries(user) as [keyof UserInfo, string][]).filter(
      ([, v]) => !v
    );
    if (missing.length) {
      return setStatus({ type: 'error', message: 'Completa todos tus datos.' });
    }
    if (!validateEmail(user.email)) {
      return setStatus({ type: 'error', message: 'Correo no válido.' });
    }
    if (!validateAge(user.age)) {
      return setStatus({ type: 'error', message: 'Edad no válida.' });
    }

    try {
      // Guardamos el nombre antes de limpiar el estado de usuario
      setBookedName(user.fullName);

      const payload = {
        clientToken: user.email,
        servicio: languageId,          // aquí enviamos el ID numérico
        horario: selectedSlot,
        date: selectedDate,
        usuario: user,
      };

      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error inesperado al reservar.');
      }

      // Si la reserva fue exitosa:
      setShowModal(true);

      // Incrementar refreshKey para forzar refetch en RangeCalendar
      setRefreshKey((k) => k + 1);

      // Limpiar formulario de usuario (pero no cambiamos servicio ni fecha)
      setUser({ fullName: '', age: '', email: '', city: '' });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setStatus({ type: 'error', message: error.message });
    }
  };

  // Cerrar modal y restablecer status cuando el usuario lo cierre
  const handleCloseModal = () => {
    setShowModal(false);
    setStatus(null);
  };

  return (
    <>
      <div className="lg:flex lg:space-x-8 space-y-8 lg:space-y-0 my-8">
        {/* Lado izquierdo: selección de servicio/horario/fecha */}
        <section className="flex-1 px-4 py-1 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg space-y-6">
          <h2 className="text-3xl font-extrabold text-blue-700">Reservar Clase</h2>
          <div>
            <label htmlFor="servicio" className="font-bold text-blue-800 block mb-2">
              Servicio:
            </label>
            <select
              id="servicio"
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-blue-800 block mb-2">Horario:</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot, idx) => {
                const [h, m] = slot.split(' - ')[0].split(':').map(Number);
                const offsetMin = -5 * 60;
                const limaNow = new Date(
                  new Date().getTime() +
                    (new Date().getTimezoneOffset() + offsetMin) * 60000
                );
                const disabled =
                  selectedDate === startISO &&
                  (limaNow.getHours() > h ||
                    (limaNow.getHours() === h && limaNow.getMinutes() >= m));

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSlot(slot)}
                    className={clsx(
                      'px-2 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400',
                      disabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : selectedSlot === slot
                        ? 'bg-blue-400 text-white'
                        : 'bg-white/50 backdrop-blur-sm text-gray-800 hover:bg-white/70'
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-bold text-blue-800 block mb-2">Selecciona Fecha:</label>
            <RangeCalendar
              servicio={languageId}
              horario={selectedSlot}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              refreshKey={refreshKey}
            />
          </div>
        </section>

        {/* Lado derecho: formulario de datos del usuario */}
        <section className="lg:w-1/2 px-4 py-1 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-4">Tus Datos Personales</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block mb-1 text-gray-800">Nombre completo</label>
              <input
                id="fullName"
                type="text"
                value={user.fullName}
                onChange={(e) =>
                  setUser((u) => ({ ...u, fullName: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <label htmlFor="age" className="block mb-1 text-gray-800">Edad</label>
              <input
                id="age"
                type="text"
                value={user.age}
                onChange={(e) =>
                  setUser((u) => ({ ...u, age: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 text-gray-800">Correo</label>
              <input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) =>
                  setUser((u) => ({ ...u, email: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <label htmlFor="city" className="block mb-1 text-gray-800">Ciudad</label>
              <input
                id="city"
                type="text"
                value={user.city}
                onChange={(e) =>
                  setUser((u) => ({ ...u, city: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-400 text-white font-semibold rounded-full shadow-md hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Reservar
            </button>

            {status && (
              <p
                className={clsx(
                  'mt-4 p-3 rounded-lg',
                  status.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                )}
              >
                {status.message}
              </p>
            )}
          </form>
        </section>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 max-w-sm text-center border border-white/30 shadow-lg">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">¡Reserva Confirmada!</h3>
            <p className="mb-6 text-gray-800">
              Gracias <span className="font-semibold">{bookedName}</span>, tu reserva ha sido confirmada. En tu correo encontrarás el link
              de la reunión. ¡Nos vemos pronto!
            </p>
            <button
              onClick={handleCloseModal}
              className="px-6 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
