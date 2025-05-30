// app/api/calendar-range/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const servicio = searchParams.get('servicio');
  const horario  = searchParams.get('horario');
  const start    = searchParams.get('start');
  const end      = searchParams.get('end');

  if (!servicio || !horario || !start || !end) {
    return NextResponse.json(
      { error: 'servicio, horario, start y end son requeridos' },
      { status: 400 }
    );
  }

  let data;
  let status = 200;

  try {
    // Creamos un AbortController para el timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s

    const res = await fetch(
      `${process.env.LAMBDA_URL}/calendar-range` +
      `?servicio=${encodeURIComponent(servicio)}` +
      `&horario=${encodeURIComponent(horario)}` +
      `&start=${start}&end=${end}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    status = res.status;
    data = await res.json();
  } catch (err: unknown) {
    console.error('Error fetching Lambda calendar-range:', err);
    // Fallback: array vacío para no romper el frontend
    data = { calendar: [] };
    status = 200;
  }

  return NextResponse.json(data, { status });
}
