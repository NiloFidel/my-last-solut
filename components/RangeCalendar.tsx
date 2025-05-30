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

export default function RangeCalendar({ servicio, horario, selectedDate, onSelect, refreshKey }: Props) {
  const [days, setDays] = useState<DaySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [todayISO, setTodayISO] = useState<string>('');
  const [endISO, setEndISO] = useState<string>('');
  // Compute interval: last day of current month in Lima to +14 days
  useEffect(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const offsetMin = -5 * 60;
    const now = new Date();
    
    const limaMs = now.getTime() + (now.getTimezoneOffset() + offsetMin) * 60000;
    const limaNow = new Date(limaMs);
    //const year = limaNow.getFullYear();
    //const month = limaNow.getMonth();
    //const lastDay = new Date(year, month + 1, 0);
    //console.log("/",now,"/", limaMs,"/", limaNow,"/", year,"/", month,"/", lastDay)

    const t = `${limaNow.getFullYear()}-${pad(limaNow.getMonth()+1)}-${pad(limaNow.getDate())}`;
    const endDate = new Date(limaNow);
    endDate.setDate(endDate.getDate() + 13);
    const e = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}`;
    setTodayISO(t);
    setEndISO(e);
  }, []);

  // Fetch calendar
  useEffect(() => {
    if (!todayISO || !endISO) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const params = new URLSearchParams({ servicio, horario, start: todayISO, end: endISO });
        const res = await fetch(`/api/calendar-range?${params}`);
        console.log(res)
        if (!res.ok) throw new Error();
        const { calendar } = await res.json();
        setDays((calendar as DaySlot[]).filter(d => d.date >= todayISO));
      } catch {
        setError('Error cargando calendario');
      } finally {
        setLoading(false);
      }
    })();
  }, [servicio, horario, todayISO, endISO, refreshKey]);

  if (!todayISO) return null;
  if (loading) return <p className="text-center">Cargando…</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // Disable start day if slot passed  
  const offsetMin = -5 * 60;
  const limaNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + offsetMin) * 60000);
  const [hStart] = horario.split(' - ');
  const [sh, sm] = hStart.split(':').map(Number);
  console.log("/",offsetMin,"/",limaNow,"/",hStart,"/",sh,"/",sm)

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(d => {
        const isStart = d.date === todayISO;        
        let avail = d.available;
        if (isStart && (limaNow.getHours() > sh || (limaNow.getHours() === sh && limaNow.getMinutes() >= sm))) avail = false;
        const [year, month, day] = d.date.split('-').map(Number);
        const dt = new Date(year, month-1, day);
        
        //console.log(dt, "fff  ", d.date)
        const monthLetter = dt.toLocaleDateString('es-ES', { month: 'short' });
        const dayNum = dt.getDate();
        const weekday = dt.toLocaleDateString('es-ES', { weekday: 'short' });

        const sel = d.date === selectedDate;
        console.log(d.date, "/",dt, "/month", monthLetter, "/day", dayNum, "/", weekday, "/delect date: ", sel )
        return (
          <button
            key={d.date}
            onClick={() => avail && onSelect(d.date)}
            className={clsx(
              'flex flex-col items-center p-2 rounded-lg',
              sel ? 'bg-teal-600 text-white'
                  : avail ? 'bg-teal-100 hover:shadow focus:ring-2 focus:ring-teal-400'
                          : 'bg-red-500 cursor-not-allowed opacity-100'
            )}
          >
            <span className="font-bold text-xs capitalize text-blue-700">{weekday}</span>
            <span className="font-bold text-lg">{dayNum}</span>
            <span className="text-xs capitalize">{monthLetter}</span>
            {/* <span className="mt-1 text-sm">{avail ? `${d.slotsFree} cupos` : '—'}</span> */}
          </button>
        );
      })}
    </div>
  );
}
