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
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    let targetBarbershopId = null;

    if (slug) {
      const shop = await prisma.barbershop.findUnique({ where: { slug } });
      if (shop) targetBarbershopId = shop.id;
    } else {
      const session = await getServerSession(authOptions);
      if (session && session.user) {
        targetBarbershopId = (session.user as any).barbershopId;
      }
    }

    if (!targetBarbershopId) {
      return NextResponse.json({ error: 'Barbearia não encontrada ou não autorizado' }, { status: 403 });
    }

    // Se veio pelo slug (app do cliente), esconde dados sensíveis
    const isPublicRequest = !!slug;

    const barbers = await prisma.barber.findMany({
      where: { 
        barbershopId: targetBarbershopId,
        active: true
      },
      select: {
        id: true,
        name: true,
        email: !isPublicRequest, // Email só visível para o painel do dono
        active: !isPublicRequest,
        role: !isPublicRequest,
        specialty: true,
        avatar: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(barbers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar barbeiros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const barbershopId = (session.user as any).barbershopId;
    const userId = (session.user as any).id;

    // Somente o DONO (role OWNER) pode cadastrar novos barbeiros
    const currentBarber = await prisma.barber.findUnique({ where: { id: userId } });
    if (!currentBarber || currentBarber.role !== 'OWNER') {
      return NextResponse.json({ error: 'Apenas o dono da barbearia pode gerenciar a equipe.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone, specialty, avatar } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    const existingBarber = await prisma.barber.findUnique({ where: { email } });
    if (existingBarber) {
      return NextResponse.json({ error: 'E-mail já está em uso' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const barber = await prisma.barber.create({
      data: {
        name,
        email,
        phone: phone || "",
        specialty: specialty || null,
        avatar: avatar || null,
        password: hashedPassword,
        barbershopId: barbershopId
      },
      select: { id: true, name: true, email: true, specialty: true, avatar: true }
    });

    return NextResponse.json(barber, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar barbeiro' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Somente o DONO pode desativar barbeiros
    const currentBarber = await prisma.barber.findUnique({ where: { id: userId } });
    if (!currentBarber || currentBarber.role !== 'OWNER') {
      return NextResponse.json({ error: 'Apenas o dono da barbearia pode gerenciar a equipe.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    const barbershopId = (session.user as any).barbershopId;
    
    // Instead of deleting, we deactivate them so past appointments don't break
    await prisma.barber.update({
      where: { 
        id: id,
        barbershopId: barbershopId 
      },
      data: { active: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao desativar barbeiro' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const currentBarber = await prisma.barber.findUnique({ where: { id: userId } });
    if (!currentBarber || currentBarber.role !== 'OWNER') {
      return NextResponse.json({ error: 'Apenas o dono da barbearia pode gerenciar a equipe.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, password, phone, specialty, avatar } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, Nome e E-mail são obrigatórios.' }, { status: 400 });
    }

    const dataToUpdate: any = {
      name,
      email,
      phone: phone || "",
      specialty: specialty || null,
      avatar: avatar || null,
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Verificar se e-mail pertence a outro usuário
    const existingBarber = await prisma.barber.findUnique({ where: { email } });
    if (existingBarber && existingBarber.id !== id) {
      return NextResponse.json({ error: 'E-mail já está em uso por outro barbeiro.' }, { status: 400 });
    }

    const updatedBarber = await prisma.barber.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, phone: true, specialty: true, avatar: true }
    });

    return NextResponse.json(updatedBarber);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar barbeiro' }, { status: 500 });
  }
}
