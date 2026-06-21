export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x400/131416/dfb143?text=No+Image'; // Gambar fallback online
  
  const cleanPath = String(imagePath).trim();

  // Jika path sudah berupa URL utuh (Cloudinary), langsung gunakan
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.includes('cloudinary.com')) {
    return cleanPath;
  }
  
  // Jika masih format lama (nama file lokal)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${cleanPath}`;
};
