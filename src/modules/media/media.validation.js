import { param } from 'express-validator';

export const mediaIdValidation = [param('id').isUUID().withMessage('Invalid media ID')];
