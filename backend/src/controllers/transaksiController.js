const prisma = require('../config/database');

// A. ENDPOINT POST: Membuat Transaksi Baru
const createTransaksi = async (req, res) => {
  try {
    const userId = req.userId || "1d8dede6-d0a9-4461-b9d0-0045869b87d5"; 
    const { jenisLayanan } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "Data pengguna tidak ditemukan!" });
    }

    if (jenisLayanan === "TRAVEL") {
      const { ruteTravelId, namaPenumpang, alamatPenjemputan, nomorKursi, tanggalLayanan } = req.body;
      
      if (!ruteTravelId || !nomorKursi || !alamatPenjemputan) {
        return res.status(400).json({ error: "Rute, nomor kursi, dan alamat penjemputan wajib diisi!" });
      }

      const rute = await prisma.ruteTravel.findUnique({
        where: { id: ruteTravelId }
      });

      if (!rute) {
        return res.status(404).json({ error: "Jadwal rute travel tidak ditemukan!" });
      }

      const jumlahPenumpang = nomorKursi.split(',').filter(k => k.trim().length > 0).length;
      const grandTotalHarga = rute.hargaTiket * jumlahPenumpang;

      const transaksiBaru = await prisma.transaksi.create({
        data: {
          id: `TRX-${Date.now()}`,
          userId: userId,
          jenisLayanan: "TRAVEL",
          ruteTravelId: ruteTravelId,
          tanggalLayanan: tanggalLayanan ? new Date(tanggalLayanan) : new Date(),
          durasi: 1,
          alamatJemput: alamatPenjemputan,
          totalHarga: grandTotalHarga,
          sisaTagihan: grandTotalHarga,
          status: "PENDING",
          detailManifest: {
            namaPenumpang: namaPenumpang || user.nama,
            nomorKursi: nomorKursi,
            nomorWhatsapp: user.noHandphone || user.whatsapp || '-'
          }
        }
      });

      // Update sisaKursi pada RuteTravel
      await prisma.ruteTravel.update({
        where: { id: ruteTravelId },
        data: {
          sisaKursi: {
            decrement: jumlahPenumpang
          }
        }
      });

      return res.status(201).json({
        message: "Transaksi travel berhasil dibuat",
        transaksiId: transaksiBaru.id
      });


      // Default ke SEWA_MOBIL
      const { carId, rentalDate, duration, driverService } = req.body;

      if (!carId || !rentalDate || !duration || !driverService) {
        return res.status(400).json({ error: "Semua data transaksi wajib diisi!" });
      }

      const mobil = await prisma.mobil.findUnique({
        where: { id: carId }
      });

      if (!mobil) {
        return res.status(404).json({ error: "Data armada mobil tidak ditemukan!" });
      }

      const hargaSewaTotal = mobil.hargaPerHari * parseInt(duration);
      const biayaDriverTotal = driverService === 'driver' ? (mobil.biayaDriver || 150000) * parseInt(duration) : 0;
      const grandTotalHarga = hargaSewaTotal + biayaDriverTotal;

      const transaksiBaru = await prisma.transaksi.create({
        data: {
          id: `TRX-${Date.now()}`, 
          userId: userId,
          jenisLayanan: "SEWA_MOBIL", 
          mobilId: carId,
          tanggalLayanan: new Date(rentalDate), 
          durasi: parseInt(duration),
          totalHarga: grandTotalHarga,
          sisaTagihan: grandTotalHarga,
          status: "PENDING", 
          detailManifest: {
            namaPelanggan: user.namaLengkap || user.nama,
            layananDriver: driverService,
            nomorWhatsapp: user.noHandphone || user.whatsapp
          }
        }
      });

      // Update status ketersediaan mobil menjadi false (Sedang Disewa)
      await prisma.mobil.update({
        where: { id: carId },
        data: { statusTersedia: false }
      });

      return res.status(201).json({ 
        message: "Transaksi berhasil dibuat", 
        transaksiId: transaksiBaru.id 
      });
    }
  } catch (error) {
    console.error("Error pada createTransaksi:", error);
    res.status(500).json({ error: "Gagal memproses transaksi: " + error.message });
  }
};

const getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: id },
      include: {
        mobil: true,
        ruteTravel: true
      }
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Data detail transaksi tidak ditemukan" });
    }

    res.status(200).json(transaksi);
  } catch (error) {
    console.error("Error pada getTransaksiById:", error);
    res.status(500).json({ error: "Gagal memproses data transaksi: " + error.message });
  }
};

const getTransaksiByUserId = async (req, res) => {
  try {
    const userId = req.userId || "1d8dede6-d0a9-4461-b9d0-0045869b87d5"; 

    const daftarTransaksi = await prisma.transaksi.findMany({
      where: { userId: userId },
      include: { 
        mobil: true,
        ruteTravel: true
      },
      orderBy: { id: 'desc' }
    });

    const transaksiBersih = daftarTransaksi.map(t => ({
      ...t,
      tanggalLayanan: t.tanggalLayanan || new Date()
    }));

    res.status(200).json(transaksiBersih);
  } catch (error) {
    res.status(500).json({ error: "Gagal: " + error.message });
  }
};

const uploadBuktiDP = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "Berkas resi bukti transfer DP wajib diunggah!" });
    }

    const filename = req.file.filename;

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: id }
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan!" });
    }

    await prisma.dokumenValidasi.upsert({
      where: { transaksiId: id },
      update: { buktiResiDP: filename },
      create: {
        transaksiId: id,
        buktiResiDP: filename
      }
    });

    const transaksiUpdated = await prisma.transaksi.update({
      where: { id: id },
      data: { status: "VERIFIKASI_DP" }
    });

    res.status(200).json({
      message: "Bukti transfer DP berhasil diunggah!",
      status: transaksiUpdated.status
    });
  } catch (error) {
    console.error("Upload Bukti DP Error:", error);
    res.status(500).json({ error: "Gagal mengunggah bukti DP: " + error.message });
  }
};

const uploadBuktiSisa = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "Berkas resi bukti transfer pelunasan sisa wajib diunggah!" });
    }

    const filename = req.file.filename;

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: id }
    });

    if (!transaksi) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan!" });
    }

    await prisma.dokumenValidasi.upsert({
      where: { transaksiId: id },
      update: { buktiResiSisa: filename },
      create: {
        transaksiId: id,
        buktiResiSisa: filename
      }
    });

    const transaksiUpdated = await prisma.transaksi.update({
      where: { id: id },
      data: { status: "VERIFIKASI_SISA" }
    });

    res.status(200).json({
      message: "Bukti transfer pelunasan sisa berhasil diunggah!",
      status: transaksiUpdated.status
    });
  } catch (error) {
    console.error("Upload Bukti Sisa Error:", error);
    res.status(500).json({ error: "Gagal mengunggah bukti sisa: " + error.message });
  }
};

module.exports = { 
  createTransaksi, 
  getTransaksiById, 
  getTransaksiByUserId,
  uploadBuktiDP,
  uploadBuktiSisa
};