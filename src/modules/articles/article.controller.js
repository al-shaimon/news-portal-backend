import articleService from './article.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../utils/responseUtils.js';

class ArticleController {
  // @desc    Get all articles
  // @route   GET /api/v1/articles
  // @access  Public
  getAllArticles = asyncHandler(async (req, res) => {
    const result = await articleService.getAllArticles(req.query, req.user);
    sendPaginatedResponse(
      res,
      200,
      result.articles,
      result.pagination,
      'Articles retrieved successfully'
    );
  });

  // @desc    Get single article
  // @route   GET /api/v1/articles/:identifier
  // @access  Public
  getArticle = asyncHandler(async (req, res) => {
    const article = await articleService.getArticle(req.params.identifier, true);
    sendResponse(res, 200, article, 'Article retrieved successfully');
  });

  // @desc    Create new article
  // @route   POST /api/v1/articles
  // @access  Private (Admin, Journalist)
  createArticle = asyncHandler(async (req, res) => {
    const article = await articleService.createArticle(req.body, req.user.id);
    sendResponse(res, 201, article, 'Article created successfully');
  });

  // @desc    Update article
  // @route   PUT /api/v1/articles/:id
  // @access  Private (Admin, Owner)
  updateArticle = asyncHandler(async (req, res) => {
    const article = await articleService.updateArticle(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    sendResponse(res, 200, article, 'Article updated successfully');
  });

  // @desc    Delete article
  // @route   DELETE /api/v1/articles/:id
  // @access  Private (Admin, Owner)
  deleteArticle = asyncHandler(async (req, res) => {
    const result = await articleService.deleteArticle(req.params.id, req.user.id, req.user.role);
    sendResponse(res, 200, result, 'Article deleted successfully');
  });

  // @desc    Get featured articles
  // @route   GET /api/v1/articles/featured/list
  // @access  Public
  getFeaturedArticles = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const articles = await articleService.getFeaturedArticles(limit);
    sendResponse(res, 200, articles, 'Featured articles retrieved successfully');
  });

  // @desc    Get breaking news
  // @route   GET /api/v1/articles/breaking/list
  // @access  Public
  getBreakingNews = asyncHandler(async (req, res) => {
    const articles = await articleService.getBreakingNews();
    sendResponse(res, 200, articles, 'Breaking news retrieved successfully');
  });

  // @desc    Get trending articles
  // @route   GET /api/v1/articles/trending/list
  // @access  Public
  getTrendingArticles = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const articles = await articleService.getTrendingArticles(limit);
    sendResponse(res, 200, articles, 'Trending articles retrieved successfully');
  });

  // @desc    Get latest articles
  // @route   GET /api/v1/articles/latest/list
  // @access  Public
  getLatestArticles = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const articles = await articleService.getLatestArticles(limit);
    sendResponse(res, 200, articles, 'Latest articles retrieved successfully');
  });

  // @desc    Get related articles
  // @route   GET /api/v1/articles/:id/related
  // @access  Public
  getRelatedArticles = asyncHandler(async (req, res) => {
    const article = await articleService.getArticle(req.params.id);
    const limit = parseInt(req.query.limit) || 5;
    const articles = await articleService.getRelatedArticles(article.id, article.category.id, limit);
    sendResponse(res, 200, articles, 'Related articles retrieved successfully');
  });

  // @desc    Search articles
  // @route   GET /api/v1/articles/search/query
  // @access  Public
  searchArticles = asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    if (!q) {
      return sendResponse(res, 400, null, 'Search query is required');
    }
    const result = await articleService.searchArticles(q, { page, limit });
    sendPaginatedResponse(
      res,
      200,
      result.articles,
      result.pagination,
      'Search results retrieved successfully'
    );
  });

  // @desc    Get article statistics
  // @route   GET /api/v1/articles/stats/overview
  // @access  Private (Admin)
  getArticleStats = asyncHandler(async (req, res) => {
    const stats = await articleService.getArticleStats();
    sendResponse(res, 200, stats, 'Article statistics retrieved successfully');
  });
}

export default new ArticleController();
