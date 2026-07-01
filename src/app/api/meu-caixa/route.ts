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
    
    // Pega o parametro filter da URL (ex: ?filter=hoje)
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'hoje';

    // Determina o range de datas
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (filter === 'semana') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
      startDate = new Date(startDate.setDate(diff));
    } else if (filter === 'mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
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
        service: true,
        client: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Formata os dados para o frontend (Meu Caixa)
    const transacoes = appointments.map(app => ({
      id: app.id,
      tipo: 'entrada',
      valor: app.service.price,
      descricao: `${app.service.name} - ${app.client.name.split(' ')[0]}`,
      metodo: 'Sistema',
      data: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(app.date))
    }));

    // Futuramente, as saídas virão de uma tabela de Despesas.
    // Por enquanto, enviamos 0 saídas.
    return NextResponse.json({
      transacoes,
      totalEntradas: transacoes.reduce((acc, curr) => acc + curr.valor, 0),
      totalSaidas: 0
    });

  } catch (error) {
    console.error('[MEU CAIXA API ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar caixa' }, { status: 500 });
  }
}
