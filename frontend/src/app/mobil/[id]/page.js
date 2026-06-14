"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '@/styles/Booking.module.css';

export default function BookingForm() {
  const router = useRouter();
  const params = useParams();
  const carId = params?.id; 

  const [carData, setCarData] = useState(null);
  const [error, setError] = useState(null);
  
  const [driverService, setDriverService] = useState('driver'); 
  const [duration, setDuration] = useState(1);
  const [rentalDate, setRentalDate] = useState('');
  
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  // State Baru untuk KTP
  const [hasKtpInDb, setHasKtpInDb] = useState(false); // Cek apakah user sudah punya KTP di DB
  const [ktpFile, setKtpFile] = useState(null); // Menyimpan file gambar KTP temporer
  const [ktpPreview, setKtpPreview] = useState(''); // Untuk menampilkan preview gambar

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }

    if (carId) {
      fetch(`http://localhost:5000/api/mobil/${carId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Gagal memuat data mobil: ${res.status}`);
          return res.json();
        })
        .then((data) => setCarData(data))
        .catch((err) => setError(err.message));
    }

    // Fetch profil user untuk cek nama, WA, dan status fotoKTP (TIDAK DIUBAH)
    fetch('http://localhost:5000/api/user/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCustomerName(data.user.namaLengkap || '');
          setWhatsappNumber(data.user.noHandphone || '');
          // Jika di tabel user kolom fotoKTP sudah terisi, set true
          if (data.user.fotoKTP) {
            setHasKtpInDb(true);
          }
        }
      })
      .catch((err) => console.error("Gagal memuat data user:", err));

  }, [carId, router]);

  // Handle ketika gambar KTP dipilih oleh user
  const handleKtpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKtpFile(file);
      setKtpPreview(URL.createObjectURL(file)); // Membuat URL bayangan untuk preview foto
    }
  };

  if (error) return <p style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '50px' }}>Terjadi kesalahan: {error}</p>;
  if (!carData) return <p style={{ color: '#ffffff', textAlign: 'center', marginTop: '50px' }}>Memuat data pesanan...</p>;

  const hargaSewaPerHari = carData.hargaPerHari || 0;
  const biayaDriverPerHari = carData.biayaDriver || 300000; 
  
  const totalSewa = hargaSewaPerHari * duration;
  const totalDriver = driverService === 'driver' ? biayaDriverPerHari * duration : 0;
  const grandTotal = totalSewa + totalDriver;

  // =========================================================================
  // BAGIAN UTAMA YANG DIPERBARUI (MENGGUNAKAN SESSIONSTORAGE)
  // =========================================================================
  const handleConfirmOrder = async () => {
    if (!customerName || !rentalDate || !whatsappNumber) {
      alert("Silakan lengkapi semua data terlebih dahulu.");
      return;
    }

    // Validasi gambar KTP jika lepas kunci & user belum punya KTP terunggah di DB
    if (driverService === 'lepas_kunci' && !hasKtpInDb && !ktpFile) {
      alert("⚠️ Wajib mengunggah foto KTP Anda untuk layanan Lepas Kunci!");
      return;
    }

    // Fungsi pembantu untuk membungkus data dan melakukan redirect/navigasi halaman
    const proceedToNavigation = (base64Image = "") => {
      const payload = {
        carId: carId,
        namaMobil: carData.namaMobil,
        tipeMobil: carData.tipe,
        namaPelanggan: customerName,
        whatsapp: whatsappNumber,
        tanggalSewa: rentalDate,
        durasi: duration,
        layananPengemudi: driverService,
        grandTotal: grandTotal,
        fotoKtpData: base64Image
      };

      // Simpan objek data ke dalam sessionStorage browser
      sessionStorage.setItem('pending_booking', JSON.stringify(payload));

      // Pindah ke halaman konfirmasi bersih tanpa query parameters di URL
      router.push(`/mobil/${carId}/konfirmasi`);
    };

    // Jika user mengunggah file baru, konversikan ke Base64 agar aman masuk sessionStorage
    if (driverService === 'lepas_kunci' && ktpFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        proceedToNavigation(reader.result);
      };
      reader.readAsDataURL(ktpFile);
    } else {
      proceedToNavigation("");
    }
  };
  // =========================================================================

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Formulir Pemesanan</h1>
        <p className={styles.subtitle}>Sistem manajemen berkas aman terintegrasi enkripsi bsmtrans.</p>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>👤</span>
            Informasi Penyewa
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nama Pelanggan (Otomatis)</label>
            <input type="text" className={styles.input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>

          <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
            <label className={styles.label}>Nomor WhatsApp (Otomatis)</label>
            <input type="tel" className={styles.input} value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
          </div>

          {/* INPUT FOTO KTP UNTUK LEPAS KUNCI */}
          {driverService === 'lepas_kunci' && (
            <div className={styles.inputGroup} style={{ marginTop: '20px', borderLeft: '3px solid #ffc107', paddingLeft: '12px' }}>
              <label className={styles.label} style={{ color: '#ffc107', fontWeight: '600' }}>
                Verifikasi Dokumen KTP (Syarat Lepas Kunci)
              </label>
              
              {hasKtpInDb ? (
                <div style={{ color: '#28a745', marginTop: '8px', fontSize: '14px' }}>
                  ✓ Foto KTP Anda sudah terverifikasi dengan aman di sistem kami.
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleKtpChange} 
                    style={{ marginTop: '8px', color: '#fff' }} 
                  />
                  <p style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>Format: JPG, PNG (Maks 2MB). Pastikan foto terlihat jelas.</p>
                  
                  {/* Tampilkan Preview Foto KTP jika sudah dipilih */}
                  {ktpPreview && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ color: '#fff', fontSize: '13px', marginBottom: '5px' }}>Pratinjau KTP:</p>
                      <img src={ktpPreview} alt="Preview KTP" style={{ width: '100%', maxWidth: '250px', borderRadius: '8px', border: '1px solid #333' }} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Detail Waktu */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>📅</span>Detail Waktu</div>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Tanggal Sewa</label>
              <input type="date" className={styles.input} value={rentalDate} onChange={(e) => setRentalDate(e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Durasi (Hari)</label>
              <input type="number" className={styles.input} value={duration} onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
          </div>
        </div>

        {/* Layanan Pengemudi */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>🚕</span>Layanan Pengemudi</div>
          <div className={styles.optionGrid}>
            <div className={`${styles.optionBtn} ${driverService === 'lepas_kunci' ? styles.optionActive : ''}`} onClick={() => setDriverService('lepas_kunci')}>
              Lepas Kunci (Upload KTP)
            </div>
            <div className={`${styles.optionBtn} ${driverService === 'driver' ? styles.optionActive : ''}`} onClick={() => setDriverService('driver')}>
              Dengan Driver
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN */}
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <div className={styles.carPreview}>
            <span className={styles.carBadge}>PREMIUM CLASS</span>
            {carData.image ? (
              <img src={`http://localhost:5000/uploads/${carData.image}`} alt={carData.namaMobil} className={styles.carImage} />
            ) : (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', height: '180px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 🚗 {carData.namaMobil}
              </div>
            )}
            <h3 className={styles.carName}>{carData.namaMobil}</h3>
            <p className={styles.carType}>{carData.tipe}</p>
          </div>

          <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: '1px' }}>Ringkasan Biaya</h4>
          <div className={styles.priceRow}><span>Sewa Kendaraan</span><span className={styles.priceVal}>Rp {totalSewa.toLocaleString('id-ID')}</span></div>
          <div className={styles.priceRow}><span>Biaya Driver</span><span className={styles.priceVal}>Rp {totalDriver.toLocaleString('id-ID')}</span></div>
          <div className={styles.totalDivider}></div>
          <div className={styles.totalPrice}>
            <span className={styles.totalLabel}>Total Harga</span>
            <div className={styles.totalAmount}>Rp {grandTotal.toLocaleString('id-ID')}</div>
          </div>

          <button type="button" className={`btn-primary ${styles.btnConfirm}`} onClick={handleConfirmOrder}>
            Konfirmasi Pesanan →
          </button>
        </div>
      </div>
    </div>
  );
}