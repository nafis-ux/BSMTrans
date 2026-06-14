"use client";
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HalamanInvoiceCetak({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const transactionId = resolvedParams.id;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          throw new Error(data.error || "Gagal memuat invoice.");
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

  if (loading) return <p style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>Memuat invoice...</p>;

  if (error) {
    return (
      <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '100px', backgroundColor: '#1c1c1e', padding: '20px', borderRadius: '8px', maxWidth: '500px', margin: '100px auto' }}>
        <h3>🚨 Gagal Memuat Invoice</h3>
        <p>{error}</p>
        <button onClick={() => router.push('/transaksi')} style={{ backgroundColor: '#dfb143', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: '600' }}>
          Kembali ke Transaksi
        </button>
      </div>
    );
  }

  // Bangun deskripsi layanan dinamis
  let deskripsi = "Layanan Transportasi BSMTrans";
  if (transaction?.jenisLayanan === 'SEWA_MOBIL') {
    const carName = transaction.mobil?.namaMobil || "Armada Mobil";
    deskripsi = `Layanan Sewa Mobil - ${carName} (${transaction.durasi} Hari)`;
  } else if (transaction?.jenisLayanan === 'TRAVEL') {
    const asal = transaction.ruteTravel?.asal || "";
    const tujuan = transaction.ruteTravel?.tujuan || "";
    const kursi = transaction.detailManifest?.nomorKursi || "-";
    deskripsi = `Tiket Travel Eksekutif (${asal} ➔ ${tujuan}) [Kursi: ${kursi}]`;
  } else if (transaction?.jenisLayanan === 'DROP_OFF') {
    const dest = transaction.detailManifest?.destinasi || "";
    deskripsi = `Layanan Drop Off Eksklusif ke ${dest}`;
  }

  const customerName = transaction?.detailManifest?.namaPelanggan || 
                       transaction?.detailManifest?.namaPenumpang || 
                       transaction?.detailManifest?.namaLengkap || 
                       "Pelanggan BSMTrans";

  const nominalAsli = transaction?.totalHarga || 0;

  return (
    <div style={{ backgroundColor: '#090a0f', minHeight: '100vh', padding: '40px 20px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BAR AKSI ATAS - DISKIP OTOMATIS SAAT PRINTER JALAN */}
      <div className="no-print" style={{ maxWidth: '750px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#8a8f98', cursor: 'pointer' }}>
          ← Kembali
        </button>
        <button onClick={() => window.print()} style={{ backgroundColor: '#dfb143', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          🖨️ Cetak Invoice / Unduh PDF
        </button>
      </div>

      {/* BLOK STRUK INVOICE */}
      <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#111217', borderRadius: '12px', padding: '40px', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* ROW ATAS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#dfb143', margin: 0, fontWeight: '800' }}>BSM<span style={{ color: '#fff' }}>TRANS</span></h2>
            <p style={{ color: '#8a8f98', fontSize: '13px', margin: '4px 0 0 0' }}>PT. Banyuwangi Sahabat Mandiri Trans</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ backgroundColor: 'rgba(40, 167, 69, 0.15)', color: '#28a745', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
              {transaction?.status === 'LUNAS' ? 'LUNAS TOTAL' : transaction?.status}
            </span>
            <h4 style={{ margin: '8px 0 0 0', fontFamily: 'monospace', fontSize: '16px' }}>INV/{transactionId}</h4>
          </div>
        </div>

        {/* DETAIL PIHAK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '13px', color: '#ccc' }}>
          <div>
            <b style={{ color: '#8a8f98', display: 'block', marginBottom: '4px' }}>DITERBITKAN OLEH:</b>
            BSMTrans Admin System<br />
            Kec. Giri, Kabupaten Banyuwangi
          </div>
          <div style={{ textAlign: 'right' }}>
            <b style={{ color: '#8a8f98', display: 'block', marginBottom: '4px' }}>DITUJUKAN KEPADA:</b>
            {customerName}<br />
            Manifes Terverifikasi Aman
          </div>
        </div>

        {/* TABEL RINCIAN */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#8a8f98' }}>
              <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Deskripsi Layanan</th>
              <th style={{ textAlign: 'right', paddingBottom: '10px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '15px 0', fontWeight: '500' }}>{deskripsi}</td>
              <td style={{ padding: '15px 0', textAlign: 'right' }}>Rp {nominalAsli.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td style={{ padding: '15px 0 0 0', textAlign: 'right', color: '#8a8f98' }}>Grand Total Pembayaran:</td>
              <td style={{ padding: '15px 0 0 0', textAlign: 'right', fontWeight: '700', color: '#dfb143', fontSize: '18px' }}>Rp {nominalAsli.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <div style={{ marginTop: '50px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#8a8f98' }}>
          Terima kasih telah menggunakan jasa armada layanan transportasi kami.
        </div>
      </div>

      {/* LOGIKA CSS PRINT MEDIA */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
        }
      `}</style>
    </div>
  );
}