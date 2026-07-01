import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// O Mercado Pago envia notificações neste endpoint
// quando o status da assinatura muda (pago, cancelado, etc.)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('[MP WEBHOOK] Recebido:', type, data);

    // Apenas processar eventos de assinatura (preapproval)
    if (type !== 'subscription_preapproval') {
      return NextResponse.json({ received: true });
    }

    const preapprovalId = data?.id;
    if (!preapprovalId) {
      return NextResponse.json({ error: 'ID da assinatura ausente' }, { status: 400 });
    }

    // Buscar detalhes atualizados da assinatura no MP
    const mpRes = await fetch(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        }
      }
    );

    if (!mpRes.ok) {
      console.error('[MP WEBHOOK] Falha ao buscar preapproval:', preapprovalId);
      return NextResponse.json({ error: 'Falha ao buscar dados do MP' }, { status: 502 });
    }

    const mpData = await mpRes.json();
    const { status, next_payment_date, external_reference } = mpData;

    // external_reference deve ser o barbershopId, definido na criação do preapproval
    if (!external_reference) {
      console.error('[MP WEBHOOK] external_reference ausente no preapproval:', preapprovalId);
      return NextResponse.json({ received: true });
    }

    // Atualizar o banco de dados com o status mais recente
    await prisma.barbershop.update({
      where: { id: external_reference },
      data: {
        mpSubscriptionId: preapprovalId,
        mpSubscriptionStatus: status, // authorized | paused | cancelled | pending
        mpNextBillingDate: next_payment_date ? new Date(next_payment_date) : undefined,
      }
    });

    console.log(`[MP WEBHOOK] Barbearia ${external_reference} → status: ${status}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MP WEBHOOK] Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
