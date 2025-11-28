import mediaService from './media.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../utils/responseUtils.js';

class MediaController {
  // @desc    Get all media files
  // @route   GET /api/v1/media
  // @access  Private
  getAllMedia = asyncHandler(async (req, res) => {
    const result = await mediaService.getAllMedia(req.query, req.user.id, req.user.role);
    sendPaginatedResponse(
      res,
      200,
      result.media,
      result.pagination,
      'Media files retrieved successfully'
    );
  });

  // @desc    Get single media file
  // @route   GET /api/v1/media/:id
  // @access  Private
  getMedia = asyncHandler(async (req, res) => {
    const media = await mediaService.getMedia(req.params.id);
    sendResponse(res, 200, media, 'Media file retrieved successfully');
  });

  // @desc    Upload single media file
  // @route   POST /api/v1/media/upload
  // @access  Private
  uploadMedia = asyncHandler(async (req, res) => {
    const media = await mediaService.uploadMedia(req.file, req.user.id, req.body);
    sendResponse(res, 201, media, 'File uploaded successfully');
  });

  // @desc    Upload multiple media files
  // @route   POST /api/v1/media/upload/multiple
  // @access  Private
  uploadMultipleMedia = asyncHandler(async (req, res) => {
    const media = await mediaService.uploadMultipleMedia(req.files, req.user.id, req.body);
    sendResponse(res, 201, media, 'Files uploaded successfully');
  });

  // @desc    Update media metadata
  // @route   PUT /api/v1/media/:id
  // @access  Private
  updateMedia = asyncHandler(async (req, res) => {
    const media = await mediaService.updateMedia(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    sendResponse(res, 200, media, 'Media updated successfully');
  });

  // @desc    Delete media file
  // @route   DELETE /api/v1/media/:id
  // @access  Private
  deleteMedia = asyncHandler(async (req, res) => {
    const result = await mediaService.deleteMedia(req.params.id, req.user.id, req.user.role);
    sendResponse(res, 200, result, 'Media deleted successfully');
  });

  // @desc    Get media statistics
  // @route   GET /api/v1/media/stats/overview
  // @access  Private (Admin)
  getMediaStats = asyncHandler(async (req, res) => {
    const stats = await mediaService.getMediaStats();
    sendResponse(res, 200, stats, 'Media statistics retrieved successfully');
  });
}

export default new MediaController();
