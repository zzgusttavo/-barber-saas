import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const res = await fetch('http://127.0.0.1:3005/qr');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Servidor do WhatsApp offline' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch('http://127.0.0.1:3005/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao conectar no robô' }, { status: 500 });
  }
}
