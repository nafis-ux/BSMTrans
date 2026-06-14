"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    whatsapp: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          nama: data.nama || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          password: ''
        });
        
        // Update local storage user if changed
        const localUser = JSON.parse(localStorage.getItem('user'));
        if (localUser.nama !== data.nama || localUser.email !== data.email) {
          localStorage.setItem('user', JSON.stringify({ ...localUser, nama: data.nama, email: data.email }));
        }
      }
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      
      // Update local storage
      const localUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...localUser, nama: data.user.nama, email: data.user.email }));
      
      // Clear password field after save
      setProfile(prev => ({ ...prev, password: '' }));
      
      // Force reload to update avatar in layout
      window.location.reload();
    } catch (error) {
      alert("Gagal: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat profil...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Profil Akun Admin</h1>
        <p className={styles.subtitle}>Kelola informasi identitas dan kredensial akses Anda.</p>
      </div>

      <div className={styles.tableWrapper} style={{ maxWidth: '600px', padding: '24px' }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Nama Lengkap</label>
            <input 
              type="text" 
              value={profile.nama} 
              onChange={e => setProfile({...profile, nama: e.target.value})} 
              style={inputStyle} 
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Alamat Email</label>
            <input 
              type="email" 
              value={profile.email} 
              onChange={e => setProfile({...profile, email: e.target.value})} 
              style={inputStyle} 
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Nomor WhatsApp</label>
            <input 
              type="text" 
              value={profile.whatsapp} 
              onChange={e => setProfile({...profile, whatsapp: e.target.value})} 
              style={inputStyle} 
              required
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle}>Password Baru (Kosongkan jika tidak ingin mengubah)</label>
            <input 
              type="password" 
              value={profile.password} 
              onChange={e => setProfile({...profile, password: e.target.value})} 
              style={inputStyle} 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={styles.btnCreate} disabled={saving} style={{ width: '100%', padding: '12px' }}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#8a8f98',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: '600'
};

const inputStyle = {
  width: '100%',
  backgroundColor: '#111214',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s'
};
