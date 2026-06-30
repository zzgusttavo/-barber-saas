import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const barberId = searchParams.get('barberId');

    let targetBarbershopId = null;

    if (slug) {
      const shop = await prisma.barbershop.findUnique({ where: { slug } });
      if (shop) targetBarbershopId = shop.id;
    } else {
      const session = await getServerSession();
      if (session && session.user) {
        targetBarbershopId = (session.user as any).barbershopId;
      }
    }

    if (!targetBarbershopId) {
      return NextResponse.json({ error: 'Sessão inválida ou barbearia não encontrada' }, { status: 403 });
    }

    const whereClause: any = {
      barbershopId: targetBarbershopId
    };

    if (barberId) {
      whereClause.barberId = barberId;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      whereClause.date = { gte: startDate, lte: endDate };
    }
    
    if (status) {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, clientName, whatsapp, password, date, time, serviceName, price, barberId } = body;

    // 1. Encontrar a barbearia pelo slug
    const barbershop = await prisma.barbershop.findUnique({
      where: { slug }
    });

    if (!barbershop) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
    }

    // Usar o barberId passado ou pegar o primeiro barbeiro da barbearia
    let finalBarberId = barberId;
    if (!finalBarberId) {
      const firstBarber = await prisma.barber.findFirst({ where: { barbershopId: barbershop.id } });
      if (firstBarber) finalBarberId = firstBarber.id;
    }

    if (!finalBarberId) {
      return NextResponse.json({ error: 'Nenhum barbeiro disponível' }, { status: 400 });
    }

    // 2. Encontrar ou criar o Cliente
    let client = await prisma.client.findFirst({
      where: { whatsapp, barbershopId: barbershop.id }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          username: whatsapp, // usando whatsapp como username para facilitar
          whatsapp,
          password,
          barbershopId: barbershop.id
        }
      });
    }

    // 3. Garantir o Serviço
    let service = await prisma.service.findFirst({
      where: { name: serviceName, barbershopId: barbershop.id }
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceName,
          price: Number(price),
          duration: 40,
          barbershopId: barbershop.id
        }
      });
    }

    // 4. Criar o Agendamento
    const [yyyy, mm, dd] = date.split('-');
    const [hh, min] = time.split(':');
    const appointmentDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0);

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        status: 'PENDING',
        barberId: finalBarberId,
        serviceId: service.id,
        clientId: client.id,
        barbershopId: barbershop.id
      },
      include: {
        client: true,
        service: true
      }
    });

    // 5. Automação de WhatsApp
    try {
      const msgText = `Olá ${clientName}! Seu agendamento na ${barbershop.name} foi confirmado.\n\n✂️ Serviço: ${service.name}\n📅 Data: ${date} às ${time}\n💰 Valor: R$ ${service.price.toFixed(2)}`;
      
      console.log(`[WHATSAPP] Disparando mensagem para ${whatsapp}: ${msgText}`);

      fetch('http://localhost:3005/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: whatsapp, message: msgText })
      }).catch(e => console.error("Falha ao notificar microserviço:", e));

    } catch (waError) {
      console.error("Erro na automação do WhatsApp:", waError);
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno ao criar agendamento' }, { status: 500 });
  }
}
