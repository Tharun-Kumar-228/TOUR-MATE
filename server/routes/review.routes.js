import express from 'express';
import {
  addReview,
  getReviewsByPlace,
  getReviewsByUser,
  updateReview,
  deleteReview,
  getOwnerReviews,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/add', protect, addReview);
router.get('/place/:placeId', getReviewsByPlace);
router.get('/user/my-reviews', protect, getReviewsByUser);
router.get('/owner/my-reviews', protect, getOwnerReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
