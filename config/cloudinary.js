import { v2 as cloudinaryV2 } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// More verbose configuration with error handling
const configureCloudinary = () => {
  // Check if required env variables are set
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required Cloudinary environment variables:', missingVars);
    console.error('File uploads will not work correctly!');
  }
  
  // Configure Cloudinary
  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  console.log(`Cloudinary configured with cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  
  return cloudinaryV2;
};

// Initialize Cloudinary
const cloudinary = configureCloudinary();

// Setup storage with more robust error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tanah-merapi',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    // Add a public_id prefix to avoid name collisions
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      return `upload-${uniqueSuffix}`;
    }
  }
});

// Create multer upload middleware with limits
const uploadCloud = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    
    cb(null, true);
  }
});

// Export both the cloudinary instance and the upload middleware
export { cloudinary, uploadCloud };