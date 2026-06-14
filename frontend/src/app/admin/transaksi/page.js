"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminTransaksiPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/transaksi`, { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTransaksiList(data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (trxId, newStatus) => {
    if (!confirm(`Batalkan transaksi ${trxId}?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/transaksi/${trxId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setTransaksiList(prev => prev.map(t => t.id === trxId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;
  
  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadgeClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'LUNAS') return styles.badgeAvailable;
    if (s === 'DP_DIBAYAR') return styles.badgePaid;
    if (s === 'BATAL') return styles.badgeBatal;
    if (s === 'VERIFIKASI_DP' || s === 'VERIFIKASI_SISA') return styles.badgePaid; // Using blue for verification
    return styles.badgeRented;
  };

  const getLayananLabel = (trx) => {
    if (trx.jenisLayanan === 'SEWA_MOBIL' && trx.mobil) return `Sewa ${trx.mobil.namaMobil}`;
    if (trx.jenisLayanan === 'TRAVEL' && trx.ruteTravel) return `Travel ${trx.ruteTravel.asal} - ${trx.ruteTravel.tujuan}`;
    if (trx.jenisLayanan === 'DROP_OFF') return `Drop Off Bandara`;
    return trx.jenisLayanan || '-';
  };

  const filteredData = transaksiList.filter(trx => {
    if (filter === 'ALL') return true;
    if (filter === 'VERIFIKASI') return trx.status === 'VERIFIKASI_DP' || trx.status === 'VERIFIKASI_SISA';
    return trx.status === filter;
  });

  if (loading) return <p style={{ color: '#fff' }}>Memuat data transaksi...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className={styles.title} style={{ fontSize: '24px' }}>Manajemen Transaksi</h1>
          <p className={styles.subtitle}>Overview and manage all logistics and passenger transactions.</p>
        </div>
        
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', background: '#111214', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {['ALL', 'PENDING', 'DP_DIBAYAR', 'LUNAS', 'VERIFIKASI'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(223, 177, 67, 0.1)' : 'transparent',
                color: filter === f ? 'var(--accent-color, #dfb143)' : '#8a8f98',
                border: filter === f ? '1px solid rgba(223, 177, 67, 0.3)' : '1px solid transparent',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Nama User</th>
                <th>Layanan</th>
                <th>Tanggal</th>
                <th>Total Harga</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Tidak ada transaksi untuk filter ini.</td></tr>
              ) : (
                filteredData.map((trx) => (
                  <tr key={trx.id}>
                    <td style={{ color: 'var(--accent-color, #dfb143)', fontFamily: 'monospace', fontSize: '13px' }}>{trx.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{trx.user?.nama || '-'}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{trx.user?.email}</div>
                    </td>
                    <td style={{ fontWeight: '500' }}>{getLayananLabel(trx)}</td>
                    <td style={{ color: '#8a8f98' }}>{formatTanggal(trx.tanggalLayanan)}</td>
                    <td style={{ fontWeight: '600' }}>{formatRupiah(trx.totalHarga)}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(trx.status)}`}>
                        {trx.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      {trx.status === 'PENDING' && (
                        <button className={styles.actionDelete} onClick={() => handleUpdateStatus(trx.id, 'BATAL')}>
                          Batalkan
                        </button>
                      )}
                      {trx.status !== 'PENDING' && (
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
