import express from 'express';
import {
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryEntry,
} from '../controllers/history.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/add', addSearchHistory);
router.get('/get', getSearchHistory);
router.delete('/clear', clearSearchHistory);
router.delete('/:id', deleteSearchHistoryEntry);

export default router;
