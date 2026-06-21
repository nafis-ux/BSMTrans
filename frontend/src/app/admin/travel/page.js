"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/utils/getImageUrl';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminTravelPage() {
  const [travelData, setTravelData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddRute, setShowAddRute] = useState(false);
  const [editRuteId, setEditRuteId] = useState(null);
  
  const initialFormState = { 
    asal: '', tujuan: '', hargaTiket: '', jadwal: '07:00', armada: 'Hiace Executive',
    totalKursi: '14', fasilitas: 'AC, Reclining Seat, Snack', estimasiWaktu: '8 Jam',
    titikKumpul: 'Pool BSM', titikTurun: 'Terminal Tujuan', image: ''
  };

  const [newRuteForm, setNewRuteForm] = useState(initialFormState);
  const [editRuteForm, setEditRuteForm] = useState({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/travel`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTravelData(data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  const handleUploadImage = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    try {
      const isDirectUpdate = isEdit && editRuteId;
      const url = isDirectUpdate 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/travel/${editRuteId}/image`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/travel/upload`;
      
      const method = isDirectUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isEdit) {
        setEditRuteForm(prev => ({ ...prev, image: data.filename }));
        // Update data langsung di tabel (tidak perlu klik Simpan lagi khusus gambar)
        setTravelData(prev => prev.map(r => r.id === editRuteId ? { ...r, image: data.filename } : r));
      } else {
        setNewRuteForm(prev => ({ ...prev, image: data.filename }));
      }
    } catch (err) {
      alert("Gagal upload gambar: " + err.message);
    } finally {
      // Reset input file agar file yang sama bisa di-upload berulang kali
      e.target.value = '';
    }
  };

  const handleAddRute = async () => {
    if (!newRuteForm.asal || !newRuteForm.tujuan || !newRuteForm.hargaTiket) {
      alert("Asal, tujuan, dan harga tiket wajib diisi!");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newRuteForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      if (data.travel) setTravelData(prev => [...prev, data.travel]);
      setShowAddRute(false);
      setNewRuteForm(initialFormState);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleStartEditRute = (rute) => {
    setEditRuteId(rute.id);
    setEditRuteForm({
      asal: rute.asal,
      tujuan: rute.tujuan,
      hargaTiket: rute.hargaTiket,
      jadwal: rute.jadwal,
      armada: rute.armada,
      totalKursi: rute.totalKursi || 14,
      sisaKursi: rute.sisaKursi || 14,
      fasilitas: rute.fasilitas || '',
      estimasiWaktu: rute.estimasiWaktu || '',
      titikKumpul: rute.titikKumpul || '',
      titikTurun: rute.titikTurun || '',
      image: rute.image || ''
    });
  };

  const handleSaveEditRute = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/travel/${editRuteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editRuteForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setTravelData(prev => prev.map(r => r.id === editRuteId ? { ...r, ...editRuteForm, hargaTiket: parseInt(editRuteForm.hargaTiket) } : r));
      setEditRuteId(null);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleDeleteRute = async (ruteId) => {
    if (!confirm(`Hapus rute travel ${ruteId}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/travel/${ruteId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setTravelData(prev => prev.filter(r => r.id !== ruteId));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat rute travel...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Manajemen Data Travel</h1>
        <p className={styles.subtitle}>Kelola rute, spesifikasi, dan jadwal perjalanan eksekutif BSMTrans.</p>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ fontSize: '16px' }}>Daftar Rute Travel</h3>
          <button className={styles.btnCreate} onClick={() => setShowAddRute(!showAddRute)}>
            {showAddRute ? '✕ Tutup Form' : '+ Tambah Rute'}
          </button>
        </div>

        {/* Form Tambah Rute */}
        {showAddRute && (
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Kota Asal</label>
              <input type="text" placeholder="Banyuwangi" value={newRuteForm.asal} onChange={e => setNewRuteForm({...newRuteForm, asal: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Kota Tujuan</label>
              <input type="text" placeholder="Surabaya" value={newRuteForm.tujuan} onChange={e => setNewRuteForm({...newRuteForm, tujuan: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Harga Tiket</label>
              <input type="number" placeholder="200000" value={newRuteForm.hargaTiket} onChange={e => setNewRuteForm({...newRuteForm, hargaTiket: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '100px' }}>
              <label style={labelStyle}>Jadwal</label>
              <input type="text" placeholder="07:00" value={newRuteForm.jadwal} onChange={e => setNewRuteForm({...newRuteForm, jadwal: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Armada</label>
              <input type="text" placeholder="Hiace Executive" value={newRuteForm.armada} onChange={e => setNewRuteForm({...newRuteForm, armada: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '100px' }}>
              <label style={labelStyle}>Kapasitas</label>
              <input type="number" placeholder="14" value={newRuteForm.totalKursi} onChange={e => setNewRuteForm({...newRuteForm, totalKursi: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Fasilitas</label>
              <input type="text" placeholder="AC, Reclining Seat" value={newRuteForm.fasilitas} onChange={e => setNewRuteForm({...newRuteForm, fasilitas: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Est. Waktu</label>
              <input type="text" placeholder="8 Jam" value={newRuteForm.estimasiWaktu} onChange={e => setNewRuteForm({...newRuteForm, estimasiWaktu: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Titik Naik</label>
              <input type="text" placeholder="Pool BSM" value={newRuteForm.titikKumpul} onChange={e => setNewRuteForm({...newRuteForm, titikKumpul: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>Titik Turun</label>
              <input type="text" placeholder="Terminal" value={newRuteForm.titikTurun} onChange={e => setNewRuteForm({...newRuteForm, titikTurun: e.target.value})} style={{...inlineInputStyle, width: '100%'}} />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={labelStyle}>File Gambar</label>
              <input type="file" accept="image/*" onChange={e => handleUploadImage(e, false)} style={{...inlineInputStyle, width: '100%', padding: '6px'}} />
              {newRuteForm.image && <div style={{ fontSize: '11px', color: '#2ecc71', marginTop: '4px' }}>✓ {newRuteForm.image}</div>}
            </div>

            <button onClick={handleAddRute} className={styles.btnCreate} style={{ padding: '10px 24px', height: '40px' }}>
              Simpan
            </button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Rute & Info</th>
                <th>Spesifikasi Armada</th>
                <th>Titik Antar-Jemput</th>
                <th>Tarif / Tiket</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {travelData.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Belum ada rute travel yang terdaftar.</td></tr>
              ) : (
                travelData.map((rute) => (
                  <tr key={rute.id}>
                    {editRuteId === rute.id ? (
                      <>
                        <td colSpan="4">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
                            <div><label style={labelStyle}>Asal</label><input type="text" value={editRuteForm.asal} onChange={e => setEditRuteForm({...editRuteForm, asal: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Tujuan</label><input type="text" value={editRuteForm.tujuan} onChange={e => setEditRuteForm({...editRuteForm, tujuan: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Harga</label><input type="number" value={editRuteForm.hargaTiket} onChange={e => setEditRuteForm({...editRuteForm, hargaTiket: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Jadwal</label><input type="text" value={editRuteForm.jadwal} onChange={e => setEditRuteForm({...editRuteForm, jadwal: e.target.value})} style={{...inlineInputStyle, width: '80px'}} /></div>
                            <div><label style={labelStyle}>Armada</label><input type="text" value={editRuteForm.armada} onChange={e => setEditRuteForm({...editRuteForm, armada: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Kapasitas</label><input type="number" value={editRuteForm.totalKursi} onChange={e => setEditRuteForm({...editRuteForm, totalKursi: e.target.value})} style={{...inlineInputStyle, width: '80px'}} /></div>
                            <div><label style={labelStyle}>Sisa Kursi</label><input type="number" value={editRuteForm.sisaKursi} onChange={e => setEditRuteForm({...editRuteForm, sisaKursi: e.target.value})} style={{...inlineInputStyle, width: '80px'}} /></div>
                            <div><label style={labelStyle}>Fasilitas</label><input type="text" value={editRuteForm.fasilitas} onChange={e => setEditRuteForm({...editRuteForm, fasilitas: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Waktu</label><input type="text" value={editRuteForm.estimasiWaktu} onChange={e => setEditRuteForm({...editRuteForm, estimasiWaktu: e.target.value})} style={{...inlineInputStyle, width: '100px'}} /></div>
                            <div><label style={labelStyle}>Titik Naik</label><input type="text" value={editRuteForm.titikKumpul} onChange={e => setEditRuteForm({...editRuteForm, titikKumpul: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Titik Turun</label><input type="text" value={editRuteForm.titikTurun} onChange={e => setEditRuteForm({...editRuteForm, titikTurun: e.target.value})} style={inlineInputStyle} /></div>
                            <div><label style={labelStyle}>Image</label>
                              <input type="file" accept="image/*" onChange={e => handleUploadImage(e, true)} style={{...inlineInputStyle, padding: '6px'}} />
                              {editRuteForm.image && <div style={{ fontSize: '11px', color: '#2ecc71', marginTop: '4px' }}>✓ {editRuteForm.image}</div>}
                            </div>

                          </div>
                        </td>
                        <td className={styles.actionCell} style={{ verticalAlign: 'middle' }}>
                          <button className={styles.actionEdit} onClick={handleSaveEditRute} style={{ padding: '8px 12px', background: '#2ecc71', color: '#000', borderRadius: '4px' }}>Simpan</button>
                          <button className={styles.actionDelete} onClick={() => setEditRuteId(null)} style={{ padding: '8px 12px', background: '#333', color: '#fff', borderRadius: '4px' }}>Batal</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {rute.image ? (
                              <img src={getImageUrl(rute.image)} alt={rute.armada} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                              <div style={{ width: '50px', height: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>No Img</div>
                            )}
                            <div>
                              <div style={{ color: 'var(--accent-color, #dfb143)', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' }}>{rute.id}</div>
                              <div style={{ fontWeight: '600', fontSize: '15px' }}>{rute.asal} <span style={{ color: '#5a5e69', margin: '0 4px' }}>➔</span> {rute.tujuan}</div>
                              <div style={{ color: '#8a8f98', fontSize: '12px' }}>Jadwal: {rute.jadwal} ({rute.estimasiWaktu || '-'})</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>🚐 {rute.armada}</div>
                          <div style={{ fontSize: '12px', color: '#8a8f98' }}>Kursi: {rute.sisaKursi} sisa / {rute.totalKursi} total</div>
                          <div style={{ fontSize: '11px', color: '#8a8f98', maxWidth: '150px' }}>✨ {rute.fasilitas || '-'}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}><span style={{ color: '#8a8f98' }}>Naik:</span> {rute.titikKumpul || '-'}</div>
                          <div style={{ fontSize: '12px' }}><span style={{ color: '#8a8f98' }}>Turun:</span> {rute.titikTurun || '-'}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '15px' }}>{formatRupiah(rute.hargaTiket)}</div>
                          <div style={{ fontSize: '11px', color: '#8a8f98' }}>/ Penumpang</div>
                        </td>
                        <td className={styles.actionCell}>
                          <button className={styles.actionEdit} onClick={() => handleStartEditRute(rute)}>Edit</button>
                          <button className={styles.actionDelete} onClick={() => handleDeleteRute(rute.id)}>Hapus</button>
                        </td>
                      </>
                    )}
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

const inlineInputStyle = {
  backgroundColor: '#16171a',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px'
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
