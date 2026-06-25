"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  const pathname = usePathname();

  // Tampilkan Footer hanya di halaman utama (home)
  if (pathname !== '/') {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Kolom 1: Tentang BSMTrans */}
          <div className={styles.column}>
            <div className={styles.brand}>BSMTrans</div>
            <p className={styles.brandDesc}>
              Solusi transportasi premium Anda. Melayani sewa mobil eksklusif dan travel antar kota 
              dengan standar kenyamanan VIP untuk setiap perjalanan.
            </p>
            <div className={styles.socialRow}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">📸</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">👥</a>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="WhatsApp">💬</a>
            </div>
          </div>

          {/* Kolom 2: Layanan */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Layanan Kami</h4>
            <ul className={styles.linkList}>
              <li><Link href="/mobil" className={styles.link}>🚗 Sewa Mobil Premium</Link></li>
              <li><Link href="/travel" className={styles.link}>🚐 Travel Antar Kota</Link></li>
              <li><Link href="/transaksi" className={styles.link}>📋 Cek Status Transaksi</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Link Cepat */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Link Cepat</h4>
            <ul className={styles.linkList}>
              <li><Link href="/" className={styles.link}>Beranda</Link></li>
              <li><Link href="/profil" className={styles.link}>Profil Saya</Link></li>
              <li><Link href="/login" className={styles.link}>Masuk Akun</Link></li>
              <li><Link href="/register" className={styles.link}>Daftar Baru</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Kontak */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Hubungi Kami</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>Jl. Raya BSMTrans No. 123, Indonesia</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <a href="https://wa.me/6281234567890" className={styles.link}>+62 812-3456-7890</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <a href="mailto:info@bsmtrans.com" className={styles.link}>info@bsmtrans.com</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>🕐</span>
                <span>Senin - Minggu, 07:00 - 22:00</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className={styles.divider}></div>
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} <strong>BSMTrans</strong>. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className={styles.tagline}>Premium Transport Solutions — Perjalanan Berkelas, Tanpa Batas.</p>
        </div>
      </div>
    </footer>
  );
}
