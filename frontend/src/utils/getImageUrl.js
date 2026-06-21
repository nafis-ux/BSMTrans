export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg'; // Gambar fallback
  
  // Jika path sudah berupa URL utuh (Cloudinary), langsung gunakan
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Jika masih format lama (nama file lokal)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${imagePath}`;
};
