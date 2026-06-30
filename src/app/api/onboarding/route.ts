import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { businessName, fullName, phone, email, password } = data;

    if (!businessName || !fullName || !phone || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    // Gerar um slug baseado no nome da barbearia
    let slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Verificar se o email já existe
    const existingBarber = await prisma.barber.findUnique({ where: { email } });
    if (existingBarber) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 400 });
    }

    // Verificar se o slug já existe
    let existingShop = await prisma.barbershop.findUnique({ where: { slug } });
    if (existingShop) {
      // Se existir, adiciona um número aleatório ao slug
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar a Barbearia e o Barbeiro dentro de uma transação
    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.barbershop.create({
        data: {
          name: businessName,
          slug: slug,
          phone: phone,
        }
      });

      const barber = await tx.barber.create({
        data: {
          name: fullName,
          email: email,
          phone: phone,
          password: hashedPassword,
          barbershopId: shop.id
        }
      });

      return { shop, barber };
    });

    return NextResponse.json({ success: true, slug: result.shop.slug }, { status: 201 });
  } catch (error) {
    console.error('Erro no Onboarding:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
