import { body, param } from 'express-validator';
import { USER_ROLES } from '../../config/constants.js';

export const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role').optional().isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
];

export const updateUserValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role').optional().isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const userIdValidation = [param('id').isUUID().withMessage('Invalid user ID')];
