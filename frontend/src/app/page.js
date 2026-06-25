"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getImageUrl } from '@/utils/getImageUrl';
import styles from '../styles/Home.module.css';
import Toast from '@/components/Toast';
import useToast from '@/utils/useToast';

export default function Home() {
  const router = useRouter();
  const [activeService, setActiveService] = useState('rental');
  const [featuredCars, setFeaturedCars] = useState([]);
  const [travelRoutes, setTravelRoutes] = useState([]);
  const { toasts, showToast, removeToast } = useToast();


  useEffect(() => {
    // Fetch Mobil
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/mobil`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeaturedCars(data.slice(0, 3));
      })
      .catch(err => console.error("Gagal load armada:", err));

    // Fetch Travel
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/travel`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTravelRoutes(data.slice(0, 3));
      })
      .catch(err => console.error("Gagal load travel:", err));


  }, []);

  const formatRupiah = (num) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  // Handler universal: cek login dulu, baru navigasi
  const handlePesanClick = (targetPath) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Silakan login atau daftar terlebih dahulu untuk melakukan pemesanan.", "warning");
      router.push('/login');
      return;
    }
    router.push(targetPath);
  };

  return (
    <main className={styles.main}>
      <Toast toasts={toasts} removeToast={removeToast} />
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Premium Transport Solutions</div>
          <h1 className={styles.title}>
            Perjalanan Berkelas,
            <span className={styles.titleHighlight}>Tanpa Batas.</span>
          </h1>
          <p className={styles.subtitle}>
            Nikmati kemewahan dan kenyamanan perjalanan dengan armada eksklusif BSMTrans. 
            Melayani sewa mobil premium, travel antar kota, dan drop-off bandara dengan standar VIP.
          </p>

          {/* QUICK SEARCH WIDGET */}
          <div className={styles.searchWidget}>
            <div className={styles.searchTabs}>
              <button 
                className={`${styles.tabBtn} ${activeService === 'rental' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveService('rental')}
              >
                Sewa Mobil
              </button>
              <button 
                className={`${styles.tabBtn} ${activeService === 'travel' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveService('travel')}
              >
                Travel Antar Kota
              </button>

            </div>

            <div className={styles.searchForm}>
              {activeService === 'rental' && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Tipe Armada</label>
                    <select className={styles.inputField}>
                      <option value="">Semua Tipe</option>
                      <option value="premium">Premium SUV</option>
                      <option value="luxury">Luxury MPV</option>
                      <option value="sedan">Executive Sedan</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Tanggal Sewa</label>
                    <input type="date" className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Layanan Tambahan</label>
                    <select className={styles.inputField}>
                      <option value="lepas_kunci">Lepas Kunci</option>
                      <option value="dengan_driver">Dengan Driver</option>
                    </select>
                  </div>
                </>
              )}

              {activeService === 'travel' && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Kota Asal</label>
                    <select className={styles.inputField}>
                      <option value="">Pilih Asal...</option>
                      <option value="jakarta">Jakarta</option>
                      <option value="bandung">Bandung</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Kota Tujuan</label>
                    <select className={styles.inputField}>
                      <option value="">Pilih Tujuan...</option>
                      <option value="bandung">Bandung</option>
                      <option value="jakarta">Jakarta</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Tanggal Keberangkatan</label>
                    <input type="date" className={styles.inputField} />
                  </div>
                </>
              )}



              <button className={styles.searchBtn}>
                Cari Jadwal & Harga
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* ===== 2. FEATURED FLEET (MOBIL) ===== */}
      <section className={styles.fleetSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>Armada Eksklusif</div>
          <h2 className={styles.sectionTitle}>Pilihan Kendaraan Premium</h2>
          <p className={styles.sectionSubtitle}>
            Koleksi kendaraan mewah dan terawat kami, siap memberikan pengalaman perjalanan yang tak terlupakan.
          </p>
        </div>

        <div className={styles.fleetGrid}>
          {featuredCars.length === 0 ? (
            <p style={{ color: '#8a8f98', textAlign: 'center', width: '100%' }}>Memuat armada...</p>
          ) : (
            featuredCars.map(car => (
              <div key={car.id} className={styles.fleetCard}>
                <div className={styles.fleetImageWrapper}>
                  {car.image ? (
                    <img src={getImageUrl(car.image)} alt={car.namaMobil} className={styles.fleetImage} />
                  ) : (
                    <div className={styles.fleetImagePlaceholder}>No Image</div>
                  )}
                  <div className={styles.fleetPriceTag}>
                    <span className={styles.priceAmount}>{formatRupiah(car.hargaPerHari)}</span>
                    <span className={styles.priceUnit}>/ hari</span>
                  </div>
                </div>
                
                <div className={styles.fleetInfo}>
                  <div className={styles.fleetHeader}>
                    <h3 className={styles.fleetName}>{car.namaMobil}</h3>
                    <span className={styles.fleetType}>{car.tipe}</span>
                  </div>
                  
                  <div className={styles.fleetSpecs}>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>💺</span>
                      <span>{car.kursi} Kursi</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>⚙️</span>
                      <span>{car.transmisi}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>🧳</span>
                      <span>{car.bagasi} Bagasi</span>
                    </div>
                  </div>

                  <button className={styles.fleetBtn} onClick={() => handlePesanClick(`/mobil/${car.id}`)}>
                    Lihat Detail & Pesan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/mobil" className={styles.btnOutline}>
            Lihat Semua Armada &rarr;
          </Link>
        </div>
      </section>

      {/* ===== 3. TRAVEL ROUTES ===== */}
      <section className={styles.fleetSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>Executive Travel</div>
          <h2 className={styles.sectionTitle}>Rute Travel Antar Kota</h2>
          <p className={styles.sectionSubtitle}>
            Perjalanan antar kota dengan armada VIP, tepat waktu dan kenyamanan terjamin.
          </p>
        </div>

        <div className={styles.fleetGrid}>
          {travelRoutes.length === 0 ? (
            <p style={{ color: '#8a8f98', textAlign: 'center', width: '100%' }}>Memuat rute travel...</p>
          ) : (
            travelRoutes.map(route => (
              <div key={route.id} className={styles.fleetCard}>
                <div className={styles.fleetImageWrapper}>
                  {route.image ? (
                    <img src={getImageUrl(route.image)} alt={route.armada} className={styles.fleetImage} />
                  ) : (
                    <div className={styles.fleetImagePlaceholder} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '28px' }}>🚐</span>
                      <span>{route.armada || 'Executive'}</span>
                    </div>
                  )}
                  <div className={styles.fleetPriceTag}>
                    <span className={styles.priceAmount}>{formatRupiah(route.hargaTiket)}</span>
                    <span className={styles.priceUnit}>/ seat</span>
                  </div>
                </div>

                <div className={styles.fleetInfo}>
                  <div className={styles.fleetHeader}>
                    <h3 className={styles.fleetName}>{route.asal} → {route.tujuan}</h3>
                    <span className={styles.fleetType}>{route.armada || 'Executive Class'}</span>
                  </div>

                  <div className={styles.fleetSpecs}>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>🕐</span>
                      <span>{route.jadwal || '07:00 WIB'}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>💺</span>
                      <span>Sisa {route.sisaKursi}/{route.totalKursi}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>⏱️</span>
                      <span>{route.estimasiWaktu || '8 Jam'}</span>
                    </div>
                  </div>

                  <button className={styles.fleetBtn} onClick={() => handlePesanClick(`/travel/${route.id}`)}>
                    Pesan Tiket Keberangkatan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/travel" className={styles.btnOutline}>
            Lihat Semua Rute Travel &rarr;
          </Link>
        </div>
      </section>

    </main>
  );
}