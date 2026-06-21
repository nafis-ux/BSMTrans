"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getImageUrl } from '@/utils/getImageUrl';
import Link from 'next/link';
import styles from '@/styles/Konfirmasi.module.css';

export default function KonfirmasiPesananPage() {
  const { id } = useParams(); // Mengambil id mobil dari URL (contoh: mitsubishi-pajero-001)
  const router = useRouter();

  // State Utama Komponen
  const [bookingData, setBookingData] = useState(null);
  const [carData, setCarData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // Loading untuk submit ke database

  // 1. Ambil data sementara dari sessionStorage & data spesifikasi mobil dari database backend
  useEffect(() => {
    // A. Ambil data input form dari session storage
    const localData = sessionStorage.getItem('pending_booking');
    if (!localData) {
      setError("Data pemesanan tidak ditemukan atau formulir telah kedaluwarsa.");
      setLoading(false);
      return;
    }
    const parsedBooking = JSON.parse(localData);
    setBookingData(parsedBooking);

    // B. Ambil data mobil terbaru untuk konfirmasi silang harga asli database
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/mobil/${id}`, { cache: 'no-store' })
        .then(async (res) => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Status: ${res.status} - ${errText || 'Mobil tidak ditemukan'}`);
          }
          return res.json();
        })
        .then((data) => {
          setCarData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching car details:", err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  // 2. Fungsi Menyimpan Transaksi Nyata ke MySQL saat Tombol "Lanjut ke Pembayaran" Ditekan
  const handleLanjutPembayaran = async () => {
  try {
    // 1. Ambil data booking dari sessionStorage yang disimpan dari halaman form sebelumnya
    const pendingBooking = JSON.parse(sessionStorage.getItem('pending_booking'));
    if (!pendingBooking) {
      alert("Data pemesanan tidak ditemukan, silakan isi ulang form.");
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();

    // =========================================================================
    // 🔑 KUNCI PERBAIKAN: DISINKRONKAN DENGAN REQ.BODY BACKEND
    // =========================================================================
    
    // Backend mencari 'carId', pastikan frontend mengirim 'carId'
    formData.append('carId', pendingBooking.carId); 
    
    // Backend mencari 'rentalDate', pastikan frontend mengirim 'rentalDate'
    formData.append('rentalDate', pendingBooking.rentalDate || pendingBooking.tanggalSewa);
    
    // Backend mencari 'duration', pastikan frontend mengirim 'duration'
    formData.append('duration', pendingBooking.duration || pendingBooking.durasi);
    
    // Backend mencari 'driverService', pastikan frontend mengirim 'driverService'
    formData.append('driverService', pendingBooking.driverService || pendingBooking.layananPengemudi);

    // Jika Anda menyertakan upload file KTP
    if (pendingBooking.fotoKtpData) {
      const resBlob = await fetch(pendingBooking.fotoKtpData);
      const blob = await resBlob.blob();
      formData.append('fotoKTP', blob, 'ktp_pelanggan.png'); 
    }

    // 2. Kirim data ke API backend Anda
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/sewa-mobil`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Catatan: Jangan tambahkan 'Content-Type': 'application/json' jika menggunakan FormData
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Gagal mencatat pesanan.");
    }

    alert("Pemesanan berhasil dibuat!");
    router.push(`/transaksi/${result.transaksiId}`);

  } catch (error) {
    console.error("Gagal memproses transaksi:", error.message);
    alert(error.message);
  }
};

  if (loading) return <p style={{ color: '#ffffff', textAlign: 'center', marginTop: '50px' }}>Memuat rincian pesanan...</p>;

  if (error) {
    return (
      <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '100px', backgroundColor: '#1c1c1e', padding: '20px', borderRadius: '8px' }}>
        <h3>🚨 Gagal Memuat Data Konfirmasi</h3>
        <p>{error}</p>
        <p style={{ fontSize: '12px', color: '#aaa' }}>ID Mobil: <strong>{id}</strong></p>
        <button onClick={() => router.push(`/mobil/${id}`)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: '600' }}>
          Kembali ke Formulir
        </button>
      </div>
    );
  }

  // 3. Kalkulasi Biaya menggunakan data Asli terverifikasi dari Database
  const duration = bookingData?.durasi || 1;
  const driverService = bookingData?.layananPengemudi || 'lepas_kunci';
  
  const hargaSewaPerHari = carData?.hargaPerHari || 0;
  const biayaDriverPerHari = carData?.biayaDriver || 300000; 

  const totalSewa = hargaSewaPerHari * duration;
  const totalDriver = driverService === 'driver' ? biayaDriverPerHari * duration : 0;
  const grandTotal = totalSewa + totalDriver;

  // Formatter penanggalan lokal Indonesia (Contoh: 2026-06-21 -> 21 Juni 2026)
  const formatTanggalIndo = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    const opsi = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', opsi);
  };

  return (
    <div className={styles.container}>
      {/* HEADER PAGE */}
      <div className={styles.successHeader}>
        <span className={styles.successIcon}>✨</span>
        <h1 className={styles.title}>Tinjau Pesanan Anda</h1>
        <p className={styles.subtitle}>Silakan periksa kembali data keberangkatan Anda sebelum melakukan pembayaran.</p>
      </div>

      {/* KARTU STRUK / INVOICE REVIEW */}
      <div className={styles.receiptCard}>
        
        {/* Preview Unit Sesuai Gambar UI */}
        <div className={styles.carPreview}>
          <span className={styles.carBadge}>PREMIUM CLASS</span>
          {carData?.image ? (
            <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={getImageUrl(carData.image)} alt={carData.namaMobil} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ backgroundColor: '#121214', height: '140px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
               🚗 {carData?.namaMobil}
            </div>
          )}
          <h2 className={styles.carName}>{carData?.namaMobil}</h2>
          <p className={styles.carType}>{carData?.tipe || 'Luxury Car'}</p>
        </div>

        {/* Informasi Penyewa */}
        <div className={styles.detailsBlock}>
          <h4 className={styles.blockTitle}>Detail Penyewa & Waktu</h4>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nama Pelanggan</span>
            <span className={styles.infoValue}>{bookingData?.namaPelanggan}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tanggal Sewa</span>
            <span className={styles.infoValue}>{formatTanggalIndo(bookingData?.tanggalSewa)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Durasi Sewa</span>
            <span className={styles.infoValue}>{duration} Hari</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Layanan Pengemudi</span>
            <span className={styles.infoValue}>
              {driverService === 'driver' ? 'Dengan Driver' : 'Lepas Kunci (Berkas Dilampirkan)'}
            </span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Breakdown Rincian Biaya */}
        <div className={styles.detailsBlock}>
          <h4 className={styles.blockTitle}>Ringkasan Biaya</h4>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Sewa Kendaraan ({duration} Hari)</span>
            <span className={styles.infoValue}>Rp {totalSewa.toLocaleString('id-ID')}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Biaya Driver ({duration} Hari)</span>
            <span className={styles.infoValue}>Rp {totalDriver.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Total Akhir */}
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>Total Harga</span>
          <span className={styles.totalAmount}>Rp {grandTotal.toLocaleString('id-ID')}</span>
        </div>

        {/* Tombol Eksekusi Submit Database aman */}
        <button 
          onClick={handleLanjutPembayaran} 
          disabled={submitLoading}
          className={styles.btnAction}
          style={{
            width: '100%',
            cursor: submitLoading ? 'not-allowed' : 'pointer',
            opacity: submitLoading ? 0.7 : 1,
            border: 'none'
          }}
        >
          {submitLoading ? "Memproses Transaksi Secure..." : "Lanjut ke Pembayaran →"}
        </button>

      </div>
    </div>
  );
}