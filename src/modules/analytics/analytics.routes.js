import express from 'express';
import analyticsController from './analytics.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../config/constants.js';

const router = express.Router();

// Admin-only analytics endpoints
router.use(protect);
router.use(restrictTo(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN));

router.get('/realtime', analyticsController.getRealtimeSnapshot);
router.get('/traffic', analyticsController.getTrafficTrend);
router.get('/content', analyticsController.getContentPerformance);
router.get('/ads/summary', analyticsController.getAdPerformanceSummary);
router.get('/ads/top', analyticsController.getTopAds);
router.get('/media/summary', analyticsController.getMediaUsageSummary);
router.get('/auth', analyticsController.getAuthStats);

export default router;
