const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const shops = await prisma.barbershop.findMany();
    console.log("Barbershops:");
    shops.forEach(s => console.log(s.slug, s.phone));
    
    const barbers = await prisma.barber.findMany();
    console.log("Barbers:");
    barbers.forEach(b => console.log(b.name, b.phone));
}
check().catch(console.error).finally(() => prisma.$disconnect());
