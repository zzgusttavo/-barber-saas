import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const barber = await prisma.barber.findUnique({
      where: { email: 'zzgusttavo@gmail.com' },
      include: { barbershop: true }
    });
    console.log("Barber found:", barber);
  } catch (e) {
    console.error("Error finding barber:", e);
  }
}

main().finally(() => prisma.$disconnect());
