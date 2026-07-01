import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const barbershopId = (session.user as any).barbershopId;
    
    // Pega o parametro periodo da URL (ex: ?periodo=mes)
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';

    // Determina o range de datas atual e o anterior (para comparar crescimento se quisermos, 
    // mas por enquanto vamos retornar 0% de cresc se for complexo, ou fazer um mock seguro)
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (periodo === 'semana') {
      const diff = startDate.getDate() - 7;
      startDate = new Date(startDate.setDate(diff));
    } else if (periodo === 'mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (periodo === 'ano') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Busca agendamentos finalizados no período
    const appointments = await prisma.appointment.findMany({
      where: {
        barbershopId,
        status: 'COMPLETED',
        date: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        service: true
      }
    });

    // Busca novos clientes cadastrados no período
    const novosClientes = await prisma.client.count({
      where: {
        barbershopId,
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    });

    const faturamentoBruto = appointments.reduce((acc, curr) => acc + curr.service.price, 0);
    const servicosFeitos = appointments.length;

    // Agrupa os serviços mais procurados
    const servicoCount: Record<string, number> = {};
    appointments.forEach(app => {
      const sName = app.service.name;
      servicoCount[sName] = (servicoCount[sName] || 0) + 1;
    });

    const servicosPopulares = Object.entries(servicoCount)
      .map(([nome, qtd]) => ({
        nome,
        qtd,
        percent: servicosFeitos > 0 ? Math.round((qtd / servicosFeitos) * 100) : 0
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5); // Top 5

    return NextResponse.json({
      faturamentoBruto,
      novosClientes,
      servicosFeitos,
      servicosPopulares
    });

  } catch (error) {
    console.error('[RELATORIOS API ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar relatorios' }, { status: 500 });
  }
}
