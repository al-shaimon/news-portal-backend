import express from 'express';
import articleController from './article.controller.js';
import { protect, optionalAuth, restrictTo } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createArticleValidation,
  updateArticleValidation,
  articleIdentifierValidation,
  articleIdParamValidation,
} from './article.validation.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// Public routes with optional authentication
router.get('/', optionalAuth, articleController.getAllArticles);
router.get('/featured/list', articleController.getFeaturedArticles);
router.get('/breaking/list', articleController.getBreakingNews);
router.get('/trending/list', articleController.getTrendingArticles);
router.get('/latest/list', articleController.getLatestArticles);
router.get('/search/query', articleController.searchArticles);

// Stats route (protected - admin only)
router.get(
  '/stats/overview',
  protect,
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  articleController.getArticleStats
);

// Single article routes
router.get(
  '/:identifier',
  optionalAuth,
  articleIdentifierValidation,
  validate,
  articleController.getArticle
);
router.get('/:id/related', articleIdParamValidation, validate, articleController.getRelatedArticles);

// Protected routes - require authentication
router.use(protect);

router.post(
  '/',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.EDITORIAL),
  createArticleValidation,
  validate,
  articleController.createArticle
);

router.put(
  '/:id',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.EDITORIAL),
  updateArticleValidation,
  validate,
  articleController.updateArticle
);

router.delete(
  '/:id',
  restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  articleIdParamValidation,
  validate,
  articleController.deleteArticle
);

export default router;
