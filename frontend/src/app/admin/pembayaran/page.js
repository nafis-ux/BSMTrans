"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminPembayaranPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch('http://localhost:5000/api/admin/transaksi', { headers })
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) {
          // Hanya ambil transaksi yang butuh verifikasi pembayaran
          const verifikasi = data.filter(t => t.status === 'VERIFIKASI_DP' || t.status === 'VERIFIKASI_SISA');
          setTransaksiList(verifikasi);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (trxId, newStatus) => {
    const isApproval = newStatus === 'DP_DIBAYAR' || newStatus === 'LUNAS';
    const actionText = isApproval ? "setujui" : "tolak";
    if (!confirm(`Anda yakin ingin mem${actionText} pembayaran untuk transaksi ${trxId}?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/transaksi/${trxId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      // Remove from list since it's no longer needing verification
      setTransaksiList(prev => prev.filter(t => t.id !== trxId));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  const getBuktiImage = (trx) => {
    if (!trx.dokumenValidasi) return null;
    
    if (trx.status === 'VERIFIKASI_DP' && trx.dokumenValidasi.buktiResiDP) {
      return `http://localhost:5000/uploads/${trx.dokumenValidasi.buktiResiDP}`;
    }
    
    if (trx.status === 'VERIFIKASI_SISA' && trx.dokumenValidasi.buktiResiSisa) {
      return `http://localhost:5000/uploads/${trx.dokumenValidasi.buktiResiSisa}`;
    }
    
    return null;
  };

  const getAksiComponent = (trx) => {
    if (trx.status === 'VERIFIKASI_DP') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleUpdateStatus(trx.id, 'PENDING')}
            style={{ ...btnStyle, backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid #e74c3c' }}
          >
            Tolak
          </button>
          <button 
            onClick={() => handleUpdateStatus(trx.id, 'DP_DIBAYAR')}
            style={{ ...btnStyle, backgroundColor: 'var(--accent-color, #dfb143)', color: '#000', fontWeight: 'bold' }}
          >
            Verifikasi DP
          </button>
        </div>
      );
    }

    if (trx.status === 'VERIFIKASI_SISA') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleUpdateStatus(trx.id, 'DP_DIBAYAR')}
            style={{ ...btnStyle, backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid #e74c3c' }}
          >
            Tolak
          </button>
          <button 
            onClick={() => handleUpdateStatus(trx.id, 'LUNAS')}
            style={{ ...btnStyle, backgroundColor: 'var(--accent-color, #dfb143)', color: '#000', fontWeight: 'bold' }}
          >
            Lunaskan
          </button>
        </div>
      );
    }

    return null;
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat data verifikasi pembayaran...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Verifikasi Pembayaran</h1>
        <p className={styles.subtitle}>Tinjau dan validasi bukti transfer pelanggan.</p>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ fontSize: '16px' }}>Menunggu Verifikasi ({transaksiList.length})</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Nama User</th>
                <th>Total Bayar (Sisa)</th>
                <th>Bukti Pembayaran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Tidak ada pembayaran yang menunggu verifikasi saat ini.</td></tr>
              ) : (
                transaksiList.map((trx) => {
                  const buktiImg = getBuktiImage(trx);
                  
                  return (
                    <tr key={trx.id}>
                      <td style={{ color: 'var(--accent-color, #dfb143)', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold' }}>{trx.id}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{trx.user?.nama || '-'}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{trx.user?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--accent-color, #dfb143)' }}>
                          {trx.status === 'VERIFIKASI_DP' ? formatRupiah(Math.floor(trx.totalHarga * 0.5)) : formatRupiah(trx.sisaTagihan)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8a8f98' }}>Total: {formatRupiah(trx.totalHarga)}</div>
                      </td>
                      <td>
                        {buktiImg ? (
                          <a href={buktiImg} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={buktiImg} 
                              alt="Bukti Transfer" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} 
                            />
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#666' }}>Tidak ada file</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgePaid}`}>
                          {trx.status === 'VERIFIKASI_DP' ? 'Cek DP' : 'Cek Lunas'}
                        </span>
                      </td>
                      <td className={styles.actionCell}>
                        {getAksiComponent(trx)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '6px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.2s ease'
};
