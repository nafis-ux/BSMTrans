"use client";
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/utils/getImageUrl';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminMobilPage() {
  const [mobilData, setMobilData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMobilId, setEditMobilId] = useState(null);
  const [editMobilForm, setEditMobilForm] = useState({});

  const [showAddMobil, setShowAddMobil] = useState(false);
  const [newMobilForm, setNewMobilForm] = useState({
    namaMobil: '', tipe: '', hargaPerHari: '', biayaDriver: '150000', statusTersedia: true,
    kursi: '5', bagasi: '2', transmisi: 'Manual', fiturLain: 'AC, Audio', image: ''
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/mobil`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMobilData(data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  const handleDeleteMobil = async (mobilId) => {
    if (!confirm(`Hapus unit mobil ${mobilId}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/mobil/${mobilId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setMobilData(prev => prev.filter(m => m.id !== mobilId));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleStartEditMobil = (mobil) => {
    setEditMobilId(mobil.id);
    setEditMobilForm({
      namaMobil: mobil.namaMobil,
      tipe: mobil.tipe,
      hargaPerHari: mobil.hargaPerHari,
      biayaDriver: mobil.biayaDriver || 0,
      statusTersedia: mobil.statusTersedia,
      kursi: mobil.kursi || 5,
      bagasi: mobil.bagasi || 2,
      transmisi: mobil.transmisi || 'Manual',
      fiturLain: mobil.fiturLain || '',
      image: mobil.image || ''
    });
  };

  const handleSaveEditMobil = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/mobil/${editMobilId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editMobilForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setMobilData(prev => prev.map(m => m.id === editMobilId ? { ...m, ...editMobilForm, hargaPerHari: parseInt(editMobilForm.hargaPerHari), biayaDriver: parseInt(editMobilForm.biayaDriver) } : m));
      setEditMobilId(null);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleUploadImage = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    try {
      const isDirectUpdate = isEdit && editMobilId;
      const url = isDirectUpdate 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/mobil/${editMobilId}/image`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/mobil/upload`;
      
      const method = isDirectUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isEdit) {
        setEditMobilForm(prev => ({ ...prev, image: data.filename }));
        // Update data langsung di tabel (tidak perlu klik Simpan lagi khusus gambar)
        setMobilData(prev => prev.map(m => m.id === editMobilId ? { ...m, image: data.filename } : m));
      } else {
        setNewMobilForm(prev => ({ ...prev, image: data.filename }));
      }
    } catch (err) {
      alert("Gagal upload gambar: " + err.message);
    }
  };

  const handleAddMobil = async () => {
    if (!newMobilForm.namaMobil || !newMobilForm.hargaPerHari) {
      alert("Nama mobil dan harga per hari wajib diisi!");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/mobil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newMobilForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      setMobilData(prev => [...prev, data.mobil]);
      setShowAddMobil(false);
      setNewMobilForm({ namaMobil: '', tipe: '', hargaPerHari: '', biayaDriver: '150000', statusTersedia: true, kursi: '5', bagasi: '2', transmisi: 'Manual', fiturLain: 'AC, Audio', image: '' });
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat data mobil...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Manajemen Armada Mobil</h1>
        <p className={styles.subtitle}>Kelola unit sewa kendaraan, spesifikasi lengkap, dan ketersediaan.</p>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.panelHeader}>
          <div className={styles.searchBox} style={{ width: '300px' }}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" placeholder="Cari kendaraan..." className={styles.searchInput} style={{ width: '100%' }} />
          </div>
          <button className={styles.btnCreate} onClick={() => setShowAddMobil(!showAddMobil)}>
            {showAddMobil ? '✕ Batal' : '+ Tambah Armada'}
          </button>
        </div>

        {/* Form Tambah Mobil */}
        {showAddMobil && (
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Nama Unit</label>
              <input type="text" placeholder="Toyota Alphard" value={newMobilForm.namaMobil} onChange={e => setNewMobilForm({...newMobilForm, namaMobil: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '120px' }}>
              <label style={labelStyle}>Kategori / Tipe</label>
              <input type="text" placeholder="Premium MPV" value={newMobilForm.tipe} onChange={e => setNewMobilForm({...newMobilForm, tipe: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Tarif / Hari</label>
              <input type="number" placeholder="2500000" value={newMobilForm.hargaPerHari} onChange={e => setNewMobilForm({...newMobilForm, hargaPerHari: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Biaya Driver</label>
              <input type="number" placeholder="150000" value={newMobilForm.biayaDriver} onChange={e => setNewMobilForm({...newMobilForm, biayaDriver: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={labelStyle}>Kursi</label>
              <input type="number" placeholder="5" value={newMobilForm.kursi} onChange={e => setNewMobilForm({...newMobilForm, kursi: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={labelStyle}>Bagasi</label>
              <input type="number" placeholder="2" value={newMobilForm.bagasi} onChange={e => setNewMobilForm({...newMobilForm, bagasi: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Transmisi</label>
              <select value={newMobilForm.transmisi} onChange={e => setNewMobilForm({...newMobilForm, transmisi: e.target.value})} style={{...inlineInputStyle, width: '100%'}}>
                <option value="Manual">Manual</option>
                <option value="Otomatis">Otomatis</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Fitur Lain</label>
              <input type="text" placeholder="AC, Audio" value={newMobilForm.fiturLain} onChange={e => setNewMobilForm({...newMobilForm, fiturLain: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>File Gambar</label>
              <input type="file" accept="image/*" onChange={e => handleUploadImage(e, false)} style={{...inlineInputStyle, width: '100%', padding: '6px'}} />
              {newMobilForm.image && <div style={{ fontSize: '11px', color: '#2ecc71', marginTop: '4px' }}>✓ {newMobilForm.image}</div>}
            </div>
            <button onClick={handleAddMobil} className={styles.btnCreate} style={{ padding: '10px 24px', height: '40px' }}>
              Simpan
            </button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID & Unit</th>
                <th>Kapasitas</th>
                <th>Spesifikasi</th>
                <th>Tarif / Hari</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mobilData.map((mobil) => (
                <tr key={mobil.id}>
                  {editMobilId === mobil.id ? (
                    <>
                      <td colSpan="5">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
                          <div><label style={labelStyle}>Nama</label><input type="text" value={editMobilForm.namaMobil} onChange={e => setEditMobilForm({...editMobilForm, namaMobil: e.target.value})} style={inlineInputStyle} /></div>
                          <div><label style={labelStyle}>Tipe</label><input type="text" value={editMobilForm.tipe} onChange={e => setEditMobilForm({...editMobilForm, tipe: e.target.value})} style={inlineInputStyle} /></div>
                          <div><label style={labelStyle}>Harga/Hr</label><input type="number" value={editMobilForm.hargaPerHari} onChange={e => setEditMobilForm({...editMobilForm, hargaPerHari: e.target.value})} style={inlineInputStyle} /></div>
                          <div><label style={labelStyle}>Biaya Driver</label><input type="number" value={editMobilForm.biayaDriver} onChange={e => setEditMobilForm({...editMobilForm, biayaDriver: e.target.value})} style={inlineInputStyle} /></div>
                          <div><label style={labelStyle}>Kursi</label><input type="number" value={editMobilForm.kursi} onChange={e => setEditMobilForm({...editMobilForm, kursi: e.target.value})} style={{...inlineInputStyle, width: '60px'}} /></div>
                          <div><label style={labelStyle}>Bagasi</label><input type="number" value={editMobilForm.bagasi} onChange={e => setEditMobilForm({...editMobilForm, bagasi: e.target.value})} style={{...inlineInputStyle, width: '60px'}} /></div>
                          <div><label style={labelStyle}>Transmisi</label>
                            <select value={editMobilForm.transmisi} onChange={e => setEditMobilForm({...editMobilForm, transmisi: e.target.value})} style={inlineInputStyle}>
                              <option value="Manual">Manual</option>
                              <option value="Otomatis">Otomatis</option>
                            </select>
                          </div>
                          <div><label style={labelStyle}>Fitur</label><input type="text" value={editMobilForm.fiturLain} onChange={e => setEditMobilForm({...editMobilForm, fiturLain: e.target.value})} style={inlineInputStyle} /></div>
                          <div><label style={labelStyle}>Image</label>
                            <input type="file" accept="image/*" onChange={e => handleUploadImage(e, true)} style={{...inlineInputStyle, padding: '6px'}} />
                            {editMobilForm.image && <div style={{ fontSize: '11px', color: '#2ecc71', marginTop: '4px' }}>✓ {editMobilForm.image}</div>}
                          </div>
                          <div><label style={labelStyle}>Status</label>
                            <select value={editMobilForm.statusTersedia} onChange={e => setEditMobilForm({...editMobilForm, statusTersedia: e.target.value === 'true'})} style={inlineInputStyle}>
                              <option value="true">Tersedia</option>
                              <option value="false">Disewa</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className={styles.actionCell} style={{ verticalAlign: 'middle' }}>
                        <button className={styles.actionEdit} onClick={handleSaveEditMobil} style={{ padding: '8px 12px', background: '#2ecc71', color: '#000', borderRadius: '4px' }}>Simpan</button>
                        <button className={styles.actionDelete} onClick={() => setEditMobilId(null)} style={{ padding: '8px 12px', background: '#333', color: '#fff', borderRadius: '4px' }}>Batal</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {mobil.image ? (
                            <img src={getImageUrl(mobil.image)} alt={mobil.namaMobil} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                          ) : (
                            <div style={{ width: '50px', height: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>No Img</div>
                          )}
                          <div>
                            <div style={{ color: 'var(--accent-color, #dfb143)', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' }}>{mobil.id}</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{mobil.namaMobil}</div>
                            <div style={{ color: '#8a8f98', fontSize: '11px' }}>{mobil.tipe}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>💺 {mobil.kursi} Kursi</div>
                        <div style={{ fontSize: '13px', color: '#8a8f98' }}>🧳 {mobil.bagasi} Koper</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>⚙️ {mobil.transmisi}</div>
                        <div style={{ fontSize: '12px', color: '#8a8f98', maxWidth: '150px' }}>✨ {mobil.fiturLain || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{formatRupiah(mobil.hargaPerHari)}</div>
                        <div style={{ fontSize: '11px', color: '#8a8f98' }}>+ Driver: {formatRupiah(mobil.biayaDriver)}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${mobil.statusTersedia ? styles.badgeAvailable : styles.badgeRented}`}>
                          {mobil.statusTersedia ? 'Tersedia' : 'Disewa'}
                        </span>
                      </td>
                      <td className={styles.actionCell}>
                        <button className={styles.actionEdit} onClick={() => handleStartEditMobil(mobil)}>Edit</button>
                        <button className={styles.actionDelete} onClick={() => handleDeleteMobil(mobil.id)}>Hapus</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inlineInputStyle = {
  backgroundColor: '#16171a',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  width: '140px'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#8a8f98',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: '600'
};
