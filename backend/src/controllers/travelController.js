const prisma = require('../config/database');

// 1. AMBIL SEMUA RUTE (Untuk Frontend & Admin Panel)
const getAllRute = async (req, res) => {
  try {
    const rutes = await prisma.ruteTravel.findMany({
      orderBy: { asal: 'asc' }
    });

    // Ambil seluruh transaksi travel yang tidak dibatalkan
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

    // Kalkulasi sisa kursi secara dinamis untuk menjamin 100% sinkronisasi
    const ruteWithSisa = rutes.map(rute => {
      const trx = transaksiBerjalan.filter(t => t.ruteTravelId === rute.id);
      
      let occupiedSeats = [];
      trx.forEach(t => {
        if (t.detailManifest) {
          let seatsStr = '';
          if (typeof t.detailManifest === 'string') {
            seatsStr = t.detailManifest;
          } else if (t.detailManifest && typeof t.detailManifest === 'object' && t.detailManifest.nomorKursi) {
            seatsStr = t.detailManifest.nomorKursi;
          }
          if (seatsStr) {
            const seatsArray = seatsStr.split(',').map(s => s.trim());
            occupiedSeats = [...occupiedSeats, ...seatsArray];
          }
        }
      });

      const uniqueOccupiedSeats = [...new Set(occupiedSeats)].length;
      // Gunakan totalKursi asli dari database
      const trueSisa = Math.max(0, rute.totalKursi - uniqueOccupiedSeats);

      return {
        ...rute,
        sisaKursi: trueSisa
      };
    });

    res.status(200).json(ruteWithSisa);
  } catch (error) {
    console.error("Get Travel Error:", error);
    res.status(500).json({ error: "Gagal mengambil data rute travel" });
  }
};

// 2. TAMBAH RUTE BARU (Admin Panel)
// TAMBAH RUTE BARU (Admin Panel)
const createRute = async (req, res) => {
  try {
    const { asal, tujuan, hargaTiket, jadwal, armada } = req.body;

    if (!asal || !tujuan || !hargaTiket) {
      return res.status(400).json({ error: "Asal, tujuan, dan harga tiket wajib diisi" });
    }

    const newRute = await prisma.ruteTravel.create({
      data: {
        id: "TRV-" + Date.now(), // <-- SOLUSI: Generate ID String unik otomatis (Contoh: TRV-17178000000)
        asal,
        tujuan,
        hargaTiket: parseInt(hargaTiket),
        jadwal: jadwal || "07:00",
        armada: armada || "Hiace Executive"
      }
    });

    res.status(201).json({ message: "Rute travel berhasil ditambahkan", data: newRute });
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan rute: " + error.message });
  }
};

// 3. UPDATE RUTE (Admin Panel)
const updateRute = async (req, res) => {
  try {
    const { id } = req.params;
    const { asal, tujuan, hargaTiket, jadwal, armada } = req.body;

    const updatedRute = await prisma.ruteTravel.update({
      where: { id: id },
      data: {
        asal,
        tujuan,
        hargaTiket: hargaTiket ? parseInt(hargaTiket) : undefined,
        jadwal,
        armada
      }
    });

    res.status(200).json({ message: "Rute berhasil diperbarui", data: updatedRute });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui rute: " + error.message });
  }
};

// 4. HAPUS RUTE (Admin Panel)
const deleteRute = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ruteTravel.delete({ where: { id: id } });
    res.status(200).json({ message: "Rute travel berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus rute travel: " + error.message });
  }
};

// MENGAMBIL DAFTAR KURSI YANG SUDAH TERPESAN (Real-time)
const getOccupiedSeats = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil semua transaksi aktif pada rute travel ini
    const transaksiBerjalan = await prisma.transaksi.findMany({
      where: {
        ruteTravelId: id,
        NOT: {
          status: "BATAL"
        }
      },
      select: {
        detailManifest: true // SOLUSI: Menggunakan nama kolom asli database Anda
      }
    });

    // Gabungkan semua string kursi menjadi satu array utuh
    let occupiedSeats = [];
    transaksiBerjalan.forEach(t => {
      if (t.detailManifest) {
        let seatsStr = '';
        if (typeof t.detailManifest === 'string') {
          seatsStr = t.detailManifest;
        } else if (t.detailManifest && typeof t.detailManifest === 'object' && t.detailManifest.nomorKursi) {
          seatsStr = t.detailManifest.nomorKursi;
        }
        
        if (seatsStr) {
          const seatsArray = seatsStr.split(',').map(s => s.trim());
          occupiedSeats = [...occupiedSeats, ...seatsArray];
        }
      }
    });

    // Buat data menjadi unik (tidak duplikat)
    const uniqueOccupiedSeats = [...new Set(occupiedSeats)];

    res.status(200).json({ occupiedSeats: uniqueOccupiedSeats });
  } catch (error) {
    console.error("Gagal memuat manifest kursi:", error);
    res.status(500).json({ error: "Gagal memuat denah kursi" });
  }
};

// 5. AMBIL DETAIL SATU RUTE (Untuk Halaman Booking)
const getDetailRute = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari rute berdasarkan ID yang dikirim dari URL
    const rute = await prisma.ruteTravel.findUnique({
      where: { id: id } // Sesuaikan dengan tipe data id Anda (jika di DB berupa Int, bungkus dengan parseInt(id))
    });

    if (!rute) {
      return res.status(404).json({ error: "Jadwal rute travel tidak ditemukan" });
    }

    res.status(200).json(rute);
  } catch (error) {
    console.error("Get Detail Travel Error:", error);
    res.status(500).json({ error: "Gagal mengambil rute travel" });
  }
};

module.exports = { getAllRute, createRute, updateRute, deleteRute, getOccupiedSeats, getDetailRute };