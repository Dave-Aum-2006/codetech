import express from 'express';
import { getTaskStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getTaskStats);

export default router;
