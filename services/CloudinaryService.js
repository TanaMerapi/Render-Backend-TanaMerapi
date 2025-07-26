// services/CloudinaryService.js
import { cloudinary } from '../config/cloudinary.js';

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    // Extract the public ID from the URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split('/');
    const filenamePart = urlParts[urlParts.length - 1];
    const publicId = filenamePart.split('.')[0];
    
    // Include folder if present
    const folderIndex = urlParts.indexOf('upload') + 1;
    if (folderIndex < urlParts.length - 1) {
      const folder = urlParts.slice(folderIndex, -1).join('/');
      return folder ? `${folder}/${publicId}` : publicId;
    }
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Delete image from Cloudinary
export const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return;
    }
    
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await cloudinary.v2.uploader.destroy(publicId);
      console.log(`Deleted image with public ID: ${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Optimize image with transformation
export const optimizeImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  try {
    // Default transformations
    const defaultOptions = {
      width: options.width || 800,
      height: options.height || 800,
      crop: options.crop || 'limit',
      quality: options.quality || 'auto',
      format: options.format || 'auto'
    };
    
    // Split URL to insert transformations
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    // Build transformation string
    const transformations = [
      `w_${defaultOptions.width}`,
      `h_${defaultOptions.height}`,
      `c_${defaultOptions.crop}`,
      `q_${defaultOptions.quality}`,
      `f_${defaultOptions.format}`
    ].join(',');
    
    // Return URL with transformations
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return url;
  }
};