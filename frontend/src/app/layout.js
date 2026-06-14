import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'BSMTrans - Solusi Transportasi Mudah & Cepat',
  description: 'Layanan Sewa Mobil dan Travel Eksekutif',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        {/* Footer bisa ditambahkan di sini nanti */}
      </body>
    </html>
  );
}