import express from 'express';
import {
  getAllPlaces,
  getPlaceById,
  getNearbyPlaces,
  getPlacesByCategory,
} from '../controllers/place.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/category/:category', getPlacesByCategory);
router.get('/:id', getPlaceById);

export default router;
