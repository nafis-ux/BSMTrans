const prisma = require('../config/database');

// Middleware: Memeriksa apakah user yang login memiliki role ADMIN
// Harus dipasang SETELAH verifyToken agar req.userId sudah tersedia
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan!" });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Akses ditolak! Anda bukan administrator." });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ error: "Gagal memverifikasi hak akses admin." });
  }
};

module.exports = { verifyAdmin };
