import Slide from '../models/SlideModel.js';
import { deleteCloudinaryImage } from '../services/CloudinaryService.js';

// Get all slides
export const getSlides = async (req, res) => {
  try {
    const slides = await Slide.findAll({
      order: [['order', 'ASC']]
    });
    res.json(slides);
  } catch (error) {
    console.error('Error fetching slides:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new slide
export const createSlide = async (req, res) => {
  try {
    console.log('Create slide request:', {
      body: req.body,
      file: req.file ? {
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype
      } : 'No file attached'
    });
    
    const { title, order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Check if Cloudinary upload was successful
    if (!req.file.path) {
      console.error('Cloudinary upload failed - no path returned');
      return res.status(500).json({ message: 'Image upload failed - no path returned from storage provider' });
    }
    
    // Cloudinary upload is handled by middleware
    const image_url = req.file.path;
    
    console.log('Creating slide with image_url:', image_url);
    
    const slide = await Slide.create({
      title,
      image_url,
      order: order || 0
    });
    
    console.log('Slide created successfully:', {
      id: slide.id,
      title: slide.title,
      image_url: slide.image_url
    });
    
    res.status(201).json(slide);
  } catch (error) {
    console.error('Error creating slide:', error);
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during slide creation',
      error: error.message 
    });
  }
};

// Update a slide
export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;
    
    console.log('Update slide request:', {
      id,
      body: req.body,
      file: req.file ? {
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype
      } : 'No file attached'
    });
    
    const slide = await Slide.findByPk(id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    
    let image_url = slide.image_url;
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (slide.image_url) {
        try {
          await deleteCloudinaryImage(slide.image_url);
        } catch (cloudinaryError) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryError);
          // Continue with the update even if image deletion fails
        }
      }
      
      // Set new image URL from Cloudinary
      image_url = req.file.path;
      console.log('New image path:', image_url);
    }
    
    // Update slide
    await slide.update({
      title: title || slide.title,
      image_url,
      order: order !== undefined ? order : slide.order
    });
    
    console.log('Slide updated successfully:', {
      id: slide.id,
      title: slide.title,
      image_url: slide.image_url
    });
    
    res.json(slide);
  } catch (error) {
    console.error(`Error updating slide ${req.params.id}:`, error);
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during slide update',
      error: error.message 
    });
  }
};

// Delete a slide
export const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slide = await Slide.findByPk(id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    
    // Delete image from Cloudinary if it exists
    if (slide.image_url) {
      try {
        await deleteCloudinaryImage(slide.image_url);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with deletion even if image removal fails
      }
    }
    
    // Delete slide from database
    await slide.destroy();
    
    console.log('Slide deleted successfully:', id);
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    console.error(`Error deleting slide ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Server error during slide deletion',
      error: error.message 
    });
  }
};