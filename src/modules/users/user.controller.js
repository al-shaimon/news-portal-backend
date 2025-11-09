import userService from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../utils/responseUtils.js';

class UserController {
  // @desc    Get all users
  // @route   GET /api/v1/users
  // @access  Private/Admin
  getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    sendPaginatedResponse(
      res,
      200,
      result.users,
      result.pagination,
      'Users retrieved successfully'
    );
  });

  // @desc    Get user by ID
  // @route   GET /api/v1/users/:id
  // @access  Private/Admin
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    sendResponse(res, 200, user, 'User retrieved successfully');
  });

  // @desc    Create new user
  // @route   POST /api/v1/users
  // @access  Private/Admin
  createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    sendResponse(res, 201, user, 'User created successfully');
  });

  // @desc    Update user
  // @route   PUT /api/v1/users/:id
  // @access  Private/Admin
  updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    sendResponse(res, 200, user, 'User updated successfully');
  });

  // @desc    Delete user (soft delete)
  // @route   DELETE /api/v1/users/:id
  // @access  Private/Admin
  deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);
    sendResponse(res, 200, result, 'User deactivated successfully');
  });

  // @desc    Permanently delete user
  // @route   DELETE /api/v1/users/:id/permanent
  // @access  Private/SuperAdmin
  permanentlyDeleteUser = asyncHandler(async (req, res) => {
    const result = await userService.permanentlyDeleteUser(req.params.id);
    sendResponse(res, 200, result, 'User permanently deleted');
  });

  // @desc    Get user statistics
  // @route   GET /api/v1/users/stats
  // @access  Private/Admin
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();
    sendResponse(res, 200, stats, 'User statistics retrieved successfully');
  });
}

export default new UserController();
