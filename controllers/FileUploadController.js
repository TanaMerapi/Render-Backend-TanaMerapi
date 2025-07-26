// FileUploadController.js
export const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    // Cloudinary uploads return the URL in req.file.path
    const fileUrl = req.file.path;
    
    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.originalname,
      format: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};