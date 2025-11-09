import express from 'express';
import mediaController from './media.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { mediaIdValidation } from './media.validation.js';
import { upload } from '../../config/multer.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stats route (Admin only)
router.get(
  '/stats/overview',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  mediaController.getMediaStats
);

// Upload routes
router.post('/upload', upload.single('file'), mediaController.uploadMedia);
router.post('/upload/multiple', upload.array('files', 10), mediaController.uploadMultipleMedia);

// CRUD routes
router.route('/').get(mediaController.getAllMedia);

router
  .route('/:id')
  .get(mediaIdValidation, validate, mediaController.getMedia)
  .put(mediaIdValidation, validate, mediaController.updateMedia)
  .delete(mediaIdValidation, validate, mediaController.deleteMedia);

export default router;
