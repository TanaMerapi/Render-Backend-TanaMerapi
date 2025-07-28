import MenuItem from '../models/MenuItemModel.js';
import { deleteCloudinaryImage } from '../services/CloudinaryService.js';

// Get all menu items
export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single menu item
export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error(`Error fetching menu item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    // Log request details for debugging
    console.log('Create menu item request:', {
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      } : 'No file uploaded'
    });
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Cloudinary upload is handled by middleware
    const image_url = req.file.path;
    
    if (!image_url) {
      return res.status(400).json({ message: 'Image upload failed - no path returned' });
    }
    
    // Create menu item
    const menuItem = await MenuItem.create({
      name,
      description: description || '',
      image_url,
      price: parseFloat(price)
    });
    
    console.log('Menu item created successfully:', menuItem.id);
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during menu item creation',
      error: error.message 
    });
  }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Log request details for debugging
    console.log('Update menu item request:', {
      id,
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      } : 'No file uploaded'
    });
    
    let image_url = menuItem.image_url;
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (menuItem.image_url && menuItem.image_url.includes('cloudinary')) {
        try {
          await deleteCloudinaryImage(menuItem.image_url);
        } catch (cloudinaryError) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryError);
          // Continue with the update even if image deletion fails
        }
      }
      
      // Set new image URL from Cloudinary
      image_url = req.file.path;
    }
    
    // Update menu item
    await menuItem.update({
      name: name || menuItem.name,
      description: description !== undefined ? description : menuItem.description,
      image_url,
      price: price ? parseFloat(price) : menuItem.price
    });
    
    console.log('Menu item updated successfully:', id);
    res.json(menuItem);
  } catch (error) {
    console.error(`Error updating menu item ${req.params.id}:`, error);
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during menu item update',
      error: error.message 
    });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Delete image from Cloudinary if it exists
    if (menuItem.image_url && menuItem.image_url.includes('cloudinary')) {
      try {
        await deleteCloudinaryImage(menuItem.image_url);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with deletion even if image removal fails
      }
    }
    
    // Delete menu item from database
    await menuItem.destroy();
    
    console.log('Menu item deleted successfully:', id);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error(`Error deleting menu item ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Server error during menu item deletion',
      error: error.message 
    });
  }
};