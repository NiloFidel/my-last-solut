// components/ReservationForm.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

// Dynamic import to disable SSR
const RangeCalendar = dynamic(() => import('@/components/RangeCalendar'), { ssr: false });

const LANGUAGES = [
  "Matemáticas y Todo Números",
  "Lenguaje y Todo Letras",
  "Historia, Geografía y Sociales",
  'Practiquemos Alemán',
  'Practiquemos Inglés',
  'Practiquemos Quechua',
  "Hablemos de Business"
];
const TIME_SLOTS = [
  "14:00 - 15:00", '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00'
];

interface UserInfo {
  fullName: string;
  age: string;
  email: string;
  city: string;
}

export default function ReservationForm() {
  const [startISO, setStartISO] = useState<string>('');
  const [defaultSlot, setDefaultSlot] = useState<string>(TIME_SLOTS[0]);
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [user, setUser] = useState<UserInfo>({ fullName: '', age: '', email: '', city: '' });
  const [refreshKey] = useState<number>(0);
  const [status, setStatus] = useState<{ type: 'error'; message: string } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Compute startISO (today in Lima) and default slot
  useEffect(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const offsetMin = -5 * 60;
    const now = new Date();
    const limaMs = now.getTime() + (now.getTimezoneOffset() + offsetMin) * 60000;
    const limaNow = new Date(limaMs);
    const iso = `${limaNow.getFullYear()}-${pad(limaNow.getMonth() + 1)}-${pad(limaNow.getDate())}`;
    setStartISO(iso);
    setSelectedDate(iso);
    // default slot
    const slot = TIME_SLOTS.find(s => {
      const [h, m] = s.split(' - ')[0].split(':').map(Number);
      return limaNow.getHours() < h || (limaNow.getHours() === h && limaNow.getMinutes() < m);
    }) || TIME_SLOTS[TIME_SLOTS.length - 1];
    setDefaultSlot(slot);
    setSelectedSlot(slot);
  }, []);

  // Reset on refresh
  useEffect(() => {
    setSelectedDate(startISO);
    setSelectedSlot(defaultSlot);
  }, [startISO, defaultSlot, refreshKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!language || !selectedDate || !selectedSlot) {
      return setStatus({ type: 'error', message: 'Completa fecha, servicio y horario.' });
    }
    const missing = (Object.entries(user) as [keyof UserInfo, string][]).filter(([, v]) => !v);
    if (missing.length) {
      return setStatus({ type: 'error', message: 'Completa todos tus datos.' });
    }
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientToken: user.email, servicio: language, horario: selectedSlot, date: selectedDate, usuario: user })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error inesperado');
      // Show confirmation modal
      setShowModal(true);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <>
      {/* Form and Calendar Layout */}
      <div className="lg:flex lg:space-x-8 space-y-8 lg:space-y-0">
        <section className="flex-1 bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-2xl font-bold">Reservar Clase</h2>
          <div>
            <label className="font-bold block mb-2">Servicio:</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border rounded p-2">
              {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
            </select>
          </div>

          <div>
            <label className="font-bold block mb-2">Horario:</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map(slot => {
                const [h, m] = slot.split(' - ')[0].split(':').map(Number);
                const offsetMin = -5 * 60;
                const limaNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + offsetMin) * 60000);
                const disabled = selectedDate === startISO && (limaNow.getHours() > h || (limaNow.getHours() === h && limaNow.getMinutes() >= m));
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSlot(slot)}
                    className={clsx(
                      'px-4 py-2 rounded',
                      disabled ? 'bg-gray-200 cursor-not-allowed' : selectedSlot === slot ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    )}
                  >{slot}</button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-bold block mb-2">Selecciona Fecha:</label>
            <RangeCalendar
              servicio={language}
              horario={selectedSlot}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              refreshKey={refreshKey}
            />
          </div>
        </section>

        <form onSubmit={handleSubmit} className="lg:w-1/2 bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-bold">Tus Datos</h2>
          {(['fullName', 'age', 'email', 'city'] as const).map(field => (
            <div key={field}>
              <label className="block mb-1 capitalize">{field === 'fullName' ? 'Nombre completo' : field}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={user[field]}
                onChange={e => setUser(u => ({ ...u, [field]: e.target.value }))}
                className="w-full border rounded p-2"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded">Reservar</button>
          {status && <p className={clsx('mt-4 p-2 rounded', status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>{status.message}</p>}
        </form>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4">¡Reserva Confirmada!</h3>
            <p className="mb-6">Gracias {user.fullName}, tu reserva ha sido confirmada! En tu correo encontrarás el link de la reunión. ¡Nos vemos pronto!!!</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
            >Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
