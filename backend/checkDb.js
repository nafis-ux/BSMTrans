const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mobils = await prisma.mobil.findMany();
  console.log("Mobil records:", mobils.map(m => ({ id: m.id, image: m.image })));
  
  const travels = await prisma.ruteTravel.findMany();
  console.log("Travel records:", travels.map(t => ({ id: t.id, image: t.image })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
