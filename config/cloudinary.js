// =============================================================================
// DEPENDENCIES
// =============================================================================

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// =============================================================================
// CLOUDINARY CONFIGURATION
// =============================================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// =============================================================================
// STORAGE CONFIGURATION
// =============================================================================

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cats',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  }
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  cloudinary,
  storage
};