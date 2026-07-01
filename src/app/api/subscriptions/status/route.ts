import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const barbershopId = (session.user as any).barbershopId;

    const shop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        mpSubscriptionId: true,
        mpSubscriptionStatus: true,
        mpNextBillingDate: true,
        trialEndsAt: true,
        createdAt: true,
      }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    // Se tem ID da assinatura, sincroniza com o MP para pegar status atualizado
    if (shop.mpSubscriptionId && MP_ACCESS_TOKEN) {
      try {
        const mpRes = await fetch(
          `https://api.mercadopago.com/preapproval/${shop.mpSubscriptionId}`,
          {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
          }
        );

        if (mpRes.ok) {
          const mpData = await mpRes.json();

          // Atualiza o banco com os dados mais recentes do MP
          const updated = await prisma.barbershop.update({
            where: { id: barbershopId },
            data: {
              mpSubscriptionStatus: mpData.status,
              mpNextBillingDate: mpData.next_payment_date
                ? new Date(mpData.next_payment_date)
                : undefined,
            },
            select: {
              mpSubscriptionId: true,
              mpSubscriptionStatus: true,
              mpNextBillingDate: true,
              trialEndsAt: true,
              createdAt: true,
            }
          });

          return NextResponse.json(updated);
        }
      } catch (syncErr) {
        console.error('[SUBSCRIPTION STATUS] Erro ao sincronizar com MP:', syncErr);
        // Retorna dados do banco mesmo se a sync falhar
      }
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('[SUBSCRIPTION STATUS] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
