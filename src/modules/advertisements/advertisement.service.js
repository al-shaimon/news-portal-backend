import Advertisement from '../../models/Advertisement.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';

class AdvertisementService {
  // Get all advertisements
  async getAllAdvertisements(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = buildSortObject(query.sort || '-priority');

    const filter = {};
    if (query.type) filter.type = query.type;
    if (query.position) filter.position = query.position;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

    const [advertisements, total] = await Promise.all([
      Advertisement.find(filter)
        .populate('categories', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Advertisement.countDocuments(filter),
    ]);

    return {
      advertisements,
      pagination: { page, limit, total },
    };
  }

  // Get active advertisements for public display
  async getActiveAdvertisements(filters = {}) {
    const now = new Date();
    const filter = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (filters.type) filter.type = filters.type;
    if (filters.position) filter.position = filters.position;
    if (filters.page) filter.displayPages = { $in: [filters.page, 'all'] };

    const advertisements = await Advertisement.find(filter).sort('-priority').lean();

    return advertisements;
  }

  // Get single advertisement
  async getAdvertisement(adId) {
    const advertisement = await Advertisement.findById(adId)
      .populate('categories', 'name slug')
      .lean();

    if (!advertisement) {
      throw new AppError('Advertisement not found', 404);
    }

    return advertisement;
  }

  // Create advertisement
  async createAdvertisement(adData) {
    const advertisement = await Advertisement.create(adData);
    return advertisement;
  }

  // Update advertisement
  async updateAdvertisement(adId, updates) {
    const advertisement = await Advertisement.findByIdAndUpdate(adId, updates, {
      new: true,
      runValidators: true,
    });

    if (!advertisement) {
      throw new AppError('Advertisement not found', 404);
    }

    return advertisement;
  }

  // Delete advertisement
  async deleteAdvertisement(adId) {
    const advertisement = await Advertisement.findByIdAndDelete(adId);

    if (!advertisement) {
      throw new AppError('Advertisement not found', 404);
    }

    return { message: 'Advertisement deleted successfully' };
  }

  // Track impression
  async trackImpression(adId) {
    const advertisement = await Advertisement.findByIdAndUpdate(
      adId,
      { $inc: { impressions: 1 } },
      { new: true }
    );

    if (!advertisement) {
      throw new AppError('Advertisement not found', 404);
    }

    return { message: 'Impression tracked' };
  }

  // Track click
  async trackClick(adId) {
    const advertisement = await Advertisement.findByIdAndUpdate(
      adId,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!advertisement) {
      throw new AppError('Advertisement not found', 404);
    }

    return { message: 'Click tracked' };
  }

  // Get advertisement statistics
  async getAdvertisementStats() {
    const totalAds = await Advertisement.countDocuments();
    const activeAds = await Advertisement.countDocuments({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    const stats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
        },
      },
    ]);

    const topPerformingAds = await Advertisement.find()
      .sort('-clicks')
      .limit(10)
      .select('name clicks impressions')
      .lean();

    return {
      totalAds,
      activeAds,
      totalImpressions: stats[0]?.totalImpressions || 0,
      totalClicks: stats[0]?.totalClicks || 0,
      averageCTR: stats[0]?.totalImpressions
        ? ((stats[0].totalClicks / stats[0].totalImpressions) * 100).toFixed(2)
        : 0,
      topPerformingAds,
    };
  }
}

export default new AdvertisementService();
