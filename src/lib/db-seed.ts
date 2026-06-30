import { prisma } from './prisma';

export async function ensureDefaultData() {
  // Garantir que existe uma Barbearia
  let barbershop = await prisma.barbershop.findFirst();
  if (!barbershop) {
    barbershop = await prisma.barbershop.create({
      data: {
        name: 'Barbearia Premium',
      }
    });
  }

  // Garantir que existe um Barbeiro
  let barber = await prisma.barber.findFirst();
  if (!barber) {
    barber = await prisma.barber.create({
      data: {
        name: 'Carlos Eduardo',
        username: 'carlos',
        password: '123',
        barbershopId: barbershop.id
      }
    });
  }

  // Garantir que existe um Serviço (Degradê)
  let service = await prisma.service.findFirst({
    where: { name: 'Corte Degradê' }
  });
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: 'Corte Degradê',
        price: 45,
        duration: 40,
        barbershopId: barbershop.id
      }
    });
  }

  return { barbershop, barber, service };
}
