"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Transaksi.module.css';

export default function TransaksiPage() {
  const router = useRouter();
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Ambil data transaksi milik user secara dinamis dari database backend saat halaman dibuka
  useEffect(() => {
    const fetchTransaksiUser = async () => {
      const token = localStorage.getItem('token');
      
      // Pengaman Halaman: Jika token tidak terdeteksi, minta user login
      if (!token) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-store'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal memuat data daftar transaksi.");
        }

        setTransaksiList(data);
      } catch (err) {
        console.error("Error fetching transaksi:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaksiUser();
  }, [router]);

  // Formatter penanggalan lokal (Contoh objek Date -> 15 Okt 2026)
  const formatTanggalIndo = (dateString) => {
    if (!dateString) return '-';
    const opsi = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', opsi);
  };

  // Helper untuk menentukan penulisan nama deskripsi unit atau jenis layanan
  const renderNamaLayanan = (trx) => {
    if (trx.jenisLayanan === 'SEWA_MOBIL' && trx.mobil) {
      return `Sewa ${trx.mobil.namaMobil}`;
    }
    if (trx.jenisLayanan === 'TRAVEL' && trx.ruteTravel) {
      return `Travel ${trx.ruteTravel.asal} ➔ ${trx.ruteTravel.tujuan}`;
    }
    if (trx.jenisLayanan === 'DROP_OFF') {
      const dest = trx.detailManifest?.destinasi || 'Drop Off';
      return `Drop Off ➔ ${dest}`;
    }
    // Fallback jika ada jenis layanan lain seperti TRAVEL atau DROP_OFF
    return trx.jenisLayanan || 'Layanan Transportasi';
  };

  // Helper normalisasi pembacaan string status (uppercase backend ke kelas CSS lowercase)
  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'pending') return styles.statusPending;
    if (normalized === 'dp_dibayar' || normalized === 'dp') return styles.statusDp;
    if (normalized === 'lunas') return styles.statusLunas;
    return styles.statusPending;
  };

  const formatStatusText = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'pending') return 'Pending';
    if (normalized === 'dp_dibayar' || normalized === 'dp') return 'DP Dibayar';
    if (normalized === 'lunas') return 'Lunas';
    return status;
  };

  if (!isAuthenticated || loading) return <p style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>{isAuthenticated ? 'Memuat daftar riwayat transaksi bsmtrans...' : 'Mengalihkan ke halaman login...'}</p>;

  if (error) {
    return (
      <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '100px', backgroundColor: '#16161a', padding: '30px', borderRadius: '12px', maxWidth: '500px', margin: '100px auto' }}>
        <h3>🚨 Gagal Memuat Riwayat</h3>
        <p style={{ fontSize: '14px', color: '#aaa', margin: '10px 0 20px' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ backgroundColor: '#ffc107', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', color: '#000' }}>
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.headerSection}>
        <h1 className={styles.title}>Daftar Transaksi</h1>
        <p className={styles.subtitle}>
          Kelola pembayaran dan riwayat pemesanan layanan Anda.
        </p>
      </section>

      <div className={styles.tableResponsive}>
        {transaksiList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#888' }}>
            <p style={{ fontSize: '16px' }}>Belum ada data transaksi tercatat di akun Anda.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Layanan</th>
                <th>Tanggal</th>
                <th>Total Harga</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.map((trx) => {
                const statusLower = trx.status?.toLowerCase();
                return (
                  <tr key={trx.id}>
                    <td>
                      <div className={styles.serviceTitle}>{renderNamaLayanan(trx)}</div>
                      <div className={styles.bookingId}>Booking ID: #{trx.id}</div>
                    </td>
                    
                    <td>{formatTanggalIndo(trx.tanggalLayanan)}</td>
                    <td className={styles.price}>Rp {trx.totalHarga?.toLocaleString('id-ID')}</td>
                    
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(trx.status)}`}>
                        {formatStatusText(trx.status)}
                      </span>
                    </td>
                    
                    {/* AKSI EDIT DAN ROUTING YANG TERINTEGRASI DENGAN DATABASE ID */}
                    <td>
                      <div className={styles.actions} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                        {statusLower === 'pending' && (
                          <>
                            <span className={styles.iconDoc}>📋</span>
                            <Link href={`/transaksi/${trx.id}`} className="btn-primary">
                              Bayar DP
                            </Link>
                          </>
                        )}
                        
                        {(statusLower === 'dp_dibayar' || statusLower === 'dp') && (
                          <>
                            <span className={styles.iconDoc}>📋</span>
                            <Link href={`/transaksi/${trx.id}/bayar-sisa`} className="btn-primary" style={{ backgroundColor: '#222', border: '1px solid #dfb143', color: '#dfb143' }}>
                              Bayar Sisa
                            </Link>
                          </>
                        )}
                        
                        {statusLower === 'lunas' && (
                          <>
                            <span className={styles.iconDoc}>📄</span>
                            <Link href={`/transaksi/${trx.id}/invoice`} style={{ color: '#dfb143', textDecoration: 'none', fontWeight: '500' }}>
                              Invoice
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}