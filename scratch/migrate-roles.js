const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const all = await p.barber.findMany({ select: { id: true, name: true, role: true } });
  console.log('Todos os barbeiros:', JSON.stringify(all, null, 2));

  const result = await p.barber.updateMany({ data: { role: 'OWNER' } });
  console.log('Updated count:', result.count);

  const after = await p.barber.findMany({ select: { id: true, name: true, role: true } });
  console.log('Depois:', JSON.stringify(after, null, 2));
}

main().finally(() => p.$disconnect());
