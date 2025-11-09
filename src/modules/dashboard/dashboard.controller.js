import dashboardService from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/responseUtils.js';

class DashboardController {
  // @desc    Get dashboard overview statistics
  // @route   GET /api/v1/dashboard/overview
  // @access  Private (Admin)
  getOverviewStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getOverviewStats();
    sendResponse(res, 200, stats, 'Dashboard statistics retrieved successfully');
  });

  // @desc    Get article statistics by date range
  // @route   GET /api/v1/dashboard/articles/stats
  // @access  Private (Admin)
  getArticleStatsByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await dashboardService.getArticleStatsByDateRange(startDate, endDate);
    sendResponse(res, 200, stats, 'Article statistics retrieved successfully');
  });

  // @desc    Get top performing articles
  // @route   GET /api/v1/dashboard/articles/top
  // @access  Private (Admin)
  getTopArticles = asyncHandler(async (req, res) => {
    const { limit, days } = req.query;
    const articles = await dashboardService.getTopArticles(
      parseInt(limit) || 10,
      parseInt(days) || 30
    );
    sendResponse(res, 200, articles, 'Top articles retrieved successfully');
  });

  // @desc    Get category-wise distribution
  // @route   GET /api/v1/dashboard/categories/distribution
  // @access  Private (Admin)
  getCategoryDistribution = asyncHandler(async (req, res) => {
    const distribution = await dashboardService.getCategoryDistribution();
    sendResponse(res, 200, distribution, 'Category distribution retrieved successfully');
  });

  // @desc    Get user activity
  // @route   GET /api/v1/dashboard/users/activity
  // @access  Private (Admin)
  getUserActivity = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const activity = await dashboardService.getUserActivity(parseInt(limit) || 10);
    sendResponse(res, 200, activity, 'User activity retrieved successfully');
  });

  // @desc    Get traffic trends
  // @route   GET /api/v1/dashboard/traffic/trends
  // @access  Private (Admin)
  getTrafficTrends = asyncHandler(async (req, res) => {
    const { days } = req.query;
    const trends = await dashboardService.getTrafficTrends(parseInt(days) || 30);
    sendResponse(res, 200, trends, 'Traffic trends retrieved successfully');
  });
}

export default new DashboardController();
