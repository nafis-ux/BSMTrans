const prisma = require('../config/database');

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        transaksi: {
          include: { mobil: true, ruteTravel: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    // Format data tanpa memicu error Date.prototype.toLocaleDateString
    const formattedTrips = user.transaksi.map(trip => {
      let routeName = trip.jenisLayanan === "TRAVEL" || trip.jenisLayanan === "TRAVEL_REGULER" 
        ? (trip.ruteTravel ? `${trip.ruteTravel.asal} — ${trip.ruteTravel.tujuan}` : "Rute Travel")
        : (trip.mobil ? `${trip.mobil.nama}` : "Sewa Mobil");

      return {
        id: trip.id,
        type: trip.jenisLayanan,
        route: routeName,
        tanggalLayanan: trip.tanggalLayanan, // Kirim mentah (ISO Date)
        time: trip.ruteTravel?.jamKeberangkatan || "-",
        seat: trip.durasi ? `${trip.durasi} Hari` : "Tiket",
        price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(trip.totalHarga),
        status: trip.status === "SUCCESS" || trip.status === "PAID" ? "Aktif" : (trip.status === "DONE" ? "Selesai" : "Menunggu")
      };
    });

    res.status(200).json({
      user: { namaLengkap: user.nama, noHandphone: user.whatsapp || '', email: user.email, role: user.role || 'MEMBER', totalTrip: formattedTrips.filter(t => t.status === 'Selesai').length },
      trips: formattedTrips
    });
  } catch (error) {
    console.error("GET Profile Error:", error);
    res.status(500).json({ error: "Gagal memuat data" });
  }
};

// 2. PERBARUI INFORMASI AKUN (NAMA & WHATSAPP)
const updateUserProfile = async (req, res) => {
  try {
    const { namaLengkap, noHandphone } = req.body;

    if (!namaLengkap) {
      return res.status(400).json({ error: "Nama lengkap tidak boleh kosong" });
    }

    // Update ke database MySQL menggunakan Prisma
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        nama: namaLengkap,     // Sesuai struktur kolom database Anda
        whatsapp: noHandphone  // Sesuai struktur kolom database Anda
      }
    });

    res.status(200).json({
      message: "Profil Anda berhasil diperbarui!",
      user: {
        namaLengkap: updatedUser.nama,
        noHandphone: updatedUser.whatsapp,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("PUT Profile Error:", error);
    res.status(500).json({ error: "Gagal memperbarui profil: " + error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile };