"use client";
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Pembayaran.module.css';

export default function DetailTransaksiPembayaranPage({ params }) {
  const resolvedParams = use(params);
  const transactionId = resolvedParams.id;
  const router = useRouter();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Sesi Anda telah berakhir, silakan login kembali.");
        setLoading(false);
        router.push('/login');
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/${transactionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Gagal memuat data transaksi.");
        }
        setTransaction(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, router]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Pilih berkas gambar bukti transfer terlebih dahulu!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sesi Anda berakhir, silakan login kembali.");
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('buktiDP', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/${transactionId}/bukti-dp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengunggah bukti pembayaran.");
      }

      alert("Bukti pembayaran DP berhasil diunggah! Admin kami akan segera memverifikasinya.");
      // Reload transaction data
      setTransaction(prev => prev ? { ...prev, status: result.status } : null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>Memuat rincian pembayaran...</p>;

  if (error) {
    return (
      <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '100px', backgroundColor: '#1c1c1e', padding: '20px', borderRadius: '8px', maxWidth: '500px', margin: '100px auto' }}>
        <h3>🚨 Gagal Memuat Pembayaran</h3>
        <p>{error}</p>
        <button onClick={() => router.push('/transaksi')} style={{ backgroundColor: '#dfb143', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: '600' }}>
          Kembali ke Transaksi
        </button>
      </div>
    );
  }

  const statusLower = transaction?.status?.toLowerCase();
  
  // DP adalah 50% dari total tagihan
  const totalTagihan = transaction?.totalHarga || 0;
  const nominalDP = totalTagihan * 0.5;

  const getProgressWidth = () => {
    if (statusLower === 'pending') return "0%";
    if (statusLower === 'lunas') return "100%";
    return "50%";
  };

  const isStepActive = (step) => {
    if (step === 1) return true;
    if (step === 2) return statusLower !== 'pending';
    if (step === 3) return statusLower === 'lunas';
    return false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.paymentCard}>
        
        {/* HEADER */}
        <h1 className={styles.title}>Pembayaran DP (50%)</h1>
        <p className={styles.subtitle}>Selesaikan pembayaran untuk pesanan #{transactionId}</p>

        {/* HARGA */}
        <div className={styles.priceSection}>
          <span className={styles.priceLabel}>Nominal DP yang Harus Dibayar</span>
          <div className={styles.priceValue}>Rp {nominalDP.toLocaleString('id-ID')}</div>
          <span style={{ color: '#8a8f98', fontSize: '12px', display: 'block', marginTop: '4px' }}>
            (Total Tagihan: Rp {totalTagihan.toLocaleString('id-ID')})
          </span>
        </div>

        {/* GRID KONTEN TENGAH */}
        <div className={styles.contentGrid}>
          
          {/* KIRI: QR CODE */}
          <div className={styles.qrWrapper}>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#16171a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: '13px', textAlign: 'left' }}>
              <strong>Bank BCA:</strong> 123-456-7890<br/>
              a/n PT. BSM Trans Mandiri
            </div>
            <div className={styles.qrBox}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BSMTrans-DP-${transactionId}-${nominalDP}`}
                alt="QRIS BSMTrans"
                width={150}
                height={150}
              />
            </div>
            <p className={styles.qrText}>
              Scan QRIS untuk pembayaran instant via E-Wallet
            </p>
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#16171a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: '13px', textAlign: 'left' }}>
              <strong>Bank BCA:</strong> 2630677095<br/>
              a/n HADIP FAHMI
            </div>
          </div>

          {/* KANAN: FORM UPLOAD */}
          <div className={styles.uploadBox}>
            <h3 className={styles.uploadTitle}>Upload Bukti Pembayaran DP</h3>
            
            {statusLower === 'pending' ? (
              <>
                <label className={styles.dropzone}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={handleFileChange} 
                  />
                  <div className={styles.uploadIcon}>🖴</div>
                  <p className={styles.dropzoneText}>
                    <span>Klik untuk upload</span> atau drag and drop
                  </p>
                  <p className={styles.fileHint}>Resi transfer (PNG, JPG up to 5MB)</p>
                  
                  {fileName && (
                    <div className={styles.fileSelected}>✓ {fileName}</div>
                  )}
                </label>

                <button 
                  className={styles.btnSubmit} 
                  onClick={handleUploadSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Bukti DP"}
                </button>
              </>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ color: '#dfb143', fontWeight: '600', marginBottom: '8px' }}>✓ Bukti DP Telah Dikirim</p>
                <p style={{ color: '#aaa', fontSize: '13px' }}>
                  Status saat ini: <strong>{transaction?.status}</strong>
                </p>
                {statusLower === 'verifikasi_dp' && (
                  <p style={{ color: '#8a8f98', fontSize: '12px', marginTop: '10px' }}>
                    Mohon tunggu verifikasi admin untuk mengaktifkan pemesanan Anda.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        <hr className={styles.statusDivider} />

        {/* STATUS PROGRESS TRACKER */}
        <div className={styles.statusHeader}>Status Pembayaran</div>
        
        <div className={styles.statusTrack}>
          <div 
            className={styles.statusLineProgress} 
            style={{ 
              width: getProgressWidth() 
            }}
          ></div>
          <div className={styles.statusLine}></div>

          {/* Step 1: Pending */}
          <div className={styles.step}>
            <div className={`${styles.circle} ${isStepActive(1) ? styles.circleActive : ''}`}>🕒</div>
            <span className={`${styles.stepLabel} ${isStepActive(1) ? styles.labelActive : ''}`}>Pending</span>
          </div>

          {/* Step 2: Verifikasi */}
          <div className={styles.step}>
            <div className={`${styles.circle} ${isStepActive(2) ? styles.circleActive : ''}`}>⌛</div>
            <span className={`${styles.stepLabel} ${isStepActive(2) ? styles.labelActive : ''}`}>Verifikasi</span>
          </div>

          {/* Step 3: Lunas */}
          <div className={styles.step}>
            <div className={`${styles.circle} ${isStepActive(3) ? styles.circleActive : ''}`}>✓</div>
            <span className={`${styles.stepLabel} ${isStepActive(3) ? styles.labelActive : ''}`}>Lunas</span>
          </div>
        </div>

      </div>
    </div>
  );
}