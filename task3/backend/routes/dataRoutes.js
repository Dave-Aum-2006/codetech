import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, uploadFile, upload } from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.post('/upload', protect, upload.single('file'), uploadFile);

export default router;
