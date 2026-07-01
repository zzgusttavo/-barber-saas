import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug'); // Usado pelo App do Cliente
    
    let targetBarbershopId = null;

    if (slug) {
      // Cliente acessando a barbearia pública
      const shop = await prisma.barbershop.findUnique({ where: { slug } });
      if (shop) targetBarbershopId = shop.id;
    } else {
      // Barbeiro acessando o painel
      const session = await getServerSession(authOptions);
      if (session && session.user) {
        targetBarbershopId = (session.user as any).barbershopId;
      }
    }

    if (!targetBarbershopId) {
      return NextResponse.json({ error: 'Barbearia não encontrada ou não autorizado' }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      where: { barbershopId: targetBarbershopId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const barbershopId = (session.user as any).barbershopId;
    const body = await request.json();

    const service = await prisma.service.create({
      data: {
        name: body.name,
        price: Number(body.price),
        duration: Number(body.duration || 40),
        barbershopId: barbershopId
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    // Verifica se o serviço pertence à barbearia logada
    const barbershopId = (session.user as any).barbershopId;
    
    await prisma.service.delete({
      where: { 
        id: id,
        barbershopId: barbershopId // Segurança: só deleta se for dele
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar serviço' }, { status: 500 });
  }
}
