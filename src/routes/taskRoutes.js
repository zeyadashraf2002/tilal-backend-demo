// backend/src/routes/taskRoutes.js - Fixed with Cloudinary
import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
  uploadTaskImages,
  deleteTaskImage,
  assignTask
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('admin'), deleteTask);

router.post('/:id/start', startTask);
router.post('/:id/complete', completeTask);
router.post('/:id/assign', authorize('admin'), assignTask);

// ✅ Image upload routes with Cloudinary (up to 50 images)
router.post(
  '/:id/images',
  authorize('admin', 'worker'),
  uploadMultiple('images', 50, 'tasks'), // ✅ Cloudinary folder
  handleUploadError,
  uploadTaskImages
);

router.delete(
  '/:id/images/:imageId',
  authorize('admin', 'worker'),
  deleteTaskImage
);

export default router;