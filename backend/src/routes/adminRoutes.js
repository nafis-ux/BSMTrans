const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { uploadCloudinary } = require('../config/cloudinary');

const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const {
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
} = require('../controllers/adminController');

// Semua rute di bawah ini memerlukan login (verifyToken) + hak admin (verifyAdmin)

// Dashboard statistik
router.get('/dashboard', verifyToken, verifyAdmin, getDashboardStats);

// Semua transaksi dari semua user
router.get('/transaksi', verifyToken, verifyAdmin, getAllTransaksi);

// Update status transaksi (validasi DP, pelunasan, batalkan)
router.put('/transaksi/:id/status', verifyToken, verifyAdmin, updateStatusTransaksi);

// Kelola data mobil
router.post('/mobil/upload', verifyToken, verifyAdmin, uploadCloudinary.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file yang diunggah" });
  res.status(200).json({ message: "Upload sukses", filename: req.file.path });
});
router.put('/mobil/:id/image', verifyToken, verifyAdmin, uploadCloudinary.single('image'), updateMobilImage);
router.post('/mobil', verifyToken, verifyAdmin, createMobil);
router.put('/mobil/:id', verifyToken, verifyAdmin, updateMobil);
router.delete('/mobil/:id', verifyToken, verifyAdmin, deleteMobil);

// Kelola data rute travel
router.post('/travel/upload', verifyToken, verifyAdmin, uploadCloudinary.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file yang diunggah" });
  res.status(200).json({ message: "Upload sukses", filename: req.file.path });
});
router.put('/travel/:id/image', verifyToken, verifyAdmin, uploadCloudinary.single('image'), updateTravelImage);
router.post('/travel', verifyToken, verifyAdmin, createTravel);
router.put('/travel/:id', verifyToken, verifyAdmin, updateTravel);
router.delete('/travel/:id', verifyToken, verifyAdmin, deleteTravel);

// Kelola profil dan pengaturan admin
router.get('/profile', verifyToken, verifyAdmin, getAdminProfile);
router.put('/profile', verifyToken, verifyAdmin, updateAdminProfile);
router.put('/settings', verifyToken, verifyAdmin, updateAdminSettings);

module.exports = router;
