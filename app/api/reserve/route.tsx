// app/api/reserve/route.ts
import { NextResponse } from 'next/server';

type UserInfo = {
  fullName: string;
  age: string;
  email: string;
  city: string;
};

type ReserveBody = {
  clientToken: string;
  servicio: string;
  horario: string;
  date: string;
  usuario: UserInfo;
};

export async function POST(request: Request) {
  let body: ReserveBody;
  try {
    body = (await request.json()) as ReserveBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { clientToken, servicio, horario, date, usuario } = body;
  if (
    typeof clientToken !== 'string' ||
    typeof servicio !== 'string' ||
    typeof horario !== 'string' ||
    typeof date !== 'string' ||
    !usuario ||
    typeof usuario.fullName !== 'string' ||
    typeof usuario.age !== 'string' ||
    typeof usuario.email !== 'string' ||
    typeof usuario.city !== 'string'
  ) {
    return NextResponse.json({ error: 'Faltan parámetros obligatorios o tienen tipo incorrecto' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${process.env.LAMBDA_URL}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    console.error('Error en /api/reserve:', error);
    return NextResponse.json({ error: 'Error al conectar con el servicio de reserva' }, { status: 502 });
  }
}
