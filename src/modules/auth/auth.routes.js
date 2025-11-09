import express from 'express';
import authController from './auth.controller.js';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
} from './auth.validation.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/change-password', changePasswordValidation, validate, authController.changePassword);
router.put('/profile', updateProfileValidation, validate, authController.updateProfile);

export default router;
