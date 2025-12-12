import analyticsService from './analytics.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/responseUtils.js';

class AnalyticsController {
  // @desc    Real-time analytics snapshot
  // @route   GET /api/v1/analytics/realtime
  // @access  Private (Admin+)
  getRealtimeSnapshot = asyncHandler(async (req, res) => {
    const data = await analyticsService.getRealtimeSnapshot();
    sendResponse(res, 200, data, 'Realtime analytics snapshot retrieved');
  });

  // @desc    Traffic trend data
  // @route   GET /api/v1/analytics/traffic
  // @access  Private (Admin+)
  getTrafficTrend = asyncHandler(async (req, res) => {
    const { window, interval } = req.query;
    const data = await analyticsService.getTrafficTrend(window, interval);
    sendResponse(res, 200, data, 'Traffic trend data retrieved');
  });

  // @desc    Content performance
  // @route   GET /api/v1/analytics/content
  // @access  Private (Admin+)
  getContentPerformance = asyncHandler(async (req, res) => {
    const { limit, sort, order } = req.query;
    const data = await analyticsService.getContentPerformance({ limit, sort, order });
    sendResponse(res, 200, data, 'Content performance retrieved');
  });

  // @desc    Advertisement performance summary
  // @route   GET /api/v1/analytics/ads/summary
  // @access  Private (Admin+)
  getAdPerformanceSummary = asyncHandler(async (req, res) => {
    const { window } = req.query;
    const data = await analyticsService.getAdPerformanceSummary(window);
    sendResponse(res, 200, data, 'Advertisement performance summary retrieved');
  });

  // @desc    Top advertisements by creative
  // @route   GET /api/v1/analytics/ads/top
  // @access  Private (Admin+)
  getTopAds = asyncHandler(async (req, res) => {
    const { limit, sort, order } = req.query;
    const data = await analyticsService.getTopAds({ limit, sort, order });
    sendResponse(res, 200, data, 'Top advertisements retrieved');
  });

  // @desc    Media usage summary
  // @route   GET /api/v1/analytics/media/summary
  // @access  Private (Admin+)
  getMediaUsageSummary = asyncHandler(async (req, res) => {
    const data = await analyticsService.getMediaUsageSummary();
    sendResponse(res, 200, data, 'Media usage summary retrieved');
  });

  // @desc    Auth/session statistics
  // @route   GET /api/v1/analytics/auth
  // @access  Private (Admin+)
  getAuthStats = asyncHandler(async (req, res) => {
    const { window } = req.query;
    const data = await analyticsService.getAuthStats(window);
    sendResponse(res, 200, data, 'Authentication statistics retrieved');
  });
}

export default new AnalyticsController();
