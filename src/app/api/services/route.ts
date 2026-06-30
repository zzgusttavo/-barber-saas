export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultData } from '@/lib/db-seed';

export async function GET() {
  try {
    const { barbershop } = await ensureDefaultData();
    const services = await prisma.service.findMany({
      where: { barbershopId: barbershop.id }
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { barbershop } = await ensureDefaultData();
    const body = await request.json();
    const service = await prisma.service.create({
      data: {
        name: body.name,
        price: Number(body.price),
        duration: 40,
        barbershopId: barbershop.id
      }
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
