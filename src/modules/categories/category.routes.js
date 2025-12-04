import express from 'express';
import categoryController from './category.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
} from './category.validation.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/tree/all', categoryController.getCategoryTree);
router.get('/menu/list', categoryController.getMenuCategories);
router.get('/:identifier', categoryIdValidation, validate, categoryController.getCategory);
router.get(
  '/:identifier/articles',
  categoryIdValidation,
  validate,
  categoryController.getCategoryWithArticles
);

// Protected routes - Admin only
router.use(protect);
router.use(restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN));

router.post('/', createCategoryValidation, validate, categoryController.createCategory);
router.put('/:identifier', updateCategoryValidation, validate, categoryController.updateCategory);
router.delete('/:identifier', categoryIdValidation, validate, categoryController.deleteCategory);

export default router;
