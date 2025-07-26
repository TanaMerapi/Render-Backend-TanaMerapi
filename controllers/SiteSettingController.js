// SiteSettingController.js
import SiteSetting from '../models/SiteSettingModel.js';
import { deleteCloudinaryImage } from '../services/CloudinaryService.js';

// Get all site settings
export const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.findAll();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get site setting by key
export const getSiteSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await SiteSetting.findOne({ where: { key } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update or create site setting
export const updateSiteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type } = req.body;
    
    let setting = await SiteSetting.findOne({ where: { key } });
    
    if (setting) {
      // If key is for image type and there's a file upload
      if ((key === 'home_image' || type === 'image') && req.file) {
        // Delete old image from Cloudinary if it exists
        if (setting.value && setting.value.includes('cloudinary')) {
          await deleteCloudinaryImage(setting.value);
        }
        
        // Set new image URL from Cloudinary
        await setting.update({ 
          value: req.file.path,
          type: 'image'
        });
      } else {
        // Update text value
        await setting.update({ 
          value: value || setting.value,
          type: type || setting.type
        });
      }
    } else {
      // Create new setting
      if ((key === 'home_image' || type === 'image') && req.file) {
        setting = await SiteSetting.create({
          key,
          value: req.file.path,
          type: 'image'
        });
      } else {
        setting = await SiteSetting.create({
          key,
          value,
          type: type || 'text'
        });
      }
    }
    
    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};