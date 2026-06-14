"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminLayananDropOffPage() {
  const [dropOffServices, setDropOffServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    destinasi: '',
    tag: '',
    deskripsi: '',
    harga: '',
    estimasiWaktu: ''
  });

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dropoff');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDropOffServices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setIsEditMode(false);
    setFormData({ id: '', destinasi: '', tag: '', deskripsi: '', harga: '', estimasiWaktu: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (service) => {
    setIsEditMode(true);
    setFormData({
      id: service.id,
      destinasi: service.destinasi,
      tag: service.tag || '',
      deskripsi: service.deskripsi || '',
      harga: service.harga || '',
      estimasiWaktu: service.estimasiWaktu || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Session expired');

    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/dropoff/${formData.id}`
        : 'http://localhost:5000/api/dropoff';
        
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');

      alert(data.message);
      setIsFormOpen(false);
      fetchServices();
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Hapus layanan Drop Off dengan ID ${id}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/dropoff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      fetchServices();
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat data layanan drop off...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title} style={{ fontSize: '24px' }}>Master Data Drop Off</h1>
            <p className={styles.subtitle}>Kelola daftar layanan pengantaran sekali jalan (Drop Off).</p>
          </div>
          <button 
            onClick={openAddForm} 
            style={{ 
              background: 'var(--accent-color, #dfb143)', 
              color: '#000', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            + Tambah Layanan
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--accent-color, #dfb143)' }}>
            {isEditMode ? 'Edit Layanan Drop Off' : 'Tambah Layanan Baru'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {!isEditMode && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', color: '#a0a5b1', marginBottom: '8px' }}>ID Custom (Kosongi untuk Generate Otomatis)</label>
                <input type="text" name="id" value={formData.id} onChange={handleInputChange} placeholder="Contoh: bandara-juanda" style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: '#a0a5b1', marginBottom: '8px' }}>Destinasi Tujuan *</label>
              <input type="text" name="destinasi" value={formData.destinasi} onChange={handleInputChange} required placeholder="Contoh: Bandara Juanda" style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: '#a0a5b1', marginBottom: '8px' }}>Tag (Label)</label>
              <input type="text" name="tag" value={formData.tag} onChange={handleInputChange} placeholder="Contoh: AIRPORT TRANSFER" style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: '#a0a5b1', marginBottom: '8px' }}>Harga (Rp) *</label>
              <input type="number" name="harga" value={formData.harga} onChange={handleInputChange} required placeholder="Contoh: 150000" style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: '#a0a5b1', marginBottom: '8px' }}>Estimasi Waktu</label>
              <input type="text" name="estimasiWaktu" value={formData.estimasiWaktu} onChange={handleInputChange} placeholder="Contoh: 45 Menit" style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', color: '#a0a5b1', marginBottom: '8px' }}>Deskripsi Singkat</label>
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} placeholder="Deskripsi layanan..." rows="3" style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff' }}></textarea>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan Layanan</button>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: 'transparent', color: '#a0a5b1', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ fontSize: '16px' }}>Daftar Layanan Tersedia ({dropOffServices.length})</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Destinasi</th>
                <th>Detail & Waktu</th>
                <th>Tarif (Rp)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dropOffServices.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Belum ada data layanan Drop Off.</td></tr>
              ) : (
                dropOffServices.map((srv) => (
                  <tr key={srv.id}>
                    <td style={{ color: '#8a8f98', fontFamily: 'monospace', fontSize: '13px' }}>{srv.id}</td>
                    <td>
                      <div style={{ fontWeight: 'bold', color: 'var(--accent-color, #dfb143)' }}>{srv.destinasi}</div>
                      <div style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>{srv.tag}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#fff', maxWidth: '250px' }}>{srv.deskripsi}</div>
                      <div style={{ fontSize: '11px', color: '#a0a5b1', marginTop: '4px' }}>⏱️ {srv.estimasiWaktu}</div>
                    </td>
                    <td style={{ fontWeight: 'bold', fontSize: '15px' }}>
                      {srv.harga > 0 ? srv.harga.toLocaleString('id-ID') : 'Custom'}
                    </td>
                    <td className={styles.actionCell}>
                      {srv.id !== 'custom-drop' ? (
                        <>
                          <button className={styles.actionEdit} onClick={() => openEditForm(srv)}>Edit</button>
                          <button className={styles.actionDelete} onClick={() => handleDelete(srv.id)}>Hapus</button>
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#666' }}>Protected Service</span>
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
