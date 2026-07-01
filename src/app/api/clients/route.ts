import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from 'bcryptjs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const barbershopId = (session.user as any).barbershopId;

    const clients = await prisma.client.findMany({
      where: { barbershopId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        createdAt: true,
        // Esconde senha e username interno
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
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
    const { name, whatsapp } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Como o cliente está sendo criado pelo painel, geramos um username e senha provisórios
    // para não quebrar a restrição do banco de dados (que exige username único e password).
    const tempUsername = name.toLowerCase().replace(/\s+/g, '') + '_' + Date.now();
    const tempPassword = await bcrypt.hash('123456', 10);

    const client = await prisma.client.create({
      data: {
        name,
        whatsapp: whatsapp || null,
        username: tempUsername,
        password: tempPassword,
        barbershopId: barbershopId
      },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        createdAt: true
      }
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
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

    const barbershopId = (session.user as any).barbershopId;
    
    await prisma.client.delete({
      where: { 
        id: id,
        barbershopId: barbershopId 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar cliente' }, { status: 500 });
  }
}
