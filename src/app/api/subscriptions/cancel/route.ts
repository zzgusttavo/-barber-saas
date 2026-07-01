import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

export async function POST(request: Request) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const barbershopId = (session.user as any).barbershopId;
    const body = await request.json();
    const { reason } = body; // Motivo opcional do cancelamento

    // 2. Buscar a barbearia e o ID da assinatura
    const shop = await prisma.barbershop.findUnique({
      where: { id: barbershopId }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    if (!shop.mpSubscriptionId) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 400 });
    }

    if (shop.mpSubscriptionStatus === 'cancelled') {
      return NextResponse.json({ error: 'Assinatura já está cancelada' }, { status: 400 });
    }

    // 3. Chamar a API do Mercado Pago para cancelar
    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${shop.mpSubscriptionId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      }
    );

    if (!mpResponse.ok) {
      const mpError = await mpResponse.json();
      console.error('[MP CANCEL] Erro do Mercado Pago:', mpError);
      return NextResponse.json(
        { error: 'Erro ao cancelar no Mercado Pago. Tente novamente.' },
        { status: 502 }
      );
    }

    const mpData = await mpResponse.json();

    // 4. Atualizar o status no banco de dados
    await prisma.barbershop.update({
      where: { id: barbershopId },
      data: {
        mpSubscriptionStatus: 'cancelled',
      }
    });

    console.log(`[SUBSCRIPTION] Assinatura ${shop.mpSubscriptionId} cancelada. Motivo: ${reason || 'não informado'}`);

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso.',
      mpStatus: mpData.status,
    });

  } catch (error) {
    console.error('[SUBSCRIPTION CANCEL] Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
