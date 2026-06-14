"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:5000/api/admin/dashboard', { headers }).then(r => r.json()),
      fetch('http://localhost:5000/api/admin/transaksi', { headers }).then(r => r.json())
    ])
    .then(([statsData, trxData]) => {
      if (!statsData.error) setStats(statsData);
      if (Array.isArray(trxData)) {
        // Ambil 5 transaksi terbaru
        setRecentTransactions(trxData.slice(0, 5));
      }
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  const getStatusBadgeClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'LUNAS') return styles.badgeAvailable;
    if (s === 'DP_DIBAYAR') return styles.badgePaid;
    if (s === 'BATAL') return styles.badgeBatal;
    return styles.badgeRented;
  };

  const getLayananLabel = (trx) => {
    if (trx.jenisLayanan === 'SEWA_MOBIL' && trx.mobil) return `Sewa ${trx.mobil.namaMobil}`;
    if (trx.jenisLayanan === 'TRAVEL' && trx.ruteTravel) return `Travel ${trx.ruteTravel.asal} - ${trx.ruteTravel.tujuan}`;
    if (trx.jenisLayanan === 'DROP_OFF') return `Drop Off Bandara`;
    return trx.jenisLayanan || '-';
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat data dashboard...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back to the BSMTrans command center.</p>
      </div>

      {/* METRIK UTAMA */}
      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <span className={styles.statsTitle}>Total Transaksi</span>
          <div className={styles.statsValue}>{stats?.transaksi?.total || 0}</div>
          <span className={styles.statsDesc} style={{ color: 'var(--accent-color, #dfb143)' }}>
            {stats?.transaksi?.pending || 0} Pending
          </span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsTitle}>Total Pendapatan</span>
          <div className={styles.statsValue}>{formatRupiah(stats?.revenue?.total)}</div>
          <span className={styles.statsDesc} style={{ color: '#2ecc71' }}>
            + {formatRupiah(stats?.revenue?.bulanIni)} bulan ini
          </span>
        </div>
        <div className={styles.statsCard}>
          <span className={styles.statsTitle}>Jumlah User (Pelanggan)</span>
          <div className={styles.statsValue}>{stats?.totalUser || 0}</div>
          <span className={styles.statsDesc}>Tidak termasuk akun admin</span>
        </div>
      </div>

      {/* RINCIAN PENDAPATAN BULANAN */}
      <div className={styles.tableWrapper} style={{ marginTop: '32px' }}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ fontSize: '16px' }}>Rincian Pendapatan Bulanan</h3>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          {stats?.revenue?.history && Object.keys(stats.revenue.history).length > 0 ? (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {Object.entries(stats.revenue.history).map(([month, amount]) => (
                <div key={month} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '16px',
                  minWidth: '160px'
                }}>
                  <div style={{ fontSize: '12px', color: '#8a8f98', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{month}</div>
                  <div style={{ fontSize: '18px', color: '#2ecc71', fontWeight: 'bold' }}>{formatRupiah(amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>Belum ada data pendapatan historis.</p>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper} style={{ marginTop: '32px' }}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ fontSize: '16px' }}>Transaksi Terbaru</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Nama User</th>
                <th>Layanan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Belum ada transaksi.</td></tr>
              ) : (
                recentTransactions.map(trx => (
                  <tr key={trx.id}>
                    <td style={{ color: 'var(--accent-color, #dfb143)', fontWeight: 'bold', fontSize: '13px' }}>#{trx.id}</td>
                    <td style={{ fontWeight: '500' }}>{trx.user?.nama || '-'}</td>
                    <td style={{ color: '#b8bcc6' }}>{getLayananLabel(trx)}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(trx.status)}`}>
                        {trx.status}
                      </span>
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