// app/api/calendar-range/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const servicio = searchParams.get('servicio');
  const horario = searchParams.get('horario');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!servicio || !horario || !start || !end) {
    return NextResponse.json(
      { error: 'servicio, horario, start y end son requeridos' },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `${process.env.LAMBDA_URL}/calendar-range` +
        `?servicio=${encodeURIComponent(servicio)}` +
        `&horario=${encodeURIComponent(horario)}` +
        `&start=${start}&end=${end}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!data || !Array.isArray(data.calendar)) {
      throw new Error('Respuesta inesperada del backend');
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error('Error fetching Lambda calendar-range:', err);
    // Si falla, devolvemos calendar vacío para no romper la UI
    return NextResponse.json({ calendar: [] }, { status: 200 });
  }
}
