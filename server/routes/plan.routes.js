import express from 'express';
import {
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan,
  deletePlan,
  addActivityToPlan,
  removeActivityFromPlan,
} from '../controllers/plan.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/create', createPlan);
router.get('/all', getAllPlans);
router.get('/:id', getPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);
router.post('/:id/activities', addActivityToPlan);
router.delete('/:id/activities/:activityId', removeActivityFromPlan);

export default router;
