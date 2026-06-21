'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/utils/getImageUrl';
import Link from 'next/link';
import styles from '@/styles/Travel.module.css';

export default function TravelPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/travel`);
        const data = await response.json();
        setRoutes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal memuat rute travel:", error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const handlePesanClick = (routeId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }
    router.push(`/travel/${routeId}`);
  };

  return (
    <main className={styles.main}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Executive Travel</div>
          <h1 className={styles.title}>
            Kenyamanan <span className={styles.titleHighlight}>Antar Kota.</span>
          </h1>
          <p className={styles.subtitle}>
            Layanan travel eksekutif dengan armada premium VIP, menjamin perjalanan antar kota Anda 
            tetap tepat waktu, eksklusif, dan tanpa rasa lelah.
          </p>
        </div>
      </section>

      {/* 2. ROUTES LIST */}
      <section className={styles.routesSection}>
        {loading ? (
          <p style={{ color: '#8a8f98', textAlign: 'center', marginTop: '50px' }}>Memuat jadwal keberangkatan...</p>
        ) : (
          <div className={styles.travelGrid}>
            {routes.length > 0 ? (
              routes.map((route) => (
                <div key={route.id} className={styles.travelCard}>
                  
                  {route.image ? (
                    <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                      <img src={getImageUrl(route.image)} alt={route.armada} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  
                  <div className={styles.routeHeader}>
                    <div className={styles.routeInfo}>
                      <span className={styles.routeLabel}>Route Tersedia</span>
                      <h2 className={styles.routeName}>
                        {route.asal} <span className={styles.routeArrow}>&rarr;</span> {route.tujuan}
                      </h2>
                    </div>
                    <div className={styles.timeTag}>
                      {route.jadwal || "07:00 WIB"}
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#a0a5b1' }}>
                      <div><span style={{color:'#dfb143'}}>⏱️ Est. Waktu:</span> {route.estimasiWaktu || '8 Jam'}</div>
                      <div><span style={{color:'#dfb143'}}>💺 Kursi:</span> Sisa {route.sisaKursi} dari {route.totalKursi}</div>
                      <div><span style={{color:'#dfb143'}}>📍 Naik:</span> {route.titikKumpul || 'Pool BSM'}</div>
                      <div><span style={{color:'#dfb143'}}>🏁 Turun:</span> {route.titikTurun || 'Terminal Tujuan'}</div>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '12px', color: '#8a8f98' }}>
                      <span style={{color:'#fff', fontWeight: '600'}}>Fasilitas: </span> {route.fasilitas || 'AC, Reclining Seat'}
                    </div>
                  </div>

                  <div className={styles.details}>
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Tarif / Penumpang</span>
                      <div className={styles.priceValue}>
                        Rp {route.hargaTiket ? route.hargaTiket.toLocaleString('id-ID') : '0'}
                      </div>
                    </div>

                    <div className={styles.fleetBlock}>
                      <span className={styles.fleetIcon}>🚐</span>
                      <span className={styles.fleetName}>
                        {route.armada || "Executive Class"}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handlePesanClick(route.id)} className={styles.btnPesan}>
                    Pesan Tiket Keberangkatan
                  </button>

                </div>
              ))
            ) : (
              <div style={{ color: '#8a8f98', textAlign: 'center', gridColumn: '1 / -1', padding: '50px' }}>
                <h3>Belum ada rute travel yang tersedia saat ini.</h3>
                <p>Silakan periksa kembali nanti atau hubungi customer service kami.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <div style={{ height: '10vh' }}></div>
    </main>
  );
}