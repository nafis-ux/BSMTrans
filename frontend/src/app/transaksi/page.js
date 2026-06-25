"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Transaksi.module.css';
import Toast from '@/components/Toast';
import useToast from '@/utils/useToast';

export default function TransaksiPage() {
  const router = useRouter();
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

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
    // Fallback jika ada jenis layanan lain
    return trx.jenisLayanan || 'Layanan Transportasi';
  };

  // Helper normalisasi pembacaan string status (uppercase backend ke kelas CSS lowercase)
  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'pending') return styles.statusPending;
    if (normalized === 'dp_dibayar' || normalized === 'dp') return styles.statusDp;
    if (normalized === 'lunas') return styles.statusLunas;
    if (normalized === 'batal') return styles.statusBatal;
    if (normalized === 'verifikasi_dp' || normalized === 'verifikasi_sisa') return styles.statusVerifikasi;
    return styles.statusPending;
  };

  const formatStatusText = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'pending') return 'Pending';
    if (normalized === 'verifikasi_dp') return 'Verifikasi DP';
    if (normalized === 'dp_dibayar' || normalized === 'dp') return 'DP Dibayar';
    if (normalized === 'verifikasi_sisa') return 'Verifikasi Sisa';
    if (normalized === 'lunas') return 'Lunas';
    if (normalized === 'batal') return 'Dibatalkan';
    return status;
  };

  // Fungsi untuk buka WhatsApp admin
  const handleWhatsApp = (trx) => {
    const phone = '6281234567890'; // Nomor WhatsApp admin BSMTrans
    const layanan = renderNamaLayanan(trx);
    const message = encodeURIComponent(
      `Halo Admin BSMTrans 👋\n\nSaya ingin menanyakan transaksi saya:\n📋 ID: #${trx.id}\n🚗 Layanan: ${layanan}\n💰 Total: Rp ${trx.totalHarga?.toLocaleString('id-ID')}\n📌 Status: ${formatStatusText(trx.status)}\n\nMohon informasinya, terima kasih! 🙏`
    );
    window.open(`https://wa.me/083167785934?text=${message}`, '_blank');
  };

  // Fungsi pembatalan transaksi
  const handleCancelTransaksi = async (trxId) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin membatalkan transaksi ini? Tindakan ini tidak dapat dibatalkan.");
    if (!confirmed) return;

    setCancellingId(trxId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/${trxId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      showToast(data.message || "Transaksi berhasil dibatalkan.", "success");

      // Update list transaksi secara lokal tanpa reload
      setTransaksiList(prev =>
        prev.map(t => t.id === trxId ? { ...t, status: 'BATAL' } : t)
      );
    } catch (err) {
      showToast(`Gagal membatalkan: ${err.message}`, "error");
    } finally {
      setCancellingId(null);
    }
  };

  // Cek apakah transaksi bisa dibatalkan
  const isCancellable = (status) => {
    const cancellable = ['pending', 'verifikasi_dp', 'dp_dibayar'];
    return cancellable.includes(status?.toLowerCase());
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
      <Toast toasts={toasts} removeToast={removeToast} />
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

                    {/* AKSI: WhatsApp | Tombol Pembayaran | Batalkan */}
                    <td>
                      <div className={styles.actions}>
                        {/* Tombol WhatsApp — selalu muncul kecuali BATAL */}
                        {statusLower !== 'batal' && (
                          <button
                            className={styles.btnWhatsApp}
                            onClick={() => handleWhatsApp(trx)}
                            title="Hubungi Admin via WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </button>
                        )}

                        {/* Tombol Batalkan — muncul untuk transaksi yang bisa dibatalkan */}
                        {isCancellable(trx.status) && (
                          <button
                            className={styles.btnCancel}
                            onClick={() => handleCancelTransaksi(trx.id)}
                            disabled={cancellingId === trx.id}
                          >
                            {cancellingId === trx.id ? '...' : 'Batalkan'}
                          </button>
                        )}

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

                        {statusLower === 'batal' && (
                          <span className={styles.cancelledText}>Dibatalkan</span>
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