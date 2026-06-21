"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Sewa Mobil', path: '/mobil' },
    { name: 'Travel', path: '/travel' },

    { name: 'Transaksi', path: '/transaksi' },
  ];

  // Halaman yang memerlukan login
  const protectedPaths = ['/mobil', '/travel', '/transaksi', '/profil'];

  const handleNavClick = (e, path) => {
    setIsMenuOpen(false); // Close menu on click
    // Cek apakah path ini butuh login
    const needsAuth = protectedPaths.some(p => path.startsWith(p));
    if (needsAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        e.preventDefault(); // Cegah navigasi Link
        alert('Silakan login atau daftar terlebih dahulu untuk mengakses layanan.');
        router.push('/login');
      }
    }
  };

  // Sembunyikan Navbar publik di halaman admin
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>BSMTrans</div>

        {/* Hamburger Menu Icon */}
        <button className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✖' : '☰'}
        </button>

        <div className={`${styles.menuWrapper} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <nav className={styles.nav}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            {/* GRUP UTENTIKASI ESTETIK */}
            <div className={styles.authGroup}>
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className={`${styles.btnLoginOutline} ${pathname === '/login' ? styles.activeAuth : ''}`}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMenuOpen(false)}
                className={`${styles.btnRegisterSolid} ${pathname === '/register' ? styles.activeAuthSolid : ''}`}
              >
                Register
              </Link>
            </div>
            
            {/* Ikon Notifikasi */}
            <button className={styles.iconBtn}>🔔</button>

            {/* Ikon Profil */}
            <Link 
              href="/profil" 
              onClick={(e) => handleNavClick(e, '/profil')}
              className={`${styles.iconBtn} ${pathname === '/profil' ? styles.activeProfile : ''}`}
              title="Profil Saya"
            >
              👤
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}