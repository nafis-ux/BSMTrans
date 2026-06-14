// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Serve folder uploads sebagai file statis (untuk akses bukti pembayaran)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const mobilRoutes = require('./src/routes/mobilRoutes');
const transaksiRoutes = require('./src/routes/transaksiRoutes');
const userRoutes = require('./src/routes/userRoutes');
const travelRoutes = require('./src/routes/travelRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const dropOffRoutes = require('./src/routes/dropOffRoutes');

// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/mobil', mobilRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dropoff', dropOffRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend BSMTrans aktif di http://localhost:${PORT}`);
});