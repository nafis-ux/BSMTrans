"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/DropOff.module.css';

export default function DropOffPage() {
  const router = useRouter();
  const [dropOffServices, setDropOffServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDropOffs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dropoff');
        if (res.ok) {
          const data = await res.json();
          setDropOffServices(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data drop off:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDropOffs();
  }, []);

  const handlePesanClick = (serviceId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pemesanan.");
      router.push('/login');
      return;
    }
    if (serviceId === 'custom-drop') {
      router.push('/dropoff/custom');
    } else {
      router.push(`/dropoff/${serviceId}`);
    }
  };

  return (
    <main className={styles.main}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Private Transfer</div>
          <h1 className={styles.title}>
            Layanan <span className={styles.titleHighlight}>Drop Off.</span>
          </h1>
          <p className={styles.subtitle}>
            Solusi perjalanan sekali jalan (one-way) point-to-point dengan kenyamanan maksimal dan privasi penuh. 
            Antar jemput VIP eksklusif untuk Anda.
          </p>
        </div>
      </section>

      {/* 2. DROPOFF SERVICES LIST */}
      <section className={styles.dropOffSection}>
        {loading ? (
          <p style={{ color: '#8a8f98', textAlign: 'center', marginTop: '50px' }}>Memuat layanan Drop Off...</p>
        ) : (
          <div className={styles.grid}>
            {dropOffServices.length > 0 ? (
              dropOffServices.map((service) => (
                <div key={service.id} className={styles.card}>
                  
                  <div className={styles.cardHeader}>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardLabel}>{service.tag || 'Layanan Drop Off'}</span>
                      <h2 className={styles.cardName}>
                        {service.destinasi}
                      </h2>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '13px', color: '#a0a5b1' }}>
                      <div><span style={{color:'#dfb143'}}>ℹ️ Detail:</span> {service.deskripsi}</div>
                      <div><span style={{color:'#dfb143'}}>⏱️ Est. Waktu:</span> {service.estimasiWaktu || 'Waktu Fleksibel'}</div>
                    </div>
                  </div>

                  <div className={styles.details}>
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Tarif Nett (All In)</span>
                      <div className={styles.priceValue}>
                        {service.harga > 0 ? `Rp ${service.harga.toLocaleString('id-ID')}` : 'Hubungi Admin'}
                      </div>
                    </div>
                  </div>

                  {service.id === 'custom-drop' ? (
                    <button 
                      onClick={() => handlePesanClick('custom-drop')} 
                      className={styles.btnPesan}
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    >
                      Pesan Custom Drop Off
                    </button>
                  ) : (
                    <button onClick={() => handlePesanClick(service.id)} className={styles.btnPesan}>
                      Pesan Layanan Drop Off
                    </button>
                  )}

                </div>
              ))
            ) : (
              <div style={{ color: '#8a8f98', textAlign: 'center', gridColumn: '1 / -1', padding: '50px' }}>
                <h3>Belum ada layanan Drop Off yang tersedia saat ini.</h3>
              </div>
            )}
          </div>
        )}
      </section>

      <div style={{ height: '10vh' }}></div>
    </main>
  );
}
