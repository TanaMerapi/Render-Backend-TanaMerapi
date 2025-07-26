// SiteSettingRoute.js
import express from 'express';
import { 
  getSiteSettings, 
  getSiteSettingByKey, 
  updateSiteSetting 
} from '../controllers/SiteSettingController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { settingUpload } from '../middleware/CloudinaryUpload.js';

const router = express.Router();

router.get('/', getSiteSettings);
router.get('/:key', getSiteSettingByKey);
router.put('/:key', verifyToken, settingUpload, updateSiteSetting);

export default router;