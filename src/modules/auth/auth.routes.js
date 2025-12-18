import express from 'express';
import authController from './auth.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
} from './auth.validation.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect); // All routes below require authentication

// User creation is restricted to super admin (use /users for full user management)
router.post(
  '/register',
  restrictTo(USER_ROLES.SUPER_ADMIN),
  registerValidation,
  validate,
  authController.register
);

router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/change-password', changePasswordValidation, validate, authController.changePassword);
router.put('/profile', updateProfileValidation, validate, authController.updateProfile);

export default router;
