// app/api/calendar-range/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const servicio = searchParams.get('servicio');
  const horario  = searchParams.get('horario');
  const start    = searchParams.get('start');
  const end      = searchParams.get('end');

  if (!servicio || !horario || !start || !end) {
    return NextResponse.json({ error: 'servicio, horario, start y end son requeridos' }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.LAMBDA_URL}/calendar-range?servicio=${encodeURIComponent(servicio)}` +
    `&horario=${encodeURIComponent(horario)}` +
    `&start=${start}&end=${end}`
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}