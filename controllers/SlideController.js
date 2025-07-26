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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new slide
export const createSlide = async (req, res) => {
  try {
    const { title, order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Cloudinary upload is handled by middleware
    const image_url = req.file.path;
    
    const slide = await Slide.create({
      title,
      image_url,
      order: order || 0
    });
    
    res.status(201).json(slide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a slide
export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;
    
    const slide = await Slide.findByPk(id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    
    let image_url = slide.image_url;
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (slide.image_url) {
        await deleteCloudinaryImage(slide.image_url);
      }
      
      // Set new image URL from Cloudinary
      image_url = req.file.path;
    }
    
    // Update slide
    await slide.update({
      title: title || slide.title,
      image_url,
      order: order !== undefined ? order : slide.order
    });
    
    res.json(slide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
      await deleteCloudinaryImage(slide.image_url);
    }
    
    // Delete slide from database
    await slide.destroy();
    
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};