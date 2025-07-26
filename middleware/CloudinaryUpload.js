// middleware/CloudinaryUpload.js
import { uploadCloud } from '../config/cloudinary.js';

// Export middleware for different upload types
export const singleUpload = uploadCloud.single('image');
export const multipleUpload = uploadCloud.array('images', 5);

// Specific middlewares for different entities
export const menuItemUpload = uploadCloud.single('image');
export const packageUpload = uploadCloud.single('image');
export const promotionUpload = uploadCloud.single('image');
export const slideUpload = uploadCloud.single('image');
export const settingUpload = uploadCloud.single('image');
export const fileUpload = uploadCloud.single('file');

// Error handling middleware for Cloudinary uploads
export const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        message: 'File too large, maximum size is 5MB' 
      });
    }
    
    if (err.name === 'MulterError') {
      return res.status(400).json({ 
        message: `Upload error: ${err.message}` 
      });
    }
    
    // Handle other errors
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ message: 'Error uploading file' });
  }
  
  next();
};