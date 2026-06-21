"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { getImageUrl } from '@/utils/getImageUrl';
import styles from '@/styles/KonfirmasiTravel.module.css';

export default function KonfirmasiTiketTravelPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const travelId = params?.id; // Mengambil ID rute secara dinamis dari parameter URL

  // 1. Tangkap parameter manifest dari URL query string hasil input halaman booking
  const namaPelanggan = searchParams.get('nama') || '';
  const alamatJemput = searchParams.get('jemput') || '';
  const kursiTerpilih = searchParams.get('kursi') || '-';
  const jumlahTiket = parseInt(searchParams.get('penumpang') || '1', 10);

  // State Data & Loading Dinamis
  const [routeDetail, setRouteDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Fetch Detail Rute Terpilih secara Real-Time dari Database
  useEffect(() => {
    if (!travelId) return;

    const fetchDetailRoute = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/travel/${travelId}`);
        if (!response.ok) throw new Error("Gagal mengambil data rute");
        
        const data = await response.json();
        setRouteDetail(data);
      } catch (error) {
        console.error("Error memuat detail rute:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailRoute();
  }, [travelId]);

  if (loading) return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Memuat manifest tiket Anda...</p>;
  if (!routeDetail) return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Rute tidak ditemukan atau telah dihapus.</p>;

  // Hitung Total Pembayaran Berdasarkan Database Dinamis
  const totalPembayaran = routeDetail.hargaTiket * jumlahTiket;

  // 3. Fungsi Submit Pemesanan ke Backend (Simpan Transaksi & Kunci Kursi)
  const handleBayarClick = async () => {
    if (isSubmitting) return;

    // Ambil Token JWT Login (Seperti di Logic Sewa Mobil Anda)
    const token = localStorage.getItem('token'); 
    if (!token) {
      alert("Sesi Anda telah berakhir. Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      // Kirim data manifest ke tabel transaksi di database backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Membawa auth token user yang memesan
        },
        body: JSON.stringify({
          ruteTravelId: travelId,
          jenisLayanan: "TRAVEL", // Mengarahkan tipe transaksi ke travel
          namaPenumpang: namaPelanggan,
          alamatPenjemputan: alamatJemput,
          nomorKursi: kursiTerpilih, // Disimpan berupa string (Contoh: "A1,A3")
          totalHarga: totalPembayaran,
          tanggalLayanan: new Date().toISOString() // Mengambil waktu pemesanan saat ini
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat invoice tiket.");
      }

      alert("Pemesanan Berhasil! Kursi Anda telah berhasil dikunci.");
      // Redirect ke halaman daftar transaksi user untuk proses pembayaran
      router.push(`/transaksi?ref=TRAVEL-${result.transaksiId || Math.floor(1000 + Math.random() * 9000)}`);

    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER PAGE */}
      <div className={styles.headerText}>
        <span className={styles.successIcon}>✨</span>
        <h1 className={styles.title}>Tinjau Manifest Tiket</h1>
        <p className={styles.subtitle}>Satu langkah lagi untuk mengunci kursi eksklusif armada travel Anda.</p>
      </div>

      {/* STRUK TIKET ELEGAN */}
      <div className={styles.ticketCard}>
        
        {/* Detail Rute Utama Dinamis */}
        <div className={styles.routeHeader}>
          <span className={styles.badge}>EXECUTIVE LINE</span>
          <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            <img src={getImageUrl(routeDetail?.image)} alt={routeDetail?.armada} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 className={styles.routeTitle}>{routeDetail?.asal} → {routeDetail?.tujuan}</h2>
          <p className={styles.armadaName}>🚌 {routeDetail?.armada}</p>
        </div>

        {/* Informasi Detail Manifest Penumpang */}
        <div className={styles.manifestBlock}>
          <h4 className={styles.blockTitle}>Detail Manifest</h4>
          
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Jadwal Keberangkatan</span>
            <span className={styles.infoValue}>{routeDetail.jadwal}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nama Penumpang Utama</span>
            <span className={styles.infoValue}>{namaPelanggan}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Titik Penjemputan</span>
            <span className={styles.infoValue}>{alamatJemput}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Kursi Dipilih</span>
            <span className={`${styles.infoValue} ${styles.seatHighlight}`}>{kursiTerpilih}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tarif Dasar ({jumlahTiket} Tiket)</span>
            <span className={styles.infoValue}>Rp {totalPembayaran.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Ringkasan Total Akhir */}
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>Total Pembayaran</span>
          <span className={styles.totalAmount}>Rp {totalPembayaran.toLocaleString('id-ID')}</span>
        </div>

        {/* Tombol Ambil Tiket Akhir dengan Validasi State */}
        <button 
          onClick={handleBayarClick} 
          className={styles.btnAction}
          disabled={isSubmitting}
          style={{ width: '100%', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Mengunci Kursi...' : 'Ambil Tiket & Bayar Sekarang →'}
        </button>

      </div>
    </div>
  );
}