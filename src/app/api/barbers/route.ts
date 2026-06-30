import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultData } from '@/lib/db-seed';

export async function GET() {
  try {
    const { barbershop } = await ensureDefaultData();
    const barbers = await prisma.barber.findMany({
      where: { barbershopId: barbershop.id }
    });
    return NextResponse.json(barbers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar barbeiros' }, { status: 500 });
  }
}
