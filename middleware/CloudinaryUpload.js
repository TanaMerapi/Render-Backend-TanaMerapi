import { uploadCloud } from '../config/cloudinary.js';

// More detailed logging for debugging
const logUploadRequest = (req) => {
  console.log('Upload request details:');
  console.log('- Headers:', req.headers);
  console.log('- Body fields:', Object.keys(req.body || {}));
  console.log('- Files:', req.files || req.file || 'No files attached');
};

// Middleware wrapper with error handling
const createMiddleware = (uploadFunction) => {
  return (req, res, next) => {
    console.log(`Processing ${req.method} upload request to ${req.originalUrl}`);
    
    uploadFunction(req, res, (err) => {
      if (err) {
        console.error('Upload middleware error:', err);
        
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
        
        return res.status(500).json({ 
          message: 'Error uploading file',
          error: err.message
        });
      }
      
      // Log file information after successful upload
      if (req.file) {
        console.log('File uploaded successfully:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          path: req.file.path,
          size: req.file.size
        });
      }
      
      next();
    });
  };
};

// Export middleware for different upload types
export const singleUpload = createMiddleware(uploadCloud.single('image'));
export const multipleUpload = createMiddleware(uploadCloud.array('images', 5));

// Specific middlewares for different entities
export const menuItemUpload = createMiddleware(uploadCloud.single('image'));
export const packageUpload = createMiddleware(uploadCloud.single('image'));
export const promotionUpload = createMiddleware(uploadCloud.single('image'));
export const slideUpload = createMiddleware(uploadCloud.single('image'));
export const settingUpload = createMiddleware(uploadCloud.single('image'));
export const fileUpload = createMiddleware(uploadCloud.single('file'));

// Diagnostic middleware to check request content
export const uploadDiagnostic = (req, res, next) => {
  logUploadRequest(req);
  
  // Check for common issues
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    console.warn('Warning: Request does not have multipart/form-data Content-Type');
  }
  
  next();
};

// Export a troubleshooting endpoint
export const troubleshootUpload = (req, res) => {
  logUploadRequest(req);
  
  res.json({
    success: true,
    message: 'Upload request received and logged',
    requestDetails: {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      method: req.method,
      url: req.originalUrl,
      bodyFields: Object.keys(req.body || {}),
      hasFiles: !!req.file || !!req.files,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    }
  });
};