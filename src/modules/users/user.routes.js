import express from 'express';
import userController from './user.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createUserValidation, updateUserValidation, userIdValidation } from './user.validation.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user stats - must be before /:id to avoid route conflict
router.get(
  '/stats',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  userController.getUserStats
);

// Admin and Super Admin routes
router
  .route('/')
  .get(restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), userController.getAllUsers)
  .post(
    restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    createUserValidation,
    validate,
    userController.createUser
  );

router
  .route('/:id')
  .get(
    restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    userIdValidation,
    validate,
    userController.getUserById
  )
  .put(
    restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    updateUserValidation,
    validate,
    userController.updateUser
  )
  .delete(
    restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    userIdValidation,
    validate,
    userController.deleteUser
  );

// Super Admin only - permanent delete
router.delete(
  '/:id/permanent',
  restrictTo(USER_ROLES.SUPER_ADMIN),
  userIdValidation,
  validate,
  userController.permanentlyDeleteUser
);

export default router;
