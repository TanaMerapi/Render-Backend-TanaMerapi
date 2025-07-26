import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/AuthController.js';

const router = express.Router();

// Registration route (for creating admin users)
router.post('/register', register);

// Authentication routes
router.post('/login', login);
router.get('/token', refreshToken);
router.delete('/logout', logout);

export default router;