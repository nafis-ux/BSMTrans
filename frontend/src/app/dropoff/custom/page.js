"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/BookingDropOff.module.css';

export default function CustomDropOffPage() {
  const router = useRouter();

  // 1. State untuk menampung data formulir booking drop off
  const [formData, setFormData] = useState({
    destinasi: '',
    namaLengkap: '',
    alamatJemput: '',
    tanggalJemput: '',
    jamJemput: '',
    catatan: ''
  });
  
  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill nama dari profil user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }

    fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.namaLengkap) {
            setFormData(prev => ({ ...prev, namaLengkap: data.user.namaLengkap }));
          }
        })
        .catch(err => console.error("Error fetching profile:", err));
  }, [router]);

  // Fetch service details for 'custom-drop'
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/dropoff/custom-drop`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        }
      } catch (error) {
        console.error("Gagal memuat layanan:", error);
      } finally {
        setLoadingService(false);
      }
    };
    fetchService();
  }, []);

  // 3. Fungsi untuk menangani perubahan input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 4. Fungsi submit booking drop off
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validasi sederhana
    if (!formData.destinasi || !formData.namaLengkap || !formData.alamatJemput || !formData.tanggalJemput || !formData.jamJemput) {
      alert('Harap lengkapi seluruh data penjemputan dan tujuan sebelum melanjutkan!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:5000/api/transaksi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jenisLayanan: "DROP_OFF",
          layananDropOffId: 'custom-drop',
          destinasi: formData.destinasi, // Mengirim destinasi custom
          namaLengkap: formData.namaLengkap,
          alamatJemput: formData.alamatJemput,
          tanggalJemput: formData.tanggalJemput,
          jamJemput: formData.jamJemput,
          catatan: formData.catatan
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat transaksi drop off.");
      }

      alert('Permintaan Custom Drop Off Berhasil Dibuat! Admin akan segera menghubungi Anda untuk estimasi harga.');
      router.push('/transaksi');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingService) return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Menyiapkan data layanan...</p>;
  if (!service) return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Layanan Drop Off tidak ditemukan.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Formulir Custom Drop Off</h1>
        <p className={styles.subtitle}>Tentukan lokasi antar Anda secara fleksibel dengan layanan eksklusif kami.</p>
      </div>

      {/* SISI KIRI: INPUT FORMULIR RESERVASI */}
      <div className={styles.formSection}>
        <form onSubmit={handleBookingSubmit}>
          {/* Card 1: Informasi Kontak & Lokasi */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📍</span>
              Detail Rute & Penumpang
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Tujuan Pengantaran (Destinasi)</label>
              <input 
                type="text" 
                name="destinasi"
                className={styles.input} 
                placeholder="Contoh: Hotel Majapahit, Surabaya" 
                value={formData.destinasi}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Nama Lengkap Penumpang</label>
              <input 
                type="text" 
                name="namaLengkap"
                className={styles.input} 
                placeholder="Masukkan nama kontak utama" 
                value={formData.namaLengkap}
                onChange={handleInputChange}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Alamat Penjemputan Lengkap</label>
              <textarea 
                name="alamatJemput"
                className={styles.textarea} 
                rows="3" 
                placeholder="Contoh: Jl. Diponegoro No. 45, Banyuwangi"
                value={formData.alamatJemput}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          {/* Card 2: Pengaturan Waktu Perjalanan */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>⏱️</span>
              Waktu Keberangkatan
            </div>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tanggal Penjemputan</label>
                <input 
                  type="date" 
                  name="tanggalJemput"
                  className={styles.input} 
                  value={formData.tanggalJemput}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Jam Jemput</label>
                <input 
                  type="time" 
                  name="jamJemput"
                  className={styles.input} 
                  value={formData.jamJemput}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
              <label className={styles.label}>Catatan Tambahan (Opsional)</label>
              <input 
                type="text" 
                name="catatan"
                className={styles.input} 
                placeholder="Contoh: Bawa 2 koper besar" 
                value={formData.catatan}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </form>
      </div>

      {/* SISI KANAN: STICKY RINGKASAN BIAYA & SUBMIT */}
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <div className={styles.dropPreview}>
            <span className={styles.dropBadge}>CUSTOM SERVICE</span>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>Tujuan Pengantaran:</p>
            <h2 className={styles.dropTitle}>{formData.destinasi || 'Sesuai Request'}</h2>
          </div>

          <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#fff' }}>RINCIAN BIAYA BOOKING</h4>
          
          <div className={styles.priceRow}>
            <span>Estimasi Tarif</span>
            <span>Menunggu Konfirmasi</span>
          </div>

          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <div className={styles.includeItem}><span>✓</span> Sopir Eksekutif BSMTrans</div>
            <div className={styles.includeItem}><span>✓</span> Bahan Bakar Armada (BBM)</div>
            <div className={styles.includeItem}><span>✓</span> Fleksibilitas Rute Perjalanan</div>
          </div>

          <div className={styles.totalDivider}></div>

          <div className={styles.totalPrice}>
            <span style={{ fontSize: '16px' }}>Total Tagihan</span>
            <div className={styles.totalAmount} style={{ fontSize: '18px' }}>Menunggu Admin</div>
          </div>

          {/* Tombol pemicu submit form booking */}
          <button 
            type="button"
            onClick={handleBookingSubmit}
            disabled={isSubmitting}
            className={`btn-primary ${styles.btnConfirm}`}
          >
            {isSubmitting ? 'Memproses...' : 'Request Custom Drop Off →'}
          </button>
        </div>
      </div>
    </div>
  );
}
