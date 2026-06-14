"use client";
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/BookingDropOff.module.css';

export default function BookingDropOffPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  // 1. State untuk menampung data formulir booking drop off
  const [formData, setFormData] = useState({
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

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile`, {
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

  // Fetch service details
  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dropoff/${id}`);
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
  }, [id]);

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
    if (!formData.namaLengkap || !formData.alamatJemput || !formData.tanggalJemput || !formData.jamJemput) {
      alert('Harap lengkapi seluruh data penjemputan sebelum melanjutkan!');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jenisLayanan: "DROP_OFF",
          layananDropOffId: service.id,
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

      alert('Booking Drop Off Berhasil Dibuat!');
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
        <h1 className={styles.title}>Formulir Booking Drop Off</h1>
        <p className={styles.subtitle}>Konfirmasi jadwal dan lokasi penjemputan privat armada premium Anda.</p>
      </div>

      {/* SISI KIRI: INPUT FORMULIR RESERVASI */}
      <div className={styles.formSection}>
        <form onSubmit={handleBookingSubmit}>
          {/* Card 1: Informasi Kontak & Lokasi */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📍</span>
              Detail Titik Penjemputan
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
              <label className={styles.label}>Catatan Tambahan / Nomor Penerbangan (Opsional)</label>
              <input 
                type="text" 
                name="catatan"
                className={styles.input} 
                placeholder="Contoh: Pesawat Citilink QG-XXX jam 15:00 WIB" 
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
            <span className={styles.dropBadge}>PRIVATE SERVICE</span>
            {service.image && (
              <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', marginTop: '12px' }}>
                <img src={service.image} alt={service.destinasi} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>Tujuan Pengantaran:</p>
            <h2 className={styles.dropTitle}>{service.destinasi}</h2>
          </div>

          <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#fff' }}>RINCIAN BIAYA BOOKING</h4>
          
          <div className={styles.priceRow}>
            <span>Tarif Dasar Drop Off</span>
            <span>{service.harga > 0 ? `Rp ${service.harga.toLocaleString('id-ID')}` : 'Hubungi Admin'}</span>
          </div>

          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <div className={styles.includeItem}><span>✓</span> Sopir Eksekutif BSMTrans</div>
            <div className={styles.includeItem}><span>✓</span> Bahan Bakar Armada (BBM)</div>
            <div className={styles.includeItem}><span>✓</span> Sudah Termasuk Biaya Tol Utama</div>
          </div>

          <div className={styles.totalDivider}></div>

          <div className={styles.totalPrice}>
            <span style={{ fontSize: '16px' }}>Total Tagihan</span>
            <div className={styles.totalAmount}>{service.harga > 0 ? `Rp ${service.harga.toLocaleString('id-ID')}` : 'Hubungi Admin'}</div>
          </div>

          {/* Tombol pemicu submit form booking */}
          <button 
            type="button"
            onClick={handleBookingSubmit}
            className={`btn-primary ${styles.btnConfirm}`}
          >
            Konfirmasi Booking Drop Off →
          </button>
        </div>
      </div>
    </div>
  );
}
