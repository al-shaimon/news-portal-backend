import categoryService from './category.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../utils/responseUtils.js';

class CategoryController {
  // @desc    Get all categories
  // @route   GET /api/v1/categories
  // @access  Public
  getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories(req.query);
    sendResponse(res, 200, categories, 'Categories retrieved successfully');
  });

  // @desc    Get single category
  // @route   GET /api/v1/categories/:identifier
  // @access  Public
  getCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategory(req.params.identifier);
    sendResponse(res, 200, category, 'Category retrieved successfully');
  });

  // @desc    Create new category
  // @route   POST /api/v1/categories
  // @access  Private (Admin)
  createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    sendResponse(res, 201, category, 'Category created successfully');
  });

  // @desc    Update category
  // @route   PUT /api/v1/categories/:id
  // @access  Private (Admin)
  updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    sendResponse(res, 200, category, 'Category updated successfully');
  });

  // @desc    Delete category
  // @route   DELETE /api/v1/categories/:id
  // @access  Private (Admin)
  deleteCategory = asyncHandler(async (req, res) => {
    const result = await categoryService.deleteCategory(req.params.id);
    sendResponse(res, 200, result, 'Category deleted successfully');
  });

  // @desc    Get category tree
  // @route   GET /api/v1/categories/tree/all
  // @access  Public
  getCategoryTree = asyncHandler(async (req, res) => {
    const tree = await categoryService.getCategoryTree();
    sendResponse(res, 200, tree, 'Category tree retrieved successfully');
  });

  // @desc    Get menu categories
  // @route   GET /api/v1/categories/menu/list
  // @access  Public
  getMenuCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getMenuCategories();
    sendResponse(res, 200, categories, 'Menu categories retrieved successfully');
  });

  // @desc    Get category with articles
  // @route   GET /api/v1/categories/:identifier/articles
  // @access  Public
  getCategoryWithArticles = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await categoryService.getCategoryWithArticles(req.params.identifier, {
      page,
      limit,
    });
    sendPaginatedResponse(
      res,
      200,
      result.articles,
      result.pagination,
      'Category articles retrieved successfully'
    );
  });
}

export default new CategoryController();
