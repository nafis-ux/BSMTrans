const prisma = require('../config/database');

const getAllDropOff = async (req, res) => {
  try {
    const data = await prisma.layananDropOff.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Get DropOff Error:", error);
    res.status(500).json({ error: "Gagal mengambil data drop off" });
  }
};

const getDropOffById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.layananDropOff.findUnique({
      where: { id: id }
    });
    if (!data) return res.status(404).json({ error: "Layanan tidak ditemukan" });
    res.status(200).json(data);
  } catch (error) {
    console.error("Get DropOff By Id Error:", error);
    res.status(500).json({ error: "Gagal mengambil detail drop off" });
  }
};

const createDropOff = async (req, res) => {
  try {
    const { id, destinasi, tag, deskripsi, harga, estimasiWaktu, image } = req.body;
    const newDropOff = await prisma.layananDropOff.create({
      data: {
        id: id || `DROP-${Date.now()}`,
        destinasi,
        tag: tag || 'FLEKSIBEL',
        deskripsi,
        harga: parseInt(harga),
        estimasiWaktu,
        image
      }
    });
    res.status(201).json({ message: "Layanan Drop Off berhasil ditambahkan", data: newDropOff });
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan layanan drop off: " + error.message });
  }
};

const updateDropOff = async (req, res) => {
  try {
    const { id } = req.params;
    const { destinasi, tag, deskripsi, harga, estimasiWaktu, image } = req.body;
    
    const updated = await prisma.layananDropOff.update({
      where: { id: id },
      data: {
        destinasi,
        tag,
        deskripsi,
        harga: harga !== undefined ? parseInt(harga) : undefined,
        estimasiWaktu,
        image
      }
    });
    res.status(200).json({ message: "Layanan berhasil diperbarui", data: updated });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui layanan drop off: " + error.message });
  }
};

const deleteDropOff = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.layananDropOff.delete({ where: { id: id } });
    res.status(200).json({ message: "Layanan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus layanan drop off: " + error.message });
  }
};

module.exports = { getAllDropOff, getDropOffById, createDropOff, updateDropOff, deleteDropOff };
