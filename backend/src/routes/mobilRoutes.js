const express = require('express');
const router = express.Router();

const { getAllMobil, createMobil, getMobilById } = require('../controllers/mobilController');

// Tambahkan route ini:
router.get('/:id', getMobilById);
router.get('/', getAllMobil);
router.post('/', createMobil);

module.exports = router;