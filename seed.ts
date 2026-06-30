const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shop = await prisma.barbershop.findFirst();
  if (!shop) throw new Error("No shop");

  const barber = await prisma.barber.findFirst();
  if (!barber) throw new Error("No barber");

  let service = await prisma.service.findFirst();
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: 'Corte Degradê',
        price: 45.0,
        duration: 45,
        barbershopId: shop.id
      }
    });
  }

  let client = await prisma.client.findFirst();
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Cliente Teste',
        whatsapp: '11999999999',
        username: 'cliente_teste',
        password: '123',
        barbershopId: shop.id
      }
    });
  }

  const today = new Date();
  today.setHours(9, 0, 0, 0); // start at 9:00

  for (let i = 0; i < 10; i++) {
    const aptTime = new Date(today.getTime());
    aptTime.setMinutes(today.getMinutes() + (i * 45)); // every 45 mins

    await prisma.appointment.create({
      data: {
        date: aptTime,
        status: i < 4 ? 'COMPLETED' : 'PENDING',
        barberId: barber.id,
        serviceId: service.id,
        clientId: client.id,
        barbershopId: shop.id
      }
    });
    console.log(`Created appointment at ${aptTime.toLocaleTimeString()}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
