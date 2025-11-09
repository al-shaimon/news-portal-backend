import advertisementService from './advertisement.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../utils/responseUtils.js';

class AdvertisementController {
  // @desc    Get all advertisements (Admin)
  // @route   GET /api/v1/advertisements
  // @access  Private (Admin)
  getAllAdvertisements = asyncHandler(async (req, res) => {
    const result = await advertisementService.getAllAdvertisements(req.query);
    sendPaginatedResponse(
      res,
      200,
      result.advertisements,
      result.pagination,
      'Advertisements retrieved successfully'
    );
  });

  // @desc    Get active advertisements (Public)
  // @route   GET /api/v1/advertisements/active
  // @access  Public
  getActiveAdvertisements = asyncHandler(async (req, res) => {
    const advertisements = await advertisementService.getActiveAdvertisements(req.query);
    sendResponse(res, 200, advertisements, 'Active advertisements retrieved successfully');
  });

  // @desc    Get single advertisement
  // @route   GET /api/v1/advertisements/:id
  // @access  Private (Admin)
  getAdvertisement = asyncHandler(async (req, res) => {
    const advertisement = await advertisementService.getAdvertisement(req.params.id);
    sendResponse(res, 200, advertisement, 'Advertisement retrieved successfully');
  });

  // @desc    Create new advertisement
  // @route   POST /api/v1/advertisements
  // @access  Private (Admin)
  createAdvertisement = asyncHandler(async (req, res) => {
    const advertisement = await advertisementService.createAdvertisement(req.body);
    sendResponse(res, 201, advertisement, 'Advertisement created successfully');
  });

  // @desc    Update advertisement
  // @route   PUT /api/v1/advertisements/:id
  // @access  Private (Admin)
  updateAdvertisement = asyncHandler(async (req, res) => {
    const advertisement = await advertisementService.updateAdvertisement(req.params.id, req.body);
    sendResponse(res, 200, advertisement, 'Advertisement updated successfully');
  });

  // @desc    Delete advertisement
  // @route   DELETE /api/v1/advertisements/:id
  // @access  Private (Admin)
  deleteAdvertisement = asyncHandler(async (req, res) => {
    const result = await advertisementService.deleteAdvertisement(req.params.id);
    sendResponse(res, 200, result, 'Advertisement deleted successfully');
  });

  // @desc    Track impression
  // @route   POST /api/v1/advertisements/:id/impression
  // @access  Public
  trackImpression = asyncHandler(async (req, res) => {
    const result = await advertisementService.trackImpression(req.params.id);
    sendResponse(res, 200, result, 'Impression tracked');
  });

  // @desc    Track click
  // @route   POST /api/v1/advertisements/:id/click
  // @access  Public
  trackClick = asyncHandler(async (req, res) => {
    const result = await advertisementService.trackClick(req.params.id);
    sendResponse(res, 200, result, 'Click tracked');
  });

  // @desc    Get advertisement statistics
  // @route   GET /api/v1/advertisements/stats/overview
  // @access  Private (Admin)
  getAdvertisementStats = asyncHandler(async (req, res) => {
    const stats = await advertisementService.getAdvertisementStats();
    sendResponse(res, 200, stats, 'Advertisement statistics retrieved successfully');
  });
}

export default new AdvertisementController();
