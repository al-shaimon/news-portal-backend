import express from 'express';
import advertisementController from './advertisement.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createAdvertisementValidation,
  updateAdvertisementValidation,
  adIdValidation,
} from './advertisement.validation.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// Public routes
router.get('/active', advertisementController.getActiveAdvertisements);
router.post('/:id/impression', adIdValidation, validate, advertisementController.trackImpression);
router.post('/:id/click', adIdValidation, validate, advertisementController.trackClick);

// Protected routes - Admin only
router.use(protect);
router.use(restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN));

router.get('/stats/overview', advertisementController.getAdvertisementStats);

router
  .route('/')
  .get(advertisementController.getAllAdvertisements)
  .post(createAdvertisementValidation, validate, advertisementController.createAdvertisement);

router
  .route('/:id')
  .get(adIdValidation, validate, advertisementController.getAdvertisement)
  .put(updateAdvertisementValidation, validate, advertisementController.updateAdvertisement)
  .delete(adIdValidation, validate, advertisementController.deleteAdvertisement);

export default router;
