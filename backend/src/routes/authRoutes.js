const express = require('express');
const router = express.Router();
const { register, login, googleAuth } = require('../controllers/authController');

// Jalur /api/auth/register
router.post('/register', register);
router.post('/google', googleAuth);

// Jalur /api/auth/login
router.post('/login', login);

module.exports = router;