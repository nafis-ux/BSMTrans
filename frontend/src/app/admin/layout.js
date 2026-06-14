"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInitial, setUserInitial] = useState('A');
  const [accentColor, setAccentColor] = useState('var(--accent-color, #dfb143)'); // Default Gold

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Proteksi: Cek token & role saat mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'ADMIN') {
        alert("Akses ditolak! Halaman ini khusus administrator.");
        router.push('/');
        return;
      }
      setUserName(user.nama || 'Admin');
      setUserEmail(user.email || 'admin@bsmtrans.com');
      setUserInitial((user.nama || 'A').charAt(0).toUpperCase());
      setIsAuthorized(true);

      // Ambil profil dari server (untuk mendapatkan uiPreferences terupdate)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.uiPreferences && data.uiPreferences.accentColor) {
          setAccentColor(data.uiPreferences.accentColor);
        }
      })
      .catch(err => console.error(err));

    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    if (!confirm("Yakin ingin keluar dari panel admin?")) return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Menu navigasi sidebar
  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin' },
    { label: 'Data Mobil', icon: '🚘', path: '/admin/mobil' },
    { label: 'Data Travel', icon: '🚌', path: '/admin/travel' },
    { label: 'Layanan Drop Off', icon: '🛣️', path: '/admin/layanan-dropoff' },
    { label: 'Trx. Drop Off', icon: '📍', path: '/admin/dropoff' },
    { label: 'Transaksi', icon: '📋', path: '/admin/transaksi' },
    { label: 'Pembayaran', icon: '💳', path: '/admin/pembayaran' },
  ];

  // Tentukan item aktif
  const isActive = (path) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  // Judul halaman berdasarkan route
  const getPageTitle = () => {
    const active = navItems.find(item => isActive(item.path));
    return active ? `Admin Console — ${active.label}` : 'Admin Console';
  };

  if (!isAuthorized) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        Memverifikasi akses administrator...
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper} style={{ '--accent-color': accentColor }}>
      {/* ====== MOBILE OVERLAY ====== */}
      {isMobileMenuOpen && (
        <div 
          className={`${styles.mobileOverlay} ${styles.show}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ====== SIDEBAR ====== */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <h1 className={styles.brandLogo} style={{ color: 'var(--accent-color, #dfb143)' }}>BSMTrans</h1>
          <p className={styles.brandSub}>Elite Logistics</p>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                style={active ? { 
                  color: 'var(--accent-color, #dfb143)', 
                  borderLeftColor: 'var(--accent-color, #dfb143)'
                } : {}}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.footerItem} onClick={handleLogout}>
            <span className={styles.navIcon}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ====== MAIN AREA ====== */}
      <div className={styles.mainArea}>
        {/* Top Navbar */}
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className={styles.hamburgerBtn}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </button>
            <span className={styles.topbarTitle} style={{ color: 'var(--accent-color, #dfb143)' }}>{getPageTitle()}</span>
          </div>

          <div className={styles.topbarRight}>
            {/* Search */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Cari transaksi, pelanggan..."
                className={styles.searchInput}
              />
            </div>

            {/* Icons */}
            <div style={{ position: 'relative' }}>
              <button 
                className={styles.topbarIconBtn} 
                title="Notifikasi"
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
              >
                🔔
              </button>
              {showNotifMenu && (
                <div className={styles.dropdownMenu} style={{ right: '-50px', width: '250px' }}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownTitle}>Notifikasi</p>
                    <p className={styles.dropdownSubtitle}>Pemberitahuan terbaru</p>
                  </div>
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                    Belum ada notifikasi baru.
                  </div>
                </div>
              )}
            </div>

            <button 
              className={styles.topbarIconBtn} 
              title="Pengaturan"
              onClick={() => router.push('/admin/pengaturan')}
            >
              ⚙️
            </button>

            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div 
                className={styles.userAvatar} 
                title={userName}
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
                style={{ 
                  background: `linear-gradient(135deg, var(--accent-color, #dfb143), #555)`,
                  borderColor: 'var(--accent-color, #dfb143)' 
                }}
              >
                {userInitial}
              </div>
              
              {showProfileMenu && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownTitle}>{userName}</p>
                    <p className={styles.dropdownSubtitle}>{userEmail}</p>
                  </div>
                  <Link href="/admin/profil" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                    <span>👤</span> Profil Akun
                  </Link>
                  <Link href="/admin/pengaturan" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                    <span>⚙️</span> Pengaturan
                  </Link>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }}></div>
                  <button className={styles.dropdownItem} onClick={handleLogout} style={{ color: '#e74c3c' }}>
                    <span>🚪</span> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
