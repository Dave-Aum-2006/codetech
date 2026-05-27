import express from 'express';
import { logActivity, getActivity, getStats, getWeeklyReport } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, logActivity)
  .get(protect, getActivity);

router.get('/stats', protect, getStats);
router.get('/report/weekly', protect, getWeeklyReport);

export default router;
