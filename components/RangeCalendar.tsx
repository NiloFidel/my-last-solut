// components/RangeCalendar.tsx
'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export interface DaySlot {
  date: string;
  slotsUsed: number;
  slotsFree: number;
  available: boolean;
}

interface Props {
  servicio: string;
  horario: string;
  selectedDate: string;
  onSelect(date: string): void;
  refreshKey: number;
}

export default function RangeCalendar({
  servicio,
  horario,
  selectedDate,
  onSelect,
  refreshKey,
}: Props) {
  const [days, setDays] = useState<DaySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [todayISO, setTodayISO] = useState<string>('');
  const [endISO, setEndISO] = useState<string>('');

  // 1) Calcular todayISO y endISO (+13 días) en zona Lima
  useEffect(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const offsetMin = -5 * 60;
    const now = new Date();
    const limaMs = now.getTime() + (now.getTimezoneOffset() + offsetMin) * 60000;
    const limaNow = new Date(limaMs);

    const t = `${limaNow.getFullYear()}-${pad(limaNow.getMonth() + 1)}-${pad(limaNow.getDate())}`;
    const endDate = new Date(limaNow);
    endDate.setDate(endDate.getDate() + 13);
    const e = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;

    setTodayISO(t);
    setEndISO(e);
  }, []);

  // 2) Fetch del calendario cada vez que cambien servicio, horario, todayISO, endISO o refreshKey
  useEffect(() => {
    if (!todayISO || !endISO) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const params = new URLSearchParams({ servicio, horario, start: todayISO, end: endISO });
        const res = await fetch(`/api/calendar-range?${params}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        if (!Array.isArray(json.calendar)) {
          throw new Error('Respuesta inválida del servidor');
        }
        // Filtrar fechas >= todayISO
        const filtered = (json.calendar as DaySlot[]).filter((d) => d.date >= todayISO);
        setDays(filtered);
      } catch (e) {
        console.error('Error cargando calendario:', e);
        setError('Error cargando calendario');
        setDays([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [servicio, horario, todayISO, endISO, refreshKey]);

  // 3) Si la fecha actualmente seleccionada ya no está disponible, saltar a la siguiente disponible
  useEffect(() => {
    if (loading || error) return;
    if (!days.length) return;

    const offsetMin = -5 * 60;
    const limaNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + offsetMin) * 60000);
    const [hStart] = horario.split(' - ');
    const [sh, sm] = hStart.split(':').map(Number);

    // Verificar si selectedDate sigue disponible
    let currentIsAvailable = false;
    for (const d of days) {
      let avail = d.available;
      if (
        d.date === todayISO &&
        (limaNow.getHours() > sh || (limaNow.getHours() === sh && limaNow.getMinutes() >= sm))
      ) {
        avail = false;
      }
      if (d.date === selectedDate) {
        currentIsAvailable = avail;
        break;
      }
    }

    if (!currentIsAvailable) {
      // Buscar primer día disponible
      const next = days.find((d) => {
        let avail = d.available;
        if (
          d.date === todayISO &&
          (limaNow.getHours() > sh || (limaNow.getHours() === sh && limaNow.getMinutes() >= sm))
        ) {
          avail = false;
        }
        return avail;
      });
      if (next) {
        onSelect(next.date);
      }
    }
  }, [days, selectedDate, horario, todayISO, loading, error, onSelect]);

  if (!todayISO) return null;
  if (loading) return <p className="text-center">Cargando…</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // 4) Renderizado del calendario: marcar cada día según disponibilidad
  const offsetMin = -5 * 60;
  const limaNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + offsetMin) * 60000);
  const [hStart] = horario.split(' - ');
  const [sh, sm] = hStart.split(':').map(Number);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const isToday = d.date === todayISO;
        let avail = d.available;
        if (isToday && (limaNow.getHours() > sh || (limaNow.getHours() === sh && limaNow.getMinutes() >= sm))) {
          avail = false;
        }

        const [year, month, day] = d.date.split('-').map(Number);
        const dt = new Date(year, month - 1, day);
        const monthLetter = dt.toLocaleDateString('es-ES', { month: 'short' });
        const dayNum = dt.getDate();
        const weekday = dt.toLocaleDateString('es-ES', { weekday: 'short' });

        const isSelected = d.date === selectedDate;

        return (
          <button
            key={d.date}
            onClick={() => avail && onSelect(d.date)}
            className={clsx(
              'flex flex-col items-center p-2 rounded-lg border',
              isSelected
                ? 'bg-teal-600 text-white border-teal-700'
                : avail
                ? 'bg-teal-100 hover:shadow focus:ring-2 focus:ring-teal-400 border-teal-200'
                : 'bg-red-500 opacity-75 cursor-not-allowed border-red-600'
            )}
            aria-disabled={!avail}
            aria-pressed={isSelected}
          >
            <span className="font-bold text-xs capitalize text-blue-700">{weekday}</span>
            <span className="font-bold text-lg">{dayNum}</span>
            <span className="text-xs capitalize">{monthLetter}</span>
          </button>
        );
      })}
    </div>
  );
}
