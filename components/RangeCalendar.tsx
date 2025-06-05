// components/RangeCalendar.tsx
'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export interface DaySlot {
  date: string;       // fecha ISO (YYYY-MM-DD)
  slotsUsed: number;
  slotsFree: number;
  available: boolean;
}

interface Props {
  servicio: string;        // '1' | '2' | … | '7'
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
        const params = new URLSearchParams({
          servicio,       // p.ej. '1'
          horario,        // p.ej. '14:00 - 15:00'
          start: todayISO,
          end: endISO,
        });
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

  // 3) Si la fecha seleccionada ya no está disponible, saltar a la siguiente disponible
  useEffect(() => {
    if (loading || error) return;
    if (!days.length) return;

    const offsetMin = -5 * 60;
    const limaNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + offsetMin) * 60000);
    const [hStart] = horario.split(' - ');
    const [sh, sm] = hStart.split(':').map(Number);

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
  if (loading) return <p className="text-center text-gray-600">Cargando…</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // 4) Renderizado del calendario: marcamos cada día según disponibilidad y mostramos "Jue 5 Jun 2 cupos"
  const offsetMin = -5 * 60;
  const limaNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + offsetMin) * 60000);
  const [hStart] = horario.split(' - ');
  const [sh, sm] = hStart.split(':').map(Number);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-0.5 w-full p-0.5">
        {days.map((d) => {
          const isToday = d.date === todayISO;
          let avail = d.available;
          if (
            isToday &&
            (limaNow.getHours() > sh || (limaNow.getHours() === sh && limaNow.getMinutes() >= sm))
          ) {
            avail = false;
          }

          // Parsear fecha sin generar NaN
          const [yearStr, monthStr, dayStr] = d.date.split('-');
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10);
          const day = parseInt(dayStr, 10);
          const dt = new Date(
            isNaN(year) ? 0 : year,
            isNaN(month) ? 0 : month - 1,
            isNaN(day) ? 1 : day
          );
          const monthLetter = dt.toLocaleDateString('es-ES', { month: 'short' }) || '';
          const dayNum = !isNaN(dt.getDate()) ? dt.getDate() : 0;
          const weekday = dt.toLocaleDateString('es-ES', { weekday: 'short' }) || '';

          const isSelected = d.date === selectedDate;

          return (
            <button
              key={d.date}  // único: YYYY-MM-DD
              onClick={() => avail && onSelect(d.date)}
              className={clsx(
                'flex flex-col items-center justify-center p-3 w-full rounded-xl border border-white/40 backdrop-blur-md bg-white/30 shadow-sm',
                isSelected
                  ? 'ring-2 ring-blue-300 bg-blue-100'
                  : avail
                  ? 'hover:bg-white/50'
                  : 'opacity-100 cursor-not-allowed bg-red-200'
              )}
              aria-disabled={!avail}
              aria-pressed={isSelected}
            >
              <span className="font-semibold text-sm text-blue-800 capitalize">{weekday}</span>
              <span className="font-bold text-2xl text-gray-800">{dayNum || ''}</span>
              <span className="text-sm text-gray-600 capitalize">{monthLetter}</span>
              {/* <span className="mt-1 text-sm text-gray-700">
                {avail ? `${d.slotsFree} cupos` : '—'}
              </span> */}
            </button>
          );
        })}
      </div>
    </div>
  );
}
