const prisma = require('../config/database');

// 1. DASHBOARD STATISTIK ADMIN
const getDashboardStats = async (req, res) => {
  try {
    // Total revenue dari semua transaksi LUNAS
    const revenueResult = await prisma.transaksi.aggregate({
      _sum: { totalHarga: true },
      where: { status: 'LUNAS' }
    });

    // Revenue bulan ini
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueBulanIni = await prisma.transaksi.aggregate({
      _sum: { totalHarga: true },
      where: {
        status: 'LUNAS',
        createdAt: { gte: firstDayOfMonth }
      }
    });

    // Breakdown revenue bulanan (6 bulan terakhir)
    const lunasTransactions = await prisma.transaksi.findMany({
      where: { status: 'LUNAS' },
      select: { totalHarga: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const monthlyRevenue = {};
    lunasTransactions.forEach(trx => {
      const date = new Date(trx.createdAt);
      // Format: "Jan 2023", "Feb 2023"
      const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = 0;
      }
      monthlyRevenue[monthYear] += trx.totalHarga;
    });

    // Jumlah transaksi per status
    const totalTransaksi = await prisma.transaksi.count();
    const transaksiPending = await prisma.transaksi.count({ where: { status: 'PENDING' } });
    const transaksiVerifikasiDP = await prisma.transaksi.count({ where: { status: 'VERIFIKASI_DP' } });
    const transaksiDPDibayar = await prisma.transaksi.count({ where: { status: 'DP_DIBAYAR' } });
    const transaksiVerifikasiSisa = await prisma.transaksi.count({ where: { status: 'VERIFIKASI_SISA' } });
    const transaksiLunas = await prisma.transaksi.count({ where: { status: 'LUNAS' } });
    const transaksiBatal = await prisma.transaksi.count({ where: { status: 'BATAL' } });

    // Jumlah armada
    const totalArmada = await prisma.mobil.count();
    const armadaTersedia = await prisma.mobil.count({ where: { statusTersedia: true } });

    // Jumlah rute travel
    const totalRute = await prisma.ruteTravel.count();

    // Jumlah user terdaftar (Hanya PELANGGAN, bukan ADMIN)
    const totalUser = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    res.status(200).json({
      revenue: {
        total: revenueResult._sum.totalHarga || 0,
        bulanIni: revenueBulanIni._sum.totalHarga || 0,
        history: monthlyRevenue
      },
      transaksi: {
        total: totalTransaksi,
        pending: transaksiPending,
        verifikasiDP: transaksiVerifikasiDP,
        dpDibayar: transaksiDPDibayar,
        verifikasiSisa: transaksiVerifikasiSisa,
        lunas: transaksiLunas,
        batal: transaksiBatal
      },
      armada: {
        total: totalArmada,
        tersedia: armadaTersedia
      },
      ruteTravel: totalRute,
      totalUser: totalUser
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Gagal memuat statistik dashboard: " + error.message });
  }
};

// 2. AMBIL SEMUA TRANSAKSI (SEMUA USER)
const getAllTransaksi = async (req, res) => {
  try {
    const transaksiList = await prisma.transaksi.findMany({
      include: {
        user: { select: { id: true, nama: true, email: true, whatsapp: true } },
        mobil: true,
        ruteTravel: true,
        dokumenValidasi: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(transaksiList);
  } catch (error) {
    console.error("Get All Transaksi Error:", error);
    res.status(500).json({ error: "Gagal memuat data transaksi: " + error.message });
  }
};

// 3. UPDATE STATUS TRANSAKSI (VALIDASI DP / PELUNASAN)
const updateStatusTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status yang diperbolehkan
    const allowedStatuses = ['PENDING', 'VERIFIKASI_DP', 'DP_DIBAYAR', 'VERIFIKASI_SISA', 'LUNAS', 'BATAL'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status "${status}" tidak valid.` });
    }

    const transaksi = await prisma.transaksi.findUnique({ where: { id } });
    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan!" });
    }

    // Update sisaTagihan jika status menjadi LUNAS
    const updateData = { status };
    if (status === 'LUNAS') {
      updateData.sisaTagihan = 0;
    } else if (status === 'DP_DIBAYAR') {
      updateData.sisaTagihan = Math.floor(transaksi.totalHarga * 0.5);
    }

    const updated = await prisma.transaksi.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      message: `Status transaksi ${id} berhasil diubah menjadi ${status}.`,
      transaksi: updated
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Gagal mengubah status transaksi: " + error.message });
  }
};

// 4. UPDATE DATA MOBIL
const updateMobil = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaMobil, tipe, hargaPerHari, biayaDriver, statusTersedia, kursi, bagasi, transmisi, fiturLain, image } = req.body;

    const mobil = await prisma.mobil.update({
      where: { id },
      data: {
        ...(namaMobil !== undefined && { namaMobil }),
        ...(tipe !== undefined && { tipe }),
        ...(hargaPerHari !== undefined && { hargaPerHari: parseInt(hargaPerHari) || 0 }),
        ...(biayaDriver !== undefined && { biayaDriver: parseInt(biayaDriver) || 0 }),
        ...(statusTersedia !== undefined && { statusTersedia }),
        ...(kursi !== undefined && { kursi: parseInt(kursi) || 5 }),
        ...(bagasi !== undefined && { bagasi: parseInt(bagasi) || 2 }),
        ...(transmisi !== undefined && { transmisi }),
        ...(fiturLain !== undefined && { fiturLain }),
        ...(image !== undefined && { image }),
      }
    });

    res.status(200).json({ message: "Data mobil berhasil diperbarui.", mobil });
  } catch (error) {
    console.error("Update Mobil Error:", error);
    res.status(500).json({ error: "Gagal memperbarui data mobil: " + error.message });
  }
};

// UPDATE GAMBAR MOBIL LANGSUNG (PUT)
const updateMobilImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[updateMobilImage] ID:', id);
    console.log('[updateMobilImage] req.file:', req.file ? { path: req.file.path, filename: req.file.filename } : 'NO FILE');
    if (!req.file) return res.status(400).json({ error: "Tidak ada file yang diunggah" });

    const imageUrl = req.file.path;
    console.log('[updateMobilImage] Saving imageUrl to DB:', imageUrl);

    const mobil = await prisma.mobil.update({
      where: { id },
      data: { image: imageUrl }
    });
    console.log('[updateMobilImage] DB result image:', mobil.image);
    res.status(200).json({ message: "Gambar mobil berhasil diperbarui.", filename: imageUrl, mobil });
  } catch (error) {
    console.error("Update Mobil Image Error:", error);
    res.status(500).json({ error: "Gagal memperbarui gambar mobil: " + error.message });
  }
};

// 5. HAPUS MOBIL
const deleteMobil = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mobil.delete({ where: { id } });
    res.status(200).json({ message: "Unit mobil berhasil dihapus." });
  } catch (error) {
    console.error("Delete Mobil Error:", error);
    res.status(500).json({ error: "Gagal menghapus mobil: " + error.message });
  }
};

// 6. TAMBAH MOBIL BARU
const createMobil = async (req, res) => {
  try {
    const { namaMobil, tipe, hargaPerHari, biayaDriver, statusTersedia, kursi, bagasi, transmisi, fiturLain, image } = req.body;
    
    console.log('[createMobil] req.body:', JSON.stringify(req.body));
    console.log('[createMobil] image value:', JSON.stringify(image), 'type:', typeof image);

    // Generate ID otomatis (MBL- + 4 digit angka random)
    const randomId = `MBL-${Math.floor(1000 + Math.random() * 9000)}`;

    // Pastikan image yang kosong jadi null
    const imageValue = (image && image.trim && image.trim() !== '') ? image.trim() : null;
    console.log('[createMobil] imageValue to save:', imageValue);

    const newMobil = await prisma.mobil.create({
      data: {
        id: randomId,
        namaMobil,
        tipe: tipe || "Standar",
        hargaPerHari: parseInt(hargaPerHari) || 0,
        biayaDriver: parseInt(biayaDriver) || 150000,
        statusTersedia: statusTersedia !== undefined ? statusTersedia : true,
        kursi: parseInt(kursi) || 5,
        bagasi: parseInt(bagasi) || 2,
        transmisi: transmisi || "Manual",
        fiturLain: fiturLain || "AC, Audio",
        image: imageValue
      }
    });

    console.log('[createMobil] DB result:', JSON.stringify({ id: newMobil.id, image: newMobil.image }));
    res.status(201).json({ message: "Armada baru berhasil ditambahkan", mobil: newMobil });
  } catch (error) {
    console.error("Create Mobil Error:", error);
    res.status(500).json({ error: "Gagal menambah armada: " + error.message });
  }
};

// 7. GET ADMIN PROFILE
const getAdminProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { nama: true, email: true, whatsapp: true, uiPreferences: true, role: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Gagal memuat profil admin: " + error.message });
  }
};

// 8. UPDATE ADMIN PROFILE
const updateAdminProfile = async (req, res) => {
  try {
    const { nama, email, whatsapp, password } = req.body;
    const bcrypt = require('bcryptjs');
    
    const updateData = { nama, email, whatsapp };
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: { nama: true, email: true, whatsapp: true, role: true }
    });

    res.status(200).json({ message: "Profil berhasil diperbarui", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui profil: " + error.message });
  }
};

// 9. UPDATE ADMIN SETTINGS
const updateAdminSettings = async (req, res) => {
  try {
    const { uiPreferences } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { uiPreferences },
      select: { uiPreferences: true }
    });

    res.status(200).json({ message: "Pengaturan berhasil disimpan", uiPreferences: updatedUser.uiPreferences });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui pengaturan: " + error.message });
  }
};

// ============================================
// MANAJEMEN RUTE TRAVEL
// ============================================

// 10. TAMBAH RUTE TRAVEL BARU
const createTravel = async (req, res) => {
  try {
    const { asal, tujuan, hargaTiket, jadwal, armada, totalKursi, fasilitas, estimasiWaktu, titikKumpul, titikTurun, image } = req.body;
    
    console.log('[createTravel] req.body:', JSON.stringify(req.body));
    console.log('[createTravel] image value:', JSON.stringify(image), 'type:', typeof image);

    const randomId = `TRV-${Date.now()}`;

    // Pastikan image yang kosong jadi null
    const imageValue = (image && image.trim && image.trim() !== '') ? image.trim() : null;
    console.log('[createTravel] imageValue to save:', imageValue);

    const newTravel = await prisma.ruteTravel.create({
      data: {
        id: randomId,
        asal,
        tujuan,
        hargaTiket: parseInt(hargaTiket) || 0,
        jadwal: jadwal || "07:00",
        armada: armada || "Hiace Executive",
        totalKursi: parseInt(totalKursi) || 14,
        sisaKursi: parseInt(totalKursi) || 14,
        fasilitas: fasilitas || "AC, Reclining Seat",
        estimasiWaktu: estimasiWaktu || "8 Jam",
        titikKumpul: titikKumpul || "Pool BSM",
        titikTurun: titikTurun || "Terminal Tujuan",
        image: imageValue
      }
    });

    console.log('[createTravel] DB result:', JSON.stringify({ id: newTravel.id, image: newTravel.image }));
    res.status(201).json({ message: "Rute travel baru berhasil ditambahkan", travel: newTravel });
  } catch (error) {
    console.error("Create Travel Error:", error);
    res.status(500).json({ error: "Gagal menambah rute travel: " + error.message });
  }
};

// 11. UPDATE RUTE TRAVEL
const updateTravel = async (req, res) => {
  try {
    const { id } = req.params;
    const { asal, tujuan, hargaTiket, jadwal, armada, totalKursi, sisaKursi, fasilitas, estimasiWaktu, titikKumpul, titikTurun, image } = req.body;

    const updatedTravel = await prisma.ruteTravel.update({
      where: { id },
      data: {
        ...(asal !== undefined && { asal }),
        ...(tujuan !== undefined && { tujuan }),
        ...(hargaTiket !== undefined && { hargaTiket: parseInt(hargaTiket) || 0 }),
        ...(jadwal !== undefined && { jadwal }),
        ...(armada !== undefined && { armada }),
        ...(totalKursi !== undefined && { totalKursi: parseInt(totalKursi) || 14 }),
        ...(sisaKursi !== undefined && { sisaKursi: parseInt(sisaKursi) || 14 }),
        ...(fasilitas !== undefined && { fasilitas }),
        ...(estimasiWaktu !== undefined && { estimasiWaktu }),
        ...(titikKumpul !== undefined && { titikKumpul }),
        ...(titikTurun !== undefined && { titikTurun }),
        ...(image !== undefined && { image }),
      }
    });

    res.status(200).json({ message: "Rute travel berhasil diperbarui.", travel: updatedTravel });
  } catch (error) {
    console.error("Update Travel Error:", error);
    res.status(500).json({ error: "Gagal memperbarui rute travel: " + error.message });
  }
};

// UPDATE GAMBAR TRAVEL LANGSUNG (PUT)
const updateTravelImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[updateTravelImage] ID:', id);
    console.log('[updateTravelImage] req.file:', req.file ? { path: req.file.path, filename: req.file.filename } : 'NO FILE');
    if (!req.file) return res.status(400).json({ error: "Tidak ada file yang diunggah" });

    const imageUrl = req.file.path;
    console.log('[updateTravelImage] Saving imageUrl to DB:', imageUrl);

    const travel = await prisma.ruteTravel.update({
      where: { id },
      data: { image: imageUrl }
    });
    console.log('[updateTravelImage] DB result image:', travel.image);
    res.status(200).json({ message: "Gambar travel berhasil diperbarui.", filename: imageUrl, travel });
  } catch (error) {
    console.error("Update Travel Image Error:", error);
    res.status(500).json({ error: "Gagal memperbarui gambar travel: " + error.message });
  }
};

// 12. DELETE RUTE TRAVEL
const deleteTravel = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ruteTravel.delete({ where: { id } });
    res.status(200).json({ message: "Rute travel berhasil dihapus." });
  } catch (error) {
    console.error("Delete Travel Error:", error);
    res.status(500).json({ error: "Gagal menghapus rute travel: " + error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllTransaksi,
  updateStatusTransaksi,
  updateMobil,
  deleteMobil,
  createMobil,
  updateMobilImage,
  getAdminProfile,
  updateAdminProfile,
  updateAdminSettings,
  createTravel,
  updateTravel,
  deleteTravel,
  updateTravelImage
};
