// SlideRoute.js
import express from 'express';
import { 
  getSlides, 
  createSlide, 
  updateSlide, 
  deleteSlide 
} from '../controllers/SlideController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { slideUpload } from '../middleware/CloudinaryUpload.js';

const router = express.Router();

router.get('/', getSlides);
router.post('/', verifyToken, slideUpload, createSlide);
router.put('/:id', verifyToken, slideUpload, updateSlide);
router.delete('/:id', verifyToken, deleteSlide);

export default router;