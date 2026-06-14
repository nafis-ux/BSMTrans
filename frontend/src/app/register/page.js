"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from '@/styles/Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    namaLengkap: '',
    noHandphone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const GOOGLE_CLIENT_ID = "625752287493-f7acr6o40che5ob7n4opgt2jvt0m6h0c.apps.googleusercontent.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.namaLengkap || !formData.noHandphone || !formData.email || !formData.password) {
      alert("Mohon lengkapi seluruh kolom data registrasi!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Peringatan: Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.namaLengkap,
          whatsapp: formData.noHandphone,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat registrasi.');
      }

      alert("Registrasi Berhasil! Silakan masuk menggunakan akun baru Anda.");
      router.push('/login');

    } catch (error) {
      console.error("Registration Manual Error:", error);
      alert(`Gagal Mendaftar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(`Registrasi & Login Instan Berhasil! Selamat datang, ${data.user.nama}! ✨`);
      router.push('/mobil');
    } catch (error) {
      console.error("Google Register Error:", error);
      alert(`Gagal mendaftar lewat Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={styles.container}>
        <div className={styles.registerCard}>
          
          <div className={styles.header}>
            <div className={styles.logo}>BSMTRANS</div>
            <p className={styles.subtitle}>Daftar akun baru untuk menikmati layanan eksekutif kami</p>
          </div>

          {/* FORM REGISTRASI MANUAL */}
          <form onSubmit={handleRegister}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Lengkap</label>
              <input type="text" name="namaLengkap" className={styles.input} placeholder="Masukkan nama lengkap Anda" value={formData.namaLengkap} onChange={handleInputChange} disabled={loading} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nomor WhatsApp / HP</label>
              <input type="tel" name="noHandphone" className={styles.input} placeholder="Contoh: 081234567890" value={formData.noHandphone} onChange={handleInputChange} disabled={loading} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alamat Email</label>
              <input type="email" name="email" className={styles.input} placeholder="nama@email.com" value={formData.email} onChange={handleInputChange} disabled={loading} />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Kata Sandi</label>
                <input type="password" name="password" className={styles.input} placeholder="••••••••" value={formData.password} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ulangi Sandi</label>
                <input type="password" name="confirmPassword" className={styles.input} placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} disabled={loading} />
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "Memproses..." : "Daftar Akun"}
            </button>
          </form>

          {/* SEPARATOR & TOMBOL GOOGLE PINDAH KE BAWAH SINI */}
          <div style={{ textTransform: 'uppercase', textAlign: 'center', fontSize: '12px', color: '#999', margin: '25px 0 15px 0' }}>
            — Atau daftar instan dengan —
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Registrasi Google Gagal. Silakan coba lagi.')}
              useOneTap
              theme="filled_blue"
              text="signup_with"
              shape="pill"
            />
          </div>

          <div className={styles.footerText}>
            Sudah mempunyai akun? <Link href="/login" className={styles.loginLink}>Masuk Di Sini</Link>
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}