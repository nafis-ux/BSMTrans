const prisma = require('./src/config/database');

async function fixDb() {
  try {
    console.log("Membaca seluruh rute travel...");
    const rutes = await prisma.ruteTravel.findMany();
    
    console.log("Membaca transaksi travel berjalan...");
    const transaksiBerjalan = await prisma.transaksi.findMany({
      where: {
        jenisLayanan: "TRAVEL",
        NOT: { status: "BATAL" }
      },
      select: {
        ruteTravelId: true,
        detailManifest: true
      }
    });

    for (const rute of rutes) {
      const trx = transaksiBerjalan.filter(t => t.ruteTravelId === rute.id);
      
      let occupiedSeats = [];
      trx.forEach(t => {
        if (t.detailManifest) {
          let seatsStr = '';
          if (typeof t.detailManifest === 'string') seatsStr = t.detailManifest;
          else if (t.detailManifest && typeof t.detailManifest === 'object' && t.detailManifest.nomorKursi) {
            seatsStr = t.detailManifest.nomorKursi;
          }
          if (seatsStr) {
            const seatsArray = seatsStr.split(',').map(s => s.trim());
            occupiedSeats = [...occupiedSeats, ...seatsArray];
          }
        }
      });

      const uniqueOccupiedSeats = [...new Set(occupiedSeats)].length;
      
      // Hitung sisa kursi fisik ke default asli 14
      const trueTotal = 14;
      const trueSisa = Math.max(0, trueTotal - uniqueOccupiedSeats);

      console.log(`Update Rute: ${rute.asal}-${rute.tujuan} -> totalKursi: ${trueTotal}, sisaKursi: ${trueSisa}`);
      
      await prisma.ruteTravel.update({
        where: { id: rute.id },
        data: {
          totalKursi: trueTotal,
          sisaKursi: trueSisa
        }
      });
    }

    console.log("Sinkronisasi Database Selesai!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fixDb();
