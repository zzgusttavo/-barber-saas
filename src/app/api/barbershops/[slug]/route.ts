import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const shop = await prisma.barbershop.findUnique({
      where: { slug },
      include: {
        barbers: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    return NextResponse.json(shop, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar barbearia:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
