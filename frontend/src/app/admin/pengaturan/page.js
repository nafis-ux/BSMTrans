"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminSettingsPage() {
  const [preferences, setPreferences] = useState({
    accentColor: '#dfb143', // Default Gold
    theme: 'dark', // 'dark' | 'light'
    compactSidebar: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Opsi warna aksen
  const colorOptions = [
    { name: 'Emas (Default)', hex: '#dfb143' },
    { name: 'Biru Samudra', hex: '#3498db' },
    { name: 'Hijau Zamrud', hex: '#2ecc71' },
    { name: 'Merah Delima', hex: '#e74c3c' },
    { name: 'Ungu Amethyst', hex: '#9b59b6' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.uiPreferences) {
        setPreferences(data.uiPreferences);
      }
    } catch (error) {
      console.error("Gagal mengambil pengaturan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uiPreferences: preferences })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      
      // Update the local root style to reflect immediately
      document.documentElement.style.setProperty('--accent-color', preferences.accentColor);
      
      // Force reload to apply layout changes fully if necessary
      window.location.reload();
    } catch (error) {
      alert("Gagal: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: '#fff' }}>Memuat pengaturan UI...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ fontSize: '24px' }}>Pengaturan Tampilan (UI)</h1>
        <p className={styles.subtitle}>Personalisasikan pengalaman panel kontrol admin Anda.</p>
      </div>

      <div className={styles.tableWrapper} style={{ maxWidth: '600px', padding: '24px' }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Warna Aksen Utama</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
              {colorOptions.map(color => (
                <div 
                  key={color.hex}
                  onClick={() => setPreferences({...preferences, accentColor: color.hex})}
                  style={{
                    ...colorBoxStyle,
                    borderColor: preferences.accentColor === color.hex ? color.hex : 'transparent',
                    backgroundColor: preferences.accentColor === color.hex ? `${color.hex}15` : '#111214'
                  }}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color.hex }}></div>
                  <span style={{ fontSize: '13px', color: preferences.accentColor === color.hex ? '#fff' : '#8a8f98', fontWeight: preferences.accentColor === color.hex ? 'bold' : 'normal' }}>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Tema (Saat ini hanya tersedia Dark Mode)</label>
            <select 
              value={preferences.theme} 
              onChange={e => setPreferences({...preferences, theme: e.target.value})} 
              style={inputStyle} 
              disabled
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode (Coming Soon)</option>
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={preferences.compactSidebar} 
                onChange={e => setPreferences({...preferences, compactSidebar: e.target.checked})} 
                style={{ width: '18px', height: '18px', accentColor: preferences.accentColor }}
              />
              <span style={{ fontSize: '14px', color: '#c1c5ce' }}>Gunakan Sidebar Ringkas (Mode Ikon Saja)</span>
            </label>
          </div>

          <button type="submit" className={styles.btnCreate} disabled={saving} style={{ width: '100%', padding: '12px', backgroundColor: preferences.accentColor, color: '#000', fontWeight: 'bold' }}>
            {saving ? 'Menyimpan...' : 'Terapkan Tema'}
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
  color: '#8a8f98',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
};

const colorBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};
