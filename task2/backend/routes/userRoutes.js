import express from 'express';
import { allUsers, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/profile').put(protect, updateProfile);

export default router;
