// MenuItemRoute.js
import express from 'express';
import { 
  getMenuItems, 
  getMenuItem, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from '../controllers/MenuItemController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { menuItemUpload } from '../middleware/CloudinaryUpload.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', verifyToken, menuItemUpload, createMenuItem);
router.put('/:id', verifyToken, menuItemUpload, updateMenuItem);
router.delete('/:id', verifyToken, deleteMenuItem);

export default router;