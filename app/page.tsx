// components/Reservation.tsx
'use client';
import { useState, FormEvent } from 'react';
import RangeCalendar from '../components/Calendar';

const HORARIOS = ['09:00 - 10:00','11:00 - 12:00','13:00 - 14:00','15:00 - 16:00','17:00 - 18:00','19:00 - 20:00'];
const LANGUAGES = ['Alemán','Ingles','Quechua'];

interface Usuario { fullName: string; email: string; nationality: string; city: string; age: string; occupation: string; }
interface ReservationResult { message: string; meetLink: string; date: string; }

export default function Reservation() {
  const [servicio, setServicio]         = useState(LANGUAGES[1]);
  const [horario, setHorario]           = useState(HORARIOS[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [usuario, setUsuario]           = useState<Usuario>({ fullName:'', email:'', nationality:'', city:'', age:'', occupation:'' });
  const [result, setResult]             = useState<ReservationResult | null>(null);
  const [refreshKey, setRefreshKey]     = useState(0);
  const [showModal, setShowModal]       = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDate) { alert('Selecciona una fecha primero'); return; }
    const missing = Object.entries(usuario).filter(entry => !entry[1]);
    if (missing.length) { alert('Rellena todos los datos de usuario'); return; }
    const body = { servicio, horario, date: selectedDate, usuario };
    const res  = await fetch('/api/reserve', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const data = await res.json();
    setResult({ message: data.message, meetLink: data.meetLink, date: selectedDate });
    setShowModal(true);
    setRefreshKey(k => k + 1);
    setUsuario({ fullName:'', email:'', nationality:'', city:'', age:'', occupation:'' });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate('');
    setResult(null);
  };

  const today  = new Date();
  const startd = new Date(today); startd.setDate(today.getDate()+2);
  const endd   = new Date(today); endd.setDate(today.getDate()+15);
  const start  = startd.toISOString().slice(0,10);
  const end    = endd.toISOString().slice(0,10);

  return (
    <>
      {showModal && result && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-2xl font-bold mb-2 text-teal-600">¡Reserva Confirmada!</h3>
            <p className="mb-1 text-gray-800">{servicio} • {new Date(result.date).toLocaleDateString('es-PE',{ day:'2-digit',month:'short'}).replace('.', '')} • {horario}</p>
            <p className="mb-4 text-gray-700">Enlace de reunión:</p>
            <a href={result.meetLink} target="_blank" className="text-teal-500 underline font-medium">{result.meetLink}</a>
            <button onClick={closeModal} className="mt-6 w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600">Cerrar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-3xl font-extrabold mb-4 text-teal-600">Reservar Sesión</h2>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Idioma</label>
            <select value={servicio} onChange={e => setServicio(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300">
              {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <p className="font-semibold mb-1 text-gray-700">Horario</p>
            <div className="flex flex-wrap gap-2">
              {HORARIOS.map(h => (
                <button key={h} type="button" onClick={()=>setHorario(h)} className={`px-4 py-2 rounded-lg transition ${horario===h?'bg-teal-600 text-white':'bg-gray-200 hover:bg-gray-300'}`}>{h}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1 text-gray-700">Selecciona Fecha</p>
            <RangeCalendar servicio={servicio} horario={horario} start={start} end={end} selected={selectedDate} onSelect={setSelectedDate} refreshKey={refreshKey} />
          </div>
        </div>
        <div className="md:w-1/2 w-full bg-white p-6 shadow-lg rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-teal-600">Tus Datos</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block mb-1 text-gray-700">Nombre completo</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300" value={usuario.fullName} onChange={e=>setUsuario({...usuario,fullName:e.target.value})} disabled={!selectedDate} /></div>
            <div><label className="block mb-1 text-gray-700">Email</label><input type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300" value={usuario.email} onChange={e=>setUsuario({...usuario,email:e.target.value})} disabled={!selectedDate} /></div>
            <div><label className="block mb-1 text-gray-700">Nacionalidad</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300" value={usuario.nationality} onChange={e=>setUsuario({...usuario,nationality:e.target.value})} disabled={!selectedDate} /></div>
            <div><label className="block mb-1 text-gray-700">Ciudad</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300" value={usuario.city} onChange={e=>setUsuario({...usuario,city:e.target.value})} disabled={!selectedDate} /></div>
            <div><label className="block mb-1 text-gray-700">Edad</label><input type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300" value={usuario.age} onChange={e=>setUsuario({...usuario,age:e.target.value})} disabled={!selectedDate} /></div>
            <div><label className="block mb-1 text-gray-700">Ocupación</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-300" value={usuario.occupation} onChange={e=>setUsuario({...usuario,occupation:e.target.value})} disabled={!selectedDate} /></div>
            <button type="submit" className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 disabled:opacity-50" disabled={!selectedDate}>Reservar</button>
          </form>
        </div>
      </div>
    </>
  );
}