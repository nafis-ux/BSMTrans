const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFormData = multer(); // Multer kosong untuk membaca FormData tanpa file

const { upload: uploadWithFile } = require('../config/cloudinary');

// 1. IMPORT MIDDLEWARE AUTH & CONTROLLER
const { verifyToken } = require('../middleware/authMiddleware'); 
const { 
  createTransaksi, 
  getTransaksiById, 
  getTransaksiByUserId,
  uploadBuktiDP,
  uploadBuktiSisa,
  cancelTransaksi
} = require('../controllers/transaksiController');

// Ambil token dulu -> bongkar FormData -> jalankan fungsi buat transaksi
router.post('/sewa-mobil', verifyToken, uploadFormData.single('fotoKTP'), createTransaksi);

// Rute umum untuk TRAVEL (tanpa upload KTP di awal, berupa JSON)
router.post('/', verifyToken, createTransaksi);

// Rute untuk mengunggah bukti DP
router.post('/:id/bukti-dp', verifyToken, uploadWithFile.single('buktiDP'), uploadBuktiDP);

// Rute untuk mengunggah bukti pelunasan
router.post('/:id/bukti-sisa', verifyToken, uploadWithFile.single('buktiSisa'), uploadBuktiSisa);

// Ambil token dulu -> ambil daftar transaksi milik user tersebut
router.get('/user', verifyToken, getTransaksiByUserId);

// Ambil detail transaksi berdasarkan ID
router.get('/:id', verifyToken, getTransaksiById);

// Batalkan transaksi oleh user
router.put('/:id/cancel', verifyToken, cancelTransaksi);

module.exports = router;