"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminDropOffPage() {
  const [dropOffList, setDropOffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch('http://localhost:5000/api/admin/transaksi', { headers })
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) {
          // Hanya ambil transaksi yang jenis layanannya DROP_OFF
          const dropOffs = data.filter(t => t.jenisLayanan === 'DROP_OFF');
          setDropOffList(dropOffs);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (trxId, newStatus) => {
    if (!confirm(`Ubah status drop-off ${trxId} menjadi ${newStatus}?`)) return;

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
      setDropOffList(prev => prev.map(t => t.id === trxId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadgeClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'LUNAS') return styles.badgeAvailable;
    if (s === 'DP_DIBAYAR') return styles.badgePaid;
    if (s === 'BATAL') return styles.badgeBatal;
    if (s === 'VERIFIKASI_DP' || s === 'VERIFIKASI_SISA') return styles.badgePaid;
    return styles.badgeRented;
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat data pesanan drop-off...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Manajemen Drop Off</h1>
        <p className={styles.subtitle}>Pantau dan kelola permintaan antar-jemput bandara privat.</p>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ fontSize: '16px' }}>Daftar Permintaan Drop Off ({dropOffList.length})</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tujuan Destinasi</th>
                <th>Nama Penumpang</th>
                <th>Jadwal Penjemputan</th>
                <th>Titik Jemput & Catatan</th>
                <th>Status</th>
                <th>Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {dropOffList.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Belum ada permintaan drop off.</td></tr>
              ) : (
                dropOffList.map((drop) => (
                  <tr key={drop.id}>
                    <td style={{ color: 'var(--accent-color, #dfb143)', fontFamily: 'monospace', fontSize: '13px' }}>{drop.id}</td>
                    <td style={{ fontWeight: '600' }}>
                      {drop.detailManifest?.destinasi || 'Bandara'}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{drop.detailManifest?.namaLengkap || drop.user?.nama}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{drop.detailManifest?.nomorWhatsapp}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{formatTanggal(drop.tanggalLayanan)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-color, #dfb143)', fontWeight: 'bold' }}>{drop.detailManifest?.jamJemput} WIB</div>
                    </td>
                    <td>
                      <div style={{ color: '#c1c5ce', fontSize: '12px', maxWidth: '250px' }}>
                        📍 {drop.alamatJemput}
                      </div>
                      {drop.detailManifest?.catatan && (
                        <div style={{ fontSize: '11px', color: '#8a8f98', marginTop: '4px', fontStyle: 'italic' }}>
                          Note: "{drop.detailManifest.catatan}"
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(drop.status)}`}>
                        {drop.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      {drop.status === 'PENDING' ? (
                        <>
                          <button className={styles.actionEdit} onClick={() => handleUpdateStatus(drop.id, 'LUNAS')} style={{ color: '#2ecc71', border: '1px solid #2ecc71', padding: '4px 8px', borderRadius: '4px' }}>✓ Selesai</button>
                          <button className={styles.actionDelete} onClick={() => handleUpdateStatus(drop.id, 'BATAL')} style={{ border: '1px solid #e74c3c', padding: '4px 8px', borderRadius: '4px' }}>✕ Batal</button>
                        </>
                      ) : (
                        <span style={{ color: '#444', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
