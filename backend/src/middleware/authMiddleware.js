const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token biasanya dikirim dengan format: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Akses ditolak, token tidak ditemukan!" });
  }

  try {
    const secretKey = process.env.JWT_SECRET || "RAHASIA_SUPER_SECRET_KEY_123";
    const decoded = jwt.verify(token, secretKey);
    
    // Simpan data id user dari token ke dalam request objek
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid atau sudah kadaluwarsa!" });
  }
};

module.exports = { verifyToken };