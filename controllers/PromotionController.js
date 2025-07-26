import Promotion from '../models/PromotionModel.js';
import Package from '../models/PackageModel.js';
import PromotionPackage from '../models/PromotionPackageModel.js';
import fs from 'fs';
import path from 'path';
import { 
  applyPromotionToPackages, 
  removePromotionFromPackages,
  checkExpiredPromotions,
  getFirstPackageImage
} from '../services/PromotionService.js';

// Get all promotions
export const getPromotions = async (req, res) => {
  try {
    // Check for expired promotions first
    await checkExpiredPromotions();
    
    const promotions = await Promotion.findAll({
      include: [
        { 
          model: Package, 
          as: 'packages',
          through: { attributes: [] } // Don't include junction table
        }
      ]
    });
    res.json(promotions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single promotion
export const getPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findByPk(id, {
      include: [
        { 
          model: Package, 
          as: 'packages',
          through: { attributes: [] } // Don't include junction table
        }
      ]
    });
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json(promotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new promotion
export const createPromotion = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      terms, 
      valid_from, 
      valid_until, 
      discount_percent,
      package_ids
    } = req.body;
    
    // Parse package_ids if it's a string
    let packageIds = package_ids;
    if (typeof package_ids === 'string') {
      try {
        packageIds = JSON.parse(package_ids);
      } catch (e) {
        console.error('Error parsing package_ids:', e);
        return res.status(400).json({ message: 'Invalid package_ids format' });
      }
    }
    
    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({ message: 'At least one package must be selected' });
    }
    
    // Get image from first package if no image was uploaded
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else {
      image_url = await getFirstPackageImage(packageIds);
    }
    
    // Create promotion
    const promotion = await Promotion.create({
      title,
      description,
      terms,
      valid_from,
      valid_until,
      discount_percent,
      image_url,
      status: 'active'
    });
    
    // Add packages to promotion
    const promotionPackages = packageIds.map(package_id => ({
      promotion_id: promotion.id,
      package_id
    }));
    
    await PromotionPackage.bulkCreate(promotionPackages);
    
    // Apply promotion to packages
    await applyPromotionToPackages(promotion, packageIds);
    
    // Fetch created promotion with packages
    const createdPromotion = await Promotion.findByPk(promotion.id, {
      include: [
        { 
          model: Package, 
          as: 'packages',
          through: { attributes: [] } // Don't include junction table
        }
      ]
    });
    
    res.status(201).json(createdPromotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a promotion
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      terms, 
      valid_from, 
      valid_until, 
      discount_percent,
      package_ids
    } = req.body;
    
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    // Parse package_ids if it's a string
    let packageIds = package_ids;
    if (typeof package_ids === 'string') {
      try {
        packageIds = JSON.parse(package_ids);
      } catch (e) {
        console.error('Error parsing package_ids:', e);
        return res.status(400).json({ message: 'Invalid package_ids format' });
      }
    }
    
    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({ message: 'At least one package must be selected' });
    }
    
    // First, remove promotion from current packages
    await removePromotionFromPackages(promotion.id);
    
    // Handle image
    let image_url = promotion.image_url;
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image if it exists
      if (promotion.image_url) {
        const oldImagePath = path.join(process.cwd(), 'public', promotion.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image URL
      image_url = `/uploads/${req.file.filename}`;
    } else if (!image_url) {
      // If no image and no previous image, get from first package
      image_url = await getFirstPackageImage(packageIds);
    }
    
    // Update promotion
    await promotion.update({
      title: title || promotion.title,
      description: description !== undefined ? description : promotion.description,
      terms: terms !== undefined ? terms : promotion.terms,
      valid_from: valid_from || promotion.valid_from,
      valid_until: valid_until || promotion.valid_until,
      discount_percent: discount_percent || promotion.discount_percent,
      image_url,
      status: 'active'
    });
    
    // Remove all current promotion-package associations
    await PromotionPackage.destroy({
      where: { promotion_id: id }
    });
    
    // Add new packages to promotion
    const promotionPackages = packageIds.map(package_id => ({
      promotion_id: promotion.id,
      package_id
    }));
    
    await PromotionPackage.bulkCreate(promotionPackages);
    
    // Apply promotion to packages
    await applyPromotionToPackages(promotion, packageIds);
    
    // Fetch updated promotion with packages
    const updatedPromotion = await Promotion.findByPk(id, {
      include: [
        { 
          model: Package, 
          as: 'packages',
          through: { attributes: [] } // Don't include junction table
        }
      ]
    });
    
    res.json(updatedPromotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    // Remove promotion from packages
    await removePromotionFromPackages(promotion.id);
    
    // Delete image file if it exists
    if (promotion.image_url) {
      const imagePath = path.join(process.cwd(), 'public', promotion.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete promotion packages first
    await PromotionPackage.destroy({
      where: { promotion_id: id }
    });
    
    // Delete promotion from database
    await promotion.destroy();
    
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};