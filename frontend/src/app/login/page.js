"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from '@/styles/Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const GOOGLE_CLIENT_ID = "625752287493-f7acr6o40che5ob7n4opgt2jvt0m6h0c.apps.googleusercontent.com";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return alert("Mohon isi semua kolom!");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`Selamat datang kembali, ${data.user.nama}! 👋`);
      
      // Redirect berdasarkan role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/mobil');
      }
    } catch (error) {
      alert(`Gagal Masuk: ${error.message}`);
    } finally { setLoading(false); }
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

      alert(`Login Instan Sukses! Selamat datang, ${data.user.nama}! ✨`);
      
      // Redirect berdasarkan role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/mobil');
      }
    } catch (error) {
      console.error(error);
      alert(`Gagal login Google: ${error.message}`);
    } finally { setLoading(false); }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <div className={styles.logo}>BSMTRANS</div>
            <p className={styles.subtitle}>Masuk ke akun Anda untuk melanjutkan pemesanan</p>
          </div>

          {/* FORM LOGIN MANUAL */}
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Alamat Email</label>
              <input type="email" name="email" className={styles.input} placeholder="nama@email.com" value={formData.email} onChange={handleInputChange} disabled={loading} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Kata Sandi</label>
              <input type="password" name="password" className={styles.input} placeholder="••••••••" value={formData.password} onChange={handleInputChange} disabled={loading} />
            </div>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "Memverifikasi..." : "Masuk Aplikasi"}
            </button>
          </form>

          {/* SEPARATOR & TOMBOL GOOGLE DI BAWAH FORM */}
          <div style={{ textTransform: 'uppercase', textAlign: 'center', fontSize: '12px', color: '#999', margin: '25px 0 15px 0' }}>
            — Atau masuk instan dengan —
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Login Google Gagal. Silakan coba lagi.')}
              useOneTap
              theme="filled_blue"
              shape="pill"
            />
          </div>

          <div className={styles.footerText}>
            Belum memiliki akun resmi? <Link href="/register" className={styles.registerLink}>Daftar Sekarang</Link>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}