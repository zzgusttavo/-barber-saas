import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultData } from '@/lib/db-seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // optional
    const status = searchParams.get('status'); // optional

    const whereClause: any = {};
    if (date) {
      // Find appointments for a specific date (start of day to end of day)
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
    const { clientName, whatsapp, password, date, time, serviceName, price } = body;

    const { barbershop, barber, service: defaultService } = await ensureDefaultData();

    // 1. Encontrar ou criar o Cliente
    let client = await prisma.client.findUnique({
      where: { username: clientName }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          username: clientName,
          whatsapp,
          password,
          barbershopId: barbershop.id
        }
      });
    }

    // 2. Garantir o Serviço
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

    // 3. Criar o Agendamento
    // Converter 'YYYY-MM-DD' e 'HH:MM' para DateTime
    const [yyyy, mm, dd] = date.split('-');
    const [hh, min] = time.split(':');
    const appointmentDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0);

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        status: 'PENDING',
        barberId: barber.id,
        serviceId: service.id,
        clientId: client.id,
        barbershopId: barbershop.id
      },
      include: {
        client: true,
        service: true
      }
    });

    // 4. Automação de WhatsApp (Webhook/Evolution API)
    // Dispara a mensagem automática confirmando o agendamento
    try {
      const msgText = `Olá ${clientName}! Seu agendamento na ${barbershop.name} foi confirmado.\n\n✂️ Serviço: ${service.name}\n📅 Data: ${date} às ${time}\n💰 Valor: R$ ${service.price.toFixed(2)}`;
      
      console.log(`\n[WHATSAPP AUTOMATION] 🚀 Disparando mensagem automática para ${whatsapp}:`);
      console.log(msgText);
      console.log(`------------------------------------------------------\n`);

      // Integração real com o Microserviço Baileys local
      const res = await fetch('http://localhost:3005/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: whatsapp,
          message: msgText
        })
      });

      if (!res.ok) {
        console.warn("[WHATSAPP] O microserviço retornou erro ou o WhatsApp não está conectado.");
      } else {
        console.log("[WHATSAPP] Mensagem disparada com sucesso via microserviço Baileys!");
      }

    } catch (waError) {
      console.error("Erro na automação do WhatsApp:", waError);
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
