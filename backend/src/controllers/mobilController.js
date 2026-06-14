// src/controllers/mobilController.js
const prisma = require('../config/database');

const getAllMobil = async (req, res) => {
  try {
    const mobil = await prisma.mobil.findMany({
      orderBy: { namaMobil: 'asc' }
    });
    res.status(200).json(mobil);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data mobil" });
  }
};

const createMobil = async (req, res) => {
  try {
    const mobil = await prisma.mobil.create({ data: req.body });
    res.status(201).json(mobil);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMobilById = async (req, res) => {
  try {
    const { id } = req.params;
    const mobil = await prisma.mobil.findUnique({
      where: { id: id }
    });

    if (!mobil) {
      return res.status(404).json({ error: "Mobil tidak ditemukan" });
    }
    res.status(200).json(mobil);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data mobil" });
  }
};

// Jangan lupa tambahkan ke module.exports
module.exports = { getAllMobil, createMobil, getMobilById };