// PromotionRoute.js
import express from 'express';
import { 
  getPromotions, 
  getPromotion, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from '../controllers/PromotionController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { promotionUpload } from '../middleware/CloudinaryUpload.js';

const router = express.Router();

router.get('/', getPromotions);
router.get('/:id', getPromotion);
router.post('/', verifyToken, promotionUpload, createPromotion);
router.put('/:id', verifyToken, promotionUpload, updatePromotion);
router.delete('/:id', verifyToken, deletePromotion);

export default router;