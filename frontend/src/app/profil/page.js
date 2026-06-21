"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/Profil.module.css';

export default function ProfilPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('akun');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State profil dinamis hasil sinkronisasi database MySQL
  const [profileData, setProfileData] = useState({
    namaLengkap: '',
    noHandphone: '',
    email: '',
    role: 'MEMBER',
    totalTrip: 0
  });

  // State riwayat perjalanan asli dari database
  const [trips, setTrips] = useState([]);

  // FUNGSI FORMAT TANGGAL AMAN (Mencegah error toLocaleDateString)
const formatTanggalAman = (tanggal) => {
    if (!tanggal) return "Tgl belum diatur";
    const d = new Date(tanggal);
    // Jika tanggal tidak valid, kembalikan string apa adanya daripada crash
    if (isNaN(d.getTime())) return String(tanggal); 
    
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // LOAD DATA KETIKA HALAMAN PERTAMA KALI DIBUKA
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      // Proteksi Halaman: Jika token kosong, langsung kembalikan ke login
      if (!token) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal memuat profil');
        }

        // Sinkronisasi state dari respons API backend
        setProfileData(data.user);
        setTrips(Array.isArray(data.trips) ? data.trips : []);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // UPDATE DATA KE DATABASE
  const handleSaveProfil = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          namaLengkap: profileData.namaLengkap,
          noHandphone: profileData.noHandphone
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(data.message || "Profil berhasil diperbarui di database! 💾");
    } catch (error) {
      alert(`Gagal menyimpan: ${error.message}`);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert("Anda telah berhasil keluar akun.");
    router.push('/login');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    alert("Fitur ganti kata sandi siap dihubungkan!");
  };

  if (!isAuthenticated || loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>{isAuthenticated ? 'Memuat data profil bsmtrans...' : 'Mengalihkan ke halaman login...'}</div>;
  }

  const initialLetter = profileData.namaLengkap ? profileData.namaLengkap.charAt(0).toUpperCase() : "U";

  return (
    <div className={styles.container}>
      <div className={styles.profileGrid}>
        
        {/* SIDEBAR KIRI */}
        <div className={styles.sidebar}>
          <div className={styles.avatarCard}>
            <div className={styles.avatarCircle}>{initialLetter}</div>
            <h2 className={styles.userName}>{profileData.namaLengkap}</h2>
            <p className={styles.userEmail}>{profileData.email}</p>
            <div className={styles.badgeMember}>⭐ {profileData.role}</div>
          </div>

          <div className={styles.tabMenu}>
            <button className={`${styles.tabBtn} ${activeTab === 'akun' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('akun')}>
              👤 Informasi Akun
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'riwayat' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('riwayat')}>
              🚌 Riwayat Perjalanan
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'keamanan' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('keamanan')}>
              🔒 Keamanan & Sandi
            </button>
            <hr className={styles.menuDivider} />
            <button className={styles.btnLogout} onClick={handleLogout}>
              🚪 Keluar Akun
            </button>
          </div>
        </div>

        {/* KONTEN UTAMA KANAN */}
        <div className={styles.contentArea}>
          
          {/* TAB 1: INFORMASI AKUN */}
          {activeTab === 'akun' && (
            <div className={styles.cardForm}>
              <h1 className={styles.sectionTitle}>Pengaturan Akun</h1>
              <p className={styles.sectionSubtitle}>Kelola informasi profil dasar dan verifikasi identitas perjalanan Anda.</p>
              
              <form onSubmit={handleSaveProfil}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Lengkap</label>
                  <input type="text" name="namaLengkap" className={styles.input} value={profileData.namaLengkap} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nomor WhatsApp (Untuk Notifikasi Tiket)</label>
                  <input type="tel" name="noHandphone" className={styles.input} value={profileData.noHandphone} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Alamat Email (Akun Utama)</label>
                  <input type="email" className={styles.input} value={profileData.email} disabled />
                </div>
                <div className={styles.statsBox}>
                  <span className={styles.statsLabel}>Loyalitas Pengguna:</span>
                  <strong className={styles.statsValue}>🔥 {profileData.totalTrip} Perjalanan Terlaksana</strong>
                </div>
                <button type="submit" className={styles.btnAction}>Simpan Perubahan</button>
              </form>
            </div>
          )}

          {/* TAB 2: RIWAYAT PERJALANAN DARI DATABASE */}
          {activeTab === 'riwayat' && (
            <div className={styles.cardForm}>
              <h1 className={styles.sectionTitle}>Riwayat Perjalanan</h1>
              <p className={styles.sectionSubtitle}>Pantau tiket aktif, manifes kendaraan, serta log logistik pemesanan lama Anda.</p>
              
              {trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#aaa' }}>
                  <p style={{ fontSize: '16px' }}>🚌 Anda belum memiliki riwayat perjalanan atau transaksi.</p>
                  <Link href="/mobil" style={{ color: '#ffc107', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                    Pesan Tiket / Sewa Mobil Sekarang →
                  </Link>
                </div>
              ) : (
                <div className={styles.tripList}>
                  {trips.map((trip) => (
                    <div key={trip.id} className={styles.tripCard}>
                      <div className={styles.tripHeader}>
                        <div>
                          <span className={styles.tripBadgeType}>{trip.type}</span>
                          <span className={styles.tripId}>#{trip.id}</span>
                        </div>
                        <span className={`${styles.statusLabelBadge} ${
                          trip.status === 'Aktif' ? styles.badgeStatusActive : 
                          trip.status === 'Menunggu' ? styles.badgeStatusPending : styles.badgeStatusDone
                        }`}>
                          {trip.status === 'Aktif' ? '🟢 Perjalanan Aktif' : 
                           trip.status === 'Menunggu' ? '🟡 Belum Bayar' : '✓ Selesai'}
                        </span>
                      </div>
                      <h3 className={styles.tripRoute}>{trip.route || "Layanan Tidak Dikenal"}</h3>
                      <div className={styles.tripMetaGrid}>
                        <div><span className={styles.metaLabel}>Jadwal</span><span className={styles.metaValue}>{formatTanggalAman(trip.tanggalLayanan)}</span></div>
                        <div><span className={styles.metaLabel}>Alokasi</span><span className={styles.metaValue}>{trip.seat}</span></div>
                        <div><span className={styles.metaLabel}>Total Tarif</span><span className={styles.metaValue}>{trip.price}</span></div>
                      </div>
                      <div className={styles.tripActionRow}>
                        {trip.status === 'Menunggu' ? (
                          <Link href={`/transaksi/${trip.id}`} className={styles.btnTripPay}>Bayar Sekarang →</Link>
                        ) : trip.status === 'Aktif' ? (
                          <button className={styles.btnTripInfo} onClick={() => alert(`Tiket digital dikirim ke WhatsApp ${profileData.noHandphone}`)}>Kirim E-Tiket ke WA</button>
                        ) : (
                          <button className={styles.btnTripRepeat} onClick={() => alert("Mengarahkan kembali ke rute pemesanan...")}>Pesan Lagi</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KEAMANAN & SANDI */}
          {activeTab === 'keamanan' && (
            <div className={styles.cardForm}>
              <h1 className={styles.sectionTitle}>Keamanan Akun</h1>
              <p className={styles.sectionSubtitle}>Perbarui kata sandi berkala untuk mengamankan data transaksi dan akun bsmtrans.</p>
              <form onSubmit={handleSavePassword}>
                <div className={styles.formGroup}><label className={styles.label}>Kata Sandi Lama</label><input type="password" className={styles.input} placeholder="••••••••" required /></div>
                <div className={styles.formGroup}><label className={styles.label}>Kata Sandi Baru</label><input type="password" className={styles.input} placeholder="Masukkan sandi baru" required /></div>
                <div className={styles.formGroup}><label className={styles.label}>Konfirmasi Kata Sandi Baru</label><input type="password" className={styles.input} placeholder="Ulangi sandi baru" required /></div>
                <button type="submit" className={styles.btnAction}>Perbarui Kata Sandi</button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}