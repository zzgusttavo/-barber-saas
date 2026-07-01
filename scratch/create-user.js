const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'zzgusttavo@gmail.com';
  const password = 'gusta0110';
  const name = 'Gustavo';
  const businessName = 'Barbearia do Gustavo';
  const slug = 'barbearia-gustavo';

  // Verificar se já existe
  const existing = await prisma.barber.findUnique({ where: { email } });
  if (existing) {
    console.log('Usuário já existe! Atualizando senha...');
    const hash = await bcrypt.hash(password, 10);
    await prisma.barber.update({ where: { email }, data: { password: hash, role: 'OWNER' } });
    console.log('Senha atualizada com sucesso!');
    return;
  }

  // Verificar se o slug já existe
  let finalSlug = slug;
  const existingShop = await prisma.barbershop.findUnique({ where: { slug } });
  if (existingShop) {
    finalSlug = slug + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const shop = await tx.barbershop.create({
      data: {
        name: businessName,
        slug: finalSlug,
        phone: '',
      }
    });

    const barber = await tx.barber.create({
      data: {
        name,
        email,
        phone: '',
        password: hashedPassword,
        role: 'OWNER',
        barbershopId: shop.id,
      }
    });

    return { shop, barber };
  });

  console.log('✅ Conta criada com sucesso!');
  console.log('   Nome:', result.barber.name);
  console.log('   Email:', result.barber.email);
  console.log('   Barbearia:', result.shop.name);
  console.log('   Slug:', result.shop.slug);
  console.log('   Role:', result.barber.role);
}

main()
  .catch(e => console.error('Erro:', e))
  .finally(() => prisma.$disconnect());
