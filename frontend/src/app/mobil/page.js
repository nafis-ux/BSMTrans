'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/utils/getImageUrl';
import styles from '@/styles/Mobil.module.css';
import Toast from '@/components/Toast';
import useToast from '@/utils/useToast';

export default function SewaMobilPage() {
  const router = useRouter();
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/mobil`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCarList(data);
        }
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePesanClick = (carId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Silakan login terlebih dahulu untuk melakukan pemesanan.", "warning");
      router.push('/login');
      return;
    }
    router.push(`/mobil/${carId}`);
  };

  return (
    <main className={styles.main}>
      <Toast toasts={toasts} removeToast={removeToast} />
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Luxury Car Rental</div>
          <h1 className={styles.title}>
            Koleksi <span className={styles.titleHighlight}>Armada Premium.</span>
          </h1>
          <p className={styles.subtitle}>
            Pilih kendaraan eksklusif yang sesuai dengan gaya dan kebutuhan perjalanan Anda. 
            Semua unit terawat dengan standar VIP untuk kenyamanan maksimal.
          </p>
        </div>
      </section>

      {/* 2. CATALOG SECTION */}
      <section className={styles.catalogSection}>
        {loading ? (
          <p style={{ color: '#8a8f98', textAlign: 'center', marginTop: '50px' }}>Memuat koleksi armada...</p>
        ) : (
          <div className={styles.carGrid}>
            {carList.length > 0 ? (
              carList.map((car) => (
                <div key={car.id} className={styles.carCard}>
                  
                  <div className={styles.imageWrapper}>
                    {car.image ? (
                      <img src={getImageUrl(car.image)} alt={car.namaMobil} className={styles.carImage} />
                    ) : (
                      <div className={styles.imagePlaceholder}>No Image Available</div>
                    )}
                    
                    <span className={`${styles.statusBadge} ${car.statusTersedia ? styles.statusTersedia : styles.statusDisewa}`}>
                      {car.statusTersedia ? 'Tersedia' : 'Disewa'}
                    </span>

                    <div className={styles.priceTag}>
                      <span className={styles.priceAmount}>Rp {car.hargaPerHari ? car.hargaPerHari.toLocaleString('id-ID') : '0'}</span>
                      <span className={styles.priceUnit}>/ hari</span>
                    </div>
                  </div>

                  <div className={styles.carContent}>
                    <h2 className={styles.carName}>{car.namaMobil}</h2>
                    <p className={styles.carType}>{car.tipe}</p>

                    <div className={styles.specsGrid}>
                      <div className={styles.specItem}>
                        <span className={styles.specIcon}>💺</span>
                        <span>{car.kursi || 5} Kursi</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specIcon}>⚙️</span>
                        <span>{car.transmisi || 'Manual'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specIcon}>🧳</span>
                        <span>{car.bagasi || 2} Bagasi</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specIcon}>✨</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {car.fiturLain || 'AC, Audio'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      {car.statusTersedia ? (
                        <button onClick={() => handlePesanClick(car.id)} className={styles.btnPesan}>
                          Lihat Detail & Pesan
                        </button>
                      ) : (
                        <button className={styles.btnDisabled} disabled>
                          Sedang Disewa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#8a8f98', textAlign: 'center', gridColumn: '1 / -1', padding: '50px' }}>
                <h3>Belum ada armada mobil yang tersedia saat ini.</h3>
              </div>
            )}
          </div>
        )}
      </section>

    </main>
  );
}