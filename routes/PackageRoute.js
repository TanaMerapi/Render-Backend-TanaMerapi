// PackageRoute.js
import express from 'express';
import { 
  getPackages,
  getPackage, 
  createPackage, 
  updatePackage, 
  deletePackage 
} from '../controllers/PackageController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { packageUpload } from '../middleware/CloudinaryUpload.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/:id', getPackage);
router.post('/', verifyToken, packageUpload, createPackage);
router.put('/:id', verifyToken, packageUpload, updatePackage);
router.delete('/:id', verifyToken, deletePackage);

export default router;