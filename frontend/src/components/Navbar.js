"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import Toast from './Toast';
import useToast from '@/utils/useToast';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);
  const { toasts, showToast, removeToast } = useToast();

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Sewa Mobil', path: '/mobil' },
    { name: 'Travel', path: '/travel' },
    { name: 'Transaksi', path: '/transaksi' },
  ];

  // Halaman yang memerlukan login
  const protectedPaths = ['/mobil', '/travel', '/transaksi', '/profil'];

  // Load user dari localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    loadUser();

    // Listen untuk storage changes (dari tab lain)
    window.addEventListener('storage', loadUser);

    // Listen untuk custom authChange event (dari tab yang sama)
    window.addEventListener('authChange', loadUser);

    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('authChange', loadUser);
    };
  }, []);

  // Close notification dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications saat dropdown dibuka
  const handleNotifClick = async () => {
    if (!user) {
      showToast('Silakan login untuk melihat notifikasi.', 'warning');
      return;
    }

    setShowNotif(prev => !prev);

    if (!showNotif) {
      setNotifLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          // Ambil transaksi yang butuh perhatian (bukan LUNAS/BATAL)
          const activeNotifs = data
            .filter(t => !['LUNAS', 'BATAL'].includes(t.status))
            .slice(0, 5)
            .map(t => ({
              id: t.id,
              jenisLayanan: t.jenisLayanan,
              status: t.status,
              totalHarga: t.totalHarga,
              label: t.jenisLayanan === 'TRAVEL'
                ? `Travel ${t.ruteTravel ? `${t.ruteTravel.asal} → ${t.ruteTravel.tujuan}` : ''}`
                : `Sewa ${t.mobil?.namaMobil || 'Mobil'}`,
              statusLabel: getStatusLabel(t.status),
              statusColor: getStatusColor(t.status),
            }));
          setNotifications(activeNotifs);
        }
      } catch (err) {
        console.error('Gagal load notifikasi:', err);
      } finally {
        setNotifLoading(false);
      }
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      PENDING: '🟡 Menunggu Pembayaran',
      VERIFIKASI_DP: '🔵 DP Sedang Diverifikasi',
      DP_DIBAYAR: '🟠 Lanjutkan Pelunasan',
      VERIFIKASI_SISA: '🔵 Pelunasan Diverifikasi',
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      PENDING: '#ffc107',
      VERIFIKASI_DP: '#4da6ff',
      DP_DIBAYAR: '#ff9800',
      VERIFIKASI_SISA: '#4da6ff',
    };
    return map[status] || '#8a8f98';
  };

  const notifCount = notifications.length;

  const handleNavClick = (e, path) => {
    setIsMenuOpen(false);
    const needsAuth = protectedPaths.some(p => path.startsWith(p));
    if (needsAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        e.preventDefault();
        showToast('Silakan login atau daftar terlebih dahulu untuk mengakses layanan.', 'warning');
        router.push('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
    setShowNotif(false);
    setIsMenuOpen(false);
    showToast('Anda telah berhasil keluar akun.', 'success');
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  };

  // Sembunyikan Navbar publik di halaman admin
  if (pathname.startsWith('/admin')) {
    return <Toast toasts={toasts} removeToast={removeToast} />;
  }

  const initialLetter = user?.nama ? user.nama.charAt(0).toUpperCase() : '?';

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
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
              {/* AUTH GROUP: Login/Register ATAU User Info */}
              {user ? (
                <div className={styles.userGroup}>
                  <Link href="/profil" className={styles.userInfo} onClick={() => setIsMenuOpen(false)}>
                    <span className={styles.userAvatar}>{initialLetter}</span>
                    <span className={styles.userName}>{user.nama}</span>
                  </Link>
                  <button className={styles.btnLogout} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
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
              )}
              
              {/* Ikon Notifikasi */}
              <div className={styles.notifWrapper} ref={notifRef}>
                <button className={styles.iconBtn} onClick={handleNotifClick} aria-label="Notifikasi">
                  🔔
                  {user && notifCount > 0 && (
                    <span className={styles.notifBadge}>{notifCount}</span>
                  )}
                </button>

                {/* Dropdown Notifikasi */}
                {showNotif && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                      <span className={styles.notifTitle}>Notifikasi</span>
                      {notifCount > 0 && <span className={styles.notifCount}>{notifCount} aktif</span>}
                    </div>

                    <div className={styles.notifList}>
                      {notifLoading ? (
                        <div className={styles.notifEmpty}>Memuat...</div>
                      ) : !user ? (
                        <div className={styles.notifEmpty}>Login untuk melihat notifikasi</div>
                      ) : notifications.length === 0 ? (
                        <div className={styles.notifEmpty}>
                          <span style={{ fontSize: '24px' }}>✨</span>
                          <span>Semua transaksi sudah beres!</span>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <Link
                            key={n.id}
                            href={`/transaksi/${n.id}`}
                            className={styles.notifItem}
                            onClick={() => { setShowNotif(false); setIsMenuOpen(false); }}
                          >
                            <div className={styles.notifItemIcon}>
                              {n.jenisLayanan === 'TRAVEL' ? '🚐' : '🚗'}
                            </div>
                            <div className={styles.notifItemContent}>
                              <span className={styles.notifItemLabel}>{n.label}</span>
                              <span className={styles.notifItemStatus} style={{ color: n.statusColor }}>
                                {n.statusLabel}
                              </span>
                            </div>
                            <span className={styles.notifArrow}>›</span>
                          </Link>
                        ))
                      )}
                    </div>

                    {user && notifications.length > 0 && (
                      <Link href="/transaksi" className={styles.notifFooter} onClick={() => { setShowNotif(false); setIsMenuOpen(false); }}>
                        Lihat Semua Transaksi →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Ikon Profil */}
              {user && (
                <Link 
                  href="/profil" 
                  onClick={(e) => handleNavClick(e, '/profil')}
                  className={`${styles.iconBtn} ${pathname === '/profil' ? styles.activeProfile : ''}`}
                  title="Profil Saya"
                >
                  👤
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}