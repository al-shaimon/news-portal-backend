import authService from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/responseUtils.js';

class AuthController {
  // @desc    Register new user
  // @route   POST /api/v1/auth/register
  // @access  Public
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    sendResponse(res, 201, result, 'User registered successfully');
  });

  // @desc    Login user
  // @route   POST /api/v1/auth/login
  // @access  Public
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendResponse(res, 200, result, 'Login successful');
  });

  // @desc    Refresh access token
  // @route   POST /api/v1/auth/refresh-token
  // @access  Public
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendResponse(res, 200, result, 'Token refreshed successfully');
  });

  // @desc    Logout user
  // @route   POST /api/v1/auth/logout
  // @access  Private
  logout = asyncHandler(async (req, res) => {
    const result = await authService.logout(req.user._id);
    sendResponse(res, 200, result, 'Logged out successfully');
  });

  // @desc    Get current user
  // @route   GET /api/v1/auth/me
  // @access  Private
  getCurrentUser = asyncHandler(async (req, res) => {
    const result = await authService.getCurrentUser(req.user._id);
    sendResponse(res, 200, result, 'User retrieved successfully');
  });

  // @desc    Change password
  // @route   PUT /api/v1/auth/change-password
  // @access  Private
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    sendResponse(res, 200, result, 'Password changed successfully');
  });

  // @desc    Update profile
  // @route   PUT /api/v1/auth/profile
  // @access  Private
  updateProfile = asyncHandler(async (req, res) => {
    const result = await authService.updateProfile(req.user._id, req.body);
    sendResponse(res, 200, result, 'Profile updated successfully');
  });
}

export default new AuthController();
