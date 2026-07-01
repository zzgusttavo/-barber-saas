import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const res = await fetch('https://gustavo-barber-bot-prod-1.loca.lt/qr', {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Servidor do WhatsApp offline' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch('https://gustavo-barber-bot-prod-1.loca.lt/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao conectar no robô' }, { status: 500 });
  }
}

