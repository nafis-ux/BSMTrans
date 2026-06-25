const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:qCrottkpBUdOKsCroAcrkLpsNaVRsZpr@thomas.proxy.rlwy.net:54493/railway'
    }
  }
});

async function main() {
  try {
    const mobils = await prisma.mobil.findMany();
    console.log('Prisma connected! Mobil count:', mobils.length);
    console.log('Mobils:', mobils);
  } catch (e) {
    console.error('Prisma Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
