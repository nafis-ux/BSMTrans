const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Konfigurasi menggunakan .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage untuk gambar mobil/travel
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bsmtrans_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const uploadCloudinary = multer({ storage: cloudinaryStorage });

module.exports = {
  cloudinary,
  uploadCloudinary
};
