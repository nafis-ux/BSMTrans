const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. FUNGSI REGISTER (DAFTAR AKUN)
const register = async (req, res) => {
  try {
    const { email, password, name, whatsapp } = req.body;

    // 1. Validasi input awal
    if (!email || !password || !name || !whatsapp) {
      return res.status(400).json({ error: "Semua data wajib diisi" });
    }

    // 2. Periksa apakah email sudah terdaftar
    const userExists = await prisma.user.findUnique({
      where: { email: email }
    });

    if (userExists) {
      return res.status(400).json({ error: "Email sudah digunakan oleh akun lain" });
    }

    // 3. Enkripsi password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan user baru ke database (ID dikosongkan karena otomatis UUID)
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        nama: name,       // Sesuai field 'nama' di Prisma Anda
        whatsapp: whatsapp // Sesuai field 'whatsapp' di Prisma Anda
      }
    });

    // Hilangkan password dari respon demi keamanan
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Registrasi akun berhasil!",
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Gagal melakukan registrasi: " + error.message });
  }
};

// 2. FUNGSI LOGIN (MASUK AKUN)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    // Validasi/Kombinasikan password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    // Buat Token JWT
    const secretKey = process.env.JWT_SECRET || "RAHASIA_SUPER_SECRET_KEY_123";
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secretKey,
      { expiresIn: '1d' }
    );

    // Hilangkan password dari respon
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login Berhasil!",
      token: token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Gagal melakukan login: " + error.message });
  }
};


const googleAuth = async (req, res) => {
  try {
    const { token: idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Token Google tidak ditemukan" });
    }

    // Verifikasi Token ke Server Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Cek apakah user dengan email Google ini sudah ada di database
    let user = await prisma.user.findUnique({
      where: { email: email }
    });

    // JIKA BELUM ADA: Otomatis Daftarkan Akun Baru (Instant Register)
    if (!user) {
      // Karena kolom 'password' dan 'whatsapp' wajib di skema Prisma Anda,
      // kita isi dengan password acak aman dan nomor default sementara.
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          email: email,
          nama: name,
          password: hashedPassword,
          whatsapp: "-", // Sementara diisi strip, nanti user bisa update di halaman profil
        }
      });
    }

    // JIKA SUDAH ADA ATAU BARU DIBUAT: Terbitkan Token JWT Aplikasi Anda
    const secretKey = process.env.JWT_SECRET || "RAHASIA_SUPER_SECRET_KEY_123";
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secretKey,
      { expiresIn: '1d' }
    );

    // Hilangkan password dari respon
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Autentikasi Google Berhasil!",
      token: token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Gagal login lewat Google: " + error.message });
  }
};

// PASTIKAN googleAuth DIMASUKKAN KE MODULE EXPORTS DI BAWAH FILE:
module.exports = { register, login, googleAuth };