// utils/PromotionScheduler.js
import { checkExpiredPromotions } from '../services/PromotionService.js';

// Check for expired promotions every hour
const PROMOTION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize scheduler
const initPromotionScheduler = () => {
  console.log('Starting promotion scheduler...');
  
  // Run immediately on startup
  checkExpiredPromotions()
    .then(count => {
      console.log(`Initial check: ${count} expired promotions processed`);
    })
    .catch(error => {
      console.error('Error during initial promotion check:', error);
    });
  
  // Schedule periodic checks
  setInterval(async () => {
    try {
      const count = await checkExpiredPromotions();
      console.log(`Scheduled check: ${count} expired promotions processed`);
    } catch (error) {
      console.error('Error during scheduled promotion check:', error);
    }
  }, PROMOTION_CHECK_INTERVAL);
  
  console.log('Promotion scheduler started successfully');
};

export default initPromotionScheduler;