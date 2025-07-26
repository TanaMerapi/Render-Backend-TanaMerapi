// FileUploadRoute.js
import express from 'express';
import { uploadFile } from '../controllers/FileUploadController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { fileUpload } from '../middleware/CloudinaryUpload.js';

const router = express.Router();

router.post('/', verifyToken, fileUpload, uploadFile);

export default router;