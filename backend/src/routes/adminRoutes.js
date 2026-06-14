const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi storage multer untuk upload gambar mobil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'mobil-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getAllTransaksi,
  updateStatusTransaksi,
  updateMobil,
  deleteMobil,
  createMobil,
  getAdminProfile,
  updateAdminProfile,
  updateAdminSettings,
  createTravel,
  updateTravel,
  deleteTravel
} = require('../controllers/adminController');

// Semua rute di bawah ini memerlukan login (verifyToken) + hak admin (verifyAdmin)

// Dashboard statistik
router.get('/dashboard', verifyToken, verifyAdmin, getDashboardStats);

// Semua transaksi dari semua user
router.get('/transaksi', verifyToken, verifyAdmin, getAllTransaksi);

// Update status transaksi (validasi DP, pelunasan, batalkan)
router.put('/transaksi/:id/status', verifyToken, verifyAdmin, updateStatusTransaksi);

// Kelola data mobil
router.post('/mobil/upload', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file yang diunggah" });
  res.status(200).json({ message: "Upload sukses", filename: req.file.filename });
});
router.post('/mobil', verifyToken, verifyAdmin, createMobil);
router.put('/mobil/:id', verifyToken, verifyAdmin, updateMobil);
router.delete('/mobil/:id', verifyToken, verifyAdmin, deleteMobil);

// Kelola data rute travel
router.post('/travel/upload', verifyToken, verifyAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file yang diunggah" });
  res.status(200).json({ message: "Upload sukses", filename: req.file.filename });
});
router.post('/travel', verifyToken, verifyAdmin, createTravel);
router.put('/travel/:id', verifyToken, verifyAdmin, updateTravel);
router.delete('/travel/:id', verifyToken, verifyAdmin, deleteTravel);

// Kelola profil dan pengaturan admin
router.get('/profile', verifyToken, verifyAdmin, getAdminProfile);
router.put('/profile', verifyToken, verifyAdmin, updateAdminProfile);
router.put('/settings', verifyToken, verifyAdmin, updateAdminSettings);

module.exports = router;
