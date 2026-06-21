const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer(); // Menginisialisasi multer untuk membaca FormData

// Disk storage untuk upload bukti pembayaran
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadDisk = multer({ storage: storage });

// 1. IMPORT MIDDLEWARE AUTH & CONTROLLER
const { verifyToken } = require('../middleware/authMiddleware'); 
const { 
  createTransaksi, 
  getTransaksiById, 
  getTransaksiByUserId,
  uploadBuktiDP,
  uploadBuktiSisa
} = require('../controllers/transaksiController');

// Ambil token dulu -> bongkar FormData -> jalankan fungsi buat transaksi
router.post('/sewa-mobil', verifyToken, upload.single('fotoKTP'), createTransaksi);

// Rute umum untuk TRAVEL (tanpa upload KTP di awal, berupa JSON)
router.post('/', verifyToken, createTransaksi);

// Rute untuk mengunggah bukti DP
router.post('/:id/bukti-dp', verifyToken, uploadDisk.single('buktiDP'), uploadBuktiDP);

// Rute untuk mengunggah bukti pelunasan
router.post('/:id/bukti-sisa', verifyToken, uploadDisk.single('buktiSisa'), uploadBuktiSisa);

// Ambil token dulu -> ambil daftar transaksi milik user tersebut
router.get('/user', verifyToken, getTransaksiByUserId);

// Ambil detail transaksi berdasarkan ID
router.get('/:id', verifyToken, getTransaksiById);

module.exports = router;