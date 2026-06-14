"use client";
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Booking.module.css';

export default function BayarSisaLayanan({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const transactionId = resolvedParams.id;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Sesi berakhir, silakan login kembali.");
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
          throw new Error(data.error || "Gagal memuat rincian transaksi.");
        }
        setTransaction(data);
      } catch (err) {
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
      setUploadedFile(selectedFile.name);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Harap pilih gambar resi bukti pelunasan bank!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sesi berakhir, silakan login kembali.");
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('buktiSisa', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transaksi/${transactionId}/bukti-sisa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim bukti pelunasan.");
      }

      alert("Bukti pelunasan sisa tagihan Anda berhasil dikirim ke admin BSMTrans!");
      router.push('/transaksi');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>Memuat data pelunasan...</p>;

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

  // Pelunasan sisa tagihan (biasanya 50% sisanya)
  const nominalSisa = transaction ? (transaction.totalHarga * 0.5) : 0;

  return (
    <div className={styles.container} style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ backgroundColor: '#111217', borderRadius: '14px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#dfb143', cursor: 'pointer', marginBottom: '20px' }}>
          ← Kembali ke Transaksi
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Pelunasan Sisa Pembayaran</h2>
        <p style={{ color: '#8a8f98', fontSize: '14px', marginBottom: '24px' }}>Silakan selesaikan sisa pembayaran untuk Invoice ID: <strong>#{transactionId}</strong></p>

        {/* Info Box Nominal */}
        <div style={{ backgroundColor: 'rgba(223, 177, 67, 0.08)', borderLeft: '4px solid #dfb143', padding: '16px', borderRadius: '4px', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', color: '#8a8f98', display: 'block' }}>Sisa Tagihan yang Harus Dilunasi</span>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#dfb143' }}>Rp {nominalSisa.toLocaleString('id-ID')}</span>
        </div>

        {/* Form Upload */}
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#fff' }}>Metode Transfer Bank Pengelola</label>
            <div style={{ padding: '14px', backgroundColor: '#16171a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: '14px' }}>
              <strong>Bank BCA:</strong> 123-456-7890 a/n PT. BSM Trans Mandiri
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#fff' }}>Unggah Slip/Struk Bukti Pelunasan</label>
            <input 
              type="file" 
              accept="image/*" 
              id="file-sisa" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <label htmlFor="file-sisa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#16171a' }}>
              {uploadedFile ? `📸 ${uploadedFile}` : "📁 Pilih File Gambar Resi"}
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ width: '100%', backgroundColor: '#dfb143', color: '#000', border: 'none', height: '48px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            {isSubmitting ? "Mengirim Data..." : "Kirim Bukti Pelunasan →"}
          </button>
        </form>

      </div>
    </div>
  );
}