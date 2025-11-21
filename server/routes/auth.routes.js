import express from 'express';
import {
  signup,
  login,
  logout,
  updatePassword,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getCurrentUser);
router.patch('/updatePassword', protect, updatePassword);

export default router;
