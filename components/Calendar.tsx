// components/RangeCalendar.tsx
'use client';
import { useState, useEffect } from 'react';

export interface DayInfo { date: string; slotsFree: number; available: boolean; }
interface Props {
  servicio: string;
  horario: string;
  start: string;
  end: string;
  selected: string;
  onSelect: (date: string) => void;
  refreshKey: number;
}
const WEEKDAYS = ['L','M','M','J','V','S','D'];

export default function RangeCalendar({ servicio, horario, start, end, selected, onSelect, refreshKey }: Props) {
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/calendar-range?servicio=${encodeURIComponent(servicio)}` +
      `&horario=${encodeURIComponent(horario)}` +
      `&start=${start}&end=${end}`
    )
      .then(r => r.json())
      .then(data => setDays(data.calendar))
      .finally(() => setLoading(false));
  }, [servicio, horario, start, end, refreshKey]);

  if (loading) return <p className="italic text-center">Cargando calendario…</p>;

  return (
    <div className="grid grid-cols-7 gap-3 text-center">
      {days.map(day => {
        const d       = new Date(day.date);
        const wd      = WEEKDAYS[(d.getDay() + 6) % 7];
        const isSel   = selected === day.date;
        const dayNum  = d.getDate();
        let monthAb = d.toLocaleString('es-PE', { month: 'short' }).toLowerCase();
        monthAb = monthAb.replace('.', '');
        return (
          <button
            key={day.date}
            disabled={!day.available}
            onClick={() => onSelect(day.date)}
            className={
              `p-3 rounded-lg flex flex-col items-center transition-colors duration-200 ` +
              `${isSel ? 'ring-4 ring-teal-400' : ''} ` +
              `${day.available ? 'bg-teal-50 hover:bg-teal-100' : 'bg-red-100 line-through cursor-not-allowed'}`
            }
          >
            <span className="font-semibold text-gray-800">{wd}</span>
            <span className="mt-1 text-lg text-gray-900 leading-tight">{dayNum}</span>
            <span className="text-sm text-gray-900">{monthAb}</span>
            <span className="mt-2 text-sm text-gray-700 font-medium">{day.slotsFree} cupos</span>
          </button>
        );
      })}
    </div>
  );
}