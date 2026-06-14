const prisma = require('./src/config/database');

async function seedDropOff() {
  try {
    const services = [
      {
        id: 'juanda-surabaya',
        destinasi: 'Bandara Juanda (Surabaya)',
        tag: 'BANDARA / AIRPORT',
        deskripsi: 'Layanan antar langsung ke terminal keberangkatan tepat waktu.',
        harga: 800000,
        estimasiWaktu: '± 6 Jam Perjalanan',
        image: '/bandara.png'
      },
      {
        id: 'stasiun-pasar-turi',
        destinasi: 'Stasiun Pasar Turi (Surabaya)',
        tag: 'STASIUN KERETA',
        deskripsi: 'Penjemputan privat dari rumah menuju stasiun tanpa transit.',
        harga: 750000,
        estimasiWaktu: '± 6.5 Jam Perjalanan',
        image: '/stasiun.png'
      },
      {
        id: 'custom-drop',
        destinasi: 'Lokasi Custom (Sesuai Request)',
        tag: 'FLEKSIBEL',
        deskripsi: 'Tentukan sendiri titik drop-off Anda di area Jawa Timur & Bali.',
        harga: 0,
        estimasiWaktu: 'Waktu Fleksibel',
        image: '/custom-drop.png'
      }
    ];

    for (const s of services) {
      await prisma.layananDropOff.upsert({
        where: { id: s.id },
        update: {},
        create: s
      });
      console.log(`DropOff ${s.id} injected!`);
    }
    console.log("Seeding DropOff selesai.");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

seedDropOff();
