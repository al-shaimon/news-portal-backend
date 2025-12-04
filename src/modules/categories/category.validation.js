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

  body('parent')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      // Check if it's a valid UUID
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(value)) {
        throw new Error('Invalid parent category ID');
      }
      return true;
    }),
];

export const updateCategoryValidation = [
  param('identifier').notEmpty().withMessage('Category ID or slug is required'),

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

  body('parent')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(value)) {
        throw new Error('Invalid parent category ID');
      }
      return true;
    }),
];

export const categoryIdValidation = [
  param('identifier').notEmpty().withMessage('Category ID or slug is required'),
];
