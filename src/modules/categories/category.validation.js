import { body, param } from 'express-validator';

export const createCategoryValidation = [
  body('name.en')
    .trim()
    .notEmpty()
    .withMessage('English name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('name.bn')
    .trim()
    .notEmpty()
    .withMessage('Bangla name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('parent').optional().isMongoId().withMessage('Invalid parent category ID'),
];

export const updateCategoryValidation = [
  param('id').isMongoId().withMessage('Invalid category ID'),

  body('name.en')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('name.bn')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('parent').optional().isMongoId().withMessage('Invalid parent category ID'),
];

export const categoryIdValidation = [
  param('identifier').notEmpty().withMessage('Category ID or slug is required'),
];
