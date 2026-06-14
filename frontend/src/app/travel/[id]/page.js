"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '@/styles/BookingTravel.module.css';

export default function BookingTravelPage() {
  const router = useRouter();
  const params = useParams();
  const travelId = params?.id;

  // State Data Dinamis dari Database
  const [routeDetail, setRouteDetail] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]); // State kursi terisi
  const [loading, setLoading] = useState(true);

  // State Form Input
  const [customerName, setCustomerName] = useState(''); // Akan diisi otomatis dari Profil User
  const [pickupAddress, setPickupAddress] = useState(''); // Tetap kosong untuk diisi custom oleh penumpang
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch Data Detail Rute, Kursi Terisi, dan Profil User saat halaman diakses
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }

    if (!travelId) return;

    const fetchBookingData = async () => {
      try {
        // 1. Ambil detail rute travel
        const routeResponse = await fetch(`http://localhost:5000/api/travel/${travelId}`);
        const routeData = await routeResponse.json();
        setRouteDetail(routeData);

        // 2. Ambil daftar kursi yang sudah ter-booking dari database (kolom detailManifest)
        const seatsResponse = await fetch(`http://localhost:5000/api/travel/${travelId}/occupied-seats`);
        const seatsData = await seatsResponse.json();
        setOccupiedSeats(seatsData.occupiedSeats || []);

        // 3. FITUR OTOMATIS: Ambil Nama Lengkap dari Profil User yang sedang Login
        const token = localStorage.getItem('token');
        if (token) {
          const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // Isi otomatis state nama dengan nama asli dari database user
            if (profileData.user && profileData.user.namaLengkap) {
              setCustomerName(profileData.user.namaLengkap);
            }
          }
        }

      } catch (error) {
        console.error("Gagal memuat data reservasi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [travelId]);

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return; // Blokir klik jika kursi sudah penuh

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  if (loading) return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Menyiapkan denah kursi...</p>;
  if (!routeDetail) return <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Rute tidak ditemukan.</p>;

  const jumlahPenumpang = selectedSeats.length > 0 ? selectedSeats.length : 1;
  const grandTotal = routeDetail.hargaTiket * jumlahPenumpang;

  // Fungsi dinamis untuk membuat kotak kursi menyesuaikan totalKursi dari Database
  const generateSeats = (total) => {
    const seats = ['Supir'];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    let count = 0;
    for (let r of rows) {
      // Baris A (Depan) biasanya 3 kursi, baris lainnya 4 kursi
      let seatsInRow = (r === 'A') ? 3 : 4; 
      for (let i = 1; i <= seatsInRow; i++) {
        if (count < total) {
          seats.push(`${r}${i}`);
          count++;
        }
      }
    }
    return seats;
  };

  const dynamicSeats = generateSeats(routeDetail.totalKursi || 14);

  const handleConfirmOrder = () => {
    if (!customerName || !pickupAddress) {
      alert("Silakan isi Nama Lengkap dan Alamat Penjemputan terlebih dahulu.");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Silakan pilih minimal satu nomor kursi.");
      return;
    }

    const query = new URLSearchParams({
      nama: customerName,
      jemput: pickupAddress,
      kursi: selectedSeats.join(','),
      penumpang: jumlahPenumpang.toString()
    }).toString();

    router.push(`/travel/${travelId}/konfirmasi?${query}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Reservasi Tiket Travel</h1>
        <p className={styles.subtitle}>Isi detail penumpang dan tentukan posisi kursi ternyaman Anda.</p>
      </div>

      <div className={styles.formSection}>
        {/* Card 1: Data Penumpang */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📝</span>
            Informasi Penumpang Utama
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nama Lengkap</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Nama sesuai KTP" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              // Opsional: tambahkan readOnly jika Anda ingin namanya terkunci & tidak boleh diubah manual
              // readOnly 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Titik Penjemputan (Alamat Custom Anda)</label>
            <textarea 
              className={styles.textarea} 
              rows="3" 
              placeholder="Masukkan alamat jemput kustom Anda (Contoh: Hotel Baru, Jl. Sudirman No. 5)"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Card 2: Denah Kursi */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💺</span>
            Pilih Nomor Kursi ({selectedSeats.length} Terpilih)
          </div>
          <p style={{ color: '#a0a5b0', fontSize: '13px', marginBottom: '16px' }}>
            *Kotak berwarna merah/meredup menandakan kursi sudah dipesan oleh penumpang lain.
          </p>
          
          <div className={styles.seatGrid}>
            {dynamicSeats.map((seat) => {
              const isOccupied = occupiedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              const isDriver = seat === 'Supir';

              return (
                <div
                  key={seat}
                  className={`${styles.seatBox} ${
                    isDriver ? styles.seatOccupied : 
                    isOccupied ? styles.seatOccupied : 
                    isSelected ? styles.seatSelected : ''
                  }`}
                  style={{
                    backgroundColor: isOccupied ? '#3a2225' : isSelected ? '#dfb143' : '',
                    color: isOccupied ? '#ff6b6b' : '',
                    borderColor: isOccupied ? '#ff4d4d' : '',
                    cursor: isOccupied ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => !isDriver && handleSeatClick(seat)}
                >
                  {seat} {isOccupied ? '(Penuh)' : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SISI KANAN: SUMMARY */}
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <div className={styles.routePreview}>
            <span className={styles.routeBadge}>EXECUTIVE LINE</span>
            {routeDetail.image ? (
               <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                 <img src={`http://localhost:5000/uploads/${routeDetail.image}`} alt={routeDetail.armada} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
            ) : null}
            <h2 className={styles.routeTitle}>{routeDetail.asal} → {routeDetail.tujuan}</h2>
            <p style={{ color: '#a0a5b1', fontSize: '13px', marginTop: '6px' }}>🚌 {routeDetail.armada}</p>
          </div>

          <h4 style={{ fontSize: '14px', marginBottom: '16px', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: '1px' }}>DETAIL MANIFEST</h4>
          
          <div className={styles.priceRow}>
            <span>Jadwal Keberangkatan</span>
            <span style={{ color: '#fff', fontWeight: '600' }}>{routeDetail.jadwal}</span>
          </div>
          
          <div className={styles.priceRow}>
            <span>Kursi Dipilih</span>
            <span style={{ color: '#dfb143', fontWeight: '700' }}>
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}
            </span>
          </div>

          <div className={styles.priceRow}>
            <span>Tarif Dasar x {jumlahPenumpang}</span>
            <span style={{ color: '#fff', fontWeight: '600' }}>Rp {(routeDetail.hargaTiket * jumlahPenumpang).toLocaleString('id-ID')}</span>
          </div>

          <div className={styles.totalDivider}></div>

          <div className={styles.totalPrice}>
            <span style={{ fontSize: '16px' }}>Total Pembayaran</span>
            <div className={styles.totalAmount}>Rp {grandTotal.toLocaleString('id-ID')}</div>
          </div>

          <button 
            type="button"
            className={`btn-primary ${styles.btnConfirm}`}
            onClick={handleConfirmOrder}
          >
            Kunci Kursi & Ambil Tiket →
          </button>
        </div>
      </div>
    </div>
  );
}