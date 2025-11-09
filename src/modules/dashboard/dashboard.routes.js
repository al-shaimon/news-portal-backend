import express from 'express';
import dashboardController from './dashboard.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// All dashboard routes require authentication and admin role
router.use(protect);
router.use(restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN));

router.get('/overview', dashboardController.getOverviewStats);
router.get('/articles/stats', dashboardController.getArticleStatsByDateRange);
router.get('/articles/top', dashboardController.getTopArticles);
router.get('/categories/distribution', dashboardController.getCategoryDistribution);
router.get('/users/activity', dashboardController.getUserActivity);
router.get('/traffic/trends', dashboardController.getTrafficTrends);

export default router;
