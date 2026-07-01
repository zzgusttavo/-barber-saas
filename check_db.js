const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBarbers() {
    const barbers = await prisma.barber.findMany();
    console.log("Barbers in DB:");
    barbers.forEach(b => {
        console.log(`- Slug: ${b.slug} | Whatsapp: ${b.whatsapp}`);
    });
}

checkBarbers().catch(console.error).finally(() => prisma.$disconnect());
