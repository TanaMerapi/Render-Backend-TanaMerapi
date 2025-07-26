import express from 'express';
import { 
  getSocialMediaLinks, 
  createSocialMediaLink, 
  updateSocialMediaLink, 
  deleteSocialMediaLink 
} from '../controllers/SocialMediaController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.get('/', getSocialMediaLinks);
router.post('/', verifyToken, createSocialMediaLink);
router.put('/:id', verifyToken, updateSocialMediaLink);
router.delete('/:id', verifyToken, deleteSocialMediaLink);

export default router;