// PromotionService.js
import Promotion from '../models/PromotionModel.js';
import Package from '../models/PackageModel.js';
import PromotionPackage from '../models/PromotionPackageModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';
import { deleteCloudinaryImage } from '../services/CloudinaryService.js';

export const applyPromotionToPackages = async (promotion, packageIds) => {
  const transaction = await db.transaction();
  
  try {
    // Get the packages
    const packages = await Package.findAll({
      where: {
        id: {
          [Op.in]: packageIds
        }
      },
      transaction
    });
    
    // Apply discount to each package
    for (const pkg of packages) {
      // Store original price if not already stored
      if (!pkg.original_price) {
        await pkg.update({
          original_price: pkg.price,
          discount_percent: promotion.discount_percent,
          promotion_id: promotion.id
        }, { transaction });
      }
      
      // Calculate discounted price
      const discountedPrice = pkg.original_price - (pkg.original_price * promotion.discount_percent / 100);
      
      // Update package price
      await pkg.update({
        price: discountedPrice,
        discount_percent: promotion.discount_percent,
        promotion_id: promotion.id
      }, { transaction });
    }
    
    // Commit transaction
    await transaction.commit();
    return true;
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    throw error;
  }
};

export const removePromotionFromPackages = async (promotionId) => {
  const transaction = await db.transaction();
  
  try {
    // Find packages with this promotion
    const packages = await Package.findAll({
      where: {
        promotion_id: promotionId
      },
      transaction
    });
    
    // Restore original prices
    for (const pkg of packages) {
      if (pkg.original_price) {
        await pkg.update({
          price: pkg.original_price,
          original_price: null,
          discount_percent: null,
          promotion_id: null
        }, { transaction });
      }
    }
    
    // Commit transaction
    await transaction.commit();
    return true;
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    throw error;
  }
};

export const checkExpiredPromotions = async () => {
  const now = new Date();
  
  try {
    // Find expired active promotions
    const expiredPromotions = await Promotion.findAll({
      where: {
        valid_until: {
          [Op.lt]: now
        },
        status: 'active'
      }
    });
    
    for (const promotion of expiredPromotions) {
      // Remove promotion from packages
      await removePromotionFromPackages(promotion.id);
      
      // Update promotion status
      await promotion.update({
        status: 'expired'
      });
    }
    
    return expiredPromotions.length;
  } catch (error) {
    console.error('Error checking expired promotions:', error);
    throw error;
  }
};

// Function to get first package image for promotion
export const getFirstPackageImage = async (packageIds) => {
  if (!packageIds || !packageIds.length) return null;
  
  try {
    const firstPackage = await Package.findByPk(packageIds[0]);
    return firstPackage ? firstPackage.image_url : null;
  } catch (error) {
    console.error('Error getting package image:', error);
    return null;
  }
};

// New function to cleanup Cloudinary images when promotion is deleted
export const cleanupPromotionImages = async (promotionId) => {
  try {
    const promotion = await Promotion.findByPk(promotionId);
    
    if (promotion && promotion.image_url && promotion.image_url.includes('cloudinary')) {
      // Delete the promotion image from Cloudinary
      await deleteCloudinaryImage(promotion.image_url);
      console.log(`Deleted promotion image for ID: ${promotionId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error cleaning up promotion images:', error);
    throw error;
  }
};