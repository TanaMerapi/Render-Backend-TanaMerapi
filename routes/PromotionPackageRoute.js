import express from 'express';
import { 
  getPromotion, 
  createPromotion, 
  deletePromotion 
} from '../controllers/PromotionPackageController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.get('/promotion/:promotionId', getPromotion);
router.post('/', verifyToken, createPromotion);
router.delete('/:promotion_id/:package_id', verifyToken, deletePromotion);

export default router;