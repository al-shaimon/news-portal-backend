import { body, param } from 'express-validator';
import { AD_TYPES, AD_POSITIONS } from '../../config/constants.js';

export const createAdvertisementValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Advertisement name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('type')
    .notEmpty()
    .withMessage('Advertisement type is required')
    .isIn(Object.values(AD_TYPES))
    .withMessage('Invalid advertisement type'),

  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isIn(Object.values(AD_POSITIONS))
    .withMessage('Invalid position'),

  body('image.url')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),

  body('linkUrl')
    .notEmpty()
    .withMessage('Link URL is required')
    .isURL()
    .withMessage('Invalid link URL'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const updateAdvertisementValidation = [
  param('id').isUUID().withMessage('Invalid advertisement ID'),

  body('type').optional().isIn(Object.values(AD_TYPES)).withMessage('Invalid advertisement type'),

  body('position').optional().isIn(Object.values(AD_POSITIONS)).withMessage('Invalid position'),
];

export const adIdValidation = [param('id').isUUID().withMessage('Invalid advertisement ID')];
