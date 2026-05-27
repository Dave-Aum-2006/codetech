import express from 'express';
import { allMessages, sendMessage, uploadFile, upload } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);
router.route('/upload').post(protect, upload.single('file'), uploadFile);

export default router;
