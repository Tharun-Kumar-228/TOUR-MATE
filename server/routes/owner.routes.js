import express from 'express';
import {
  addPlace,
  getMyPlaces,
  getPlace,
  updatePlace,
  deletePlace,
  getPlaceReviews,
} from '../controllers/owner.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('owner', 'admin'));

router.post('/add-place', addPlace);
router.get('/my-places', getMyPlaces);
router.get('/place/:id', getPlace);
router.put('/place/:id', updatePlace);
router.delete('/place/:id', deletePlace);
router.get('/place/:id/reviews', getPlaceReviews);

export default router;
