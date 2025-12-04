import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';

class AdvertisementService {
  mapAdvertisement(advertisement) {
    if (!advertisement) return null;

    return {
      id: advertisement.id,
      name: advertisement.name,
      title: {
        en: advertisement.titleEn,
        bn: advertisement.titleBn,
      },
      description: {
        en: advertisement.descriptionEn,
        bn: advertisement.descriptionBn,
      },
      type: advertisement.type,
      position: advertisement.position,
      image: advertisement.image,
      linkUrl: advertisement.linkUrl,
      openInNewTab: advertisement.openInNewTab,
      startDate: advertisement.startDate,
      endDate: advertisement.endDate,
      isActive: advertisement.isActive,
      priority: advertisement.priority,
      displayPages: advertisement.displayPages,
      impressions: advertisement.impressions,
      clicks: advertisement.clicks,
      client: advertisement.client,
      categories: advertisement.categories?.map((ac) => ({
        id: ac.category.id,
        name: {
          en: ac.category.nameEn,
          bn: ac.category.nameBn,
        },
        slug: ac.category.slug,
      })),
      createdAt: advertisement.createdAt,
      updatedAt: advertisement.updatedAt,
    };
  }

  buildAdvertisementData(payload) {
    return {
      name: payload.name,
      titleEn: payload.title?.en,
      titleBn: payload.title?.bn,
      descriptionEn: payload.description?.en,
      descriptionBn: payload.description?.bn,
      type: payload.type,
      position: payload.position,
      image: payload.image,
      linkUrl: payload.linkUrl,
      openInNewTab: payload.openInNewTab,
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
      isActive: payload.isActive,
      priority: payload.priority,
      displayPages: payload.displayPages,
      client: payload.client,
    };
  }

  // Get all advertisements
  async getAllAdvertisements(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = buildSortObject(query.sort || '-priority');

    const where = {};
    if (query.type) where.type = query.type;
    if (query.position) where.position = query.position;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [advertisements, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.advertisement.count({ where }),
    ]);

    return {
      advertisements: advertisements.map((ad) => this.mapAdvertisement(ad)),
      pagination: { page, limit, total },
    };
  }

  // Get active advertisements for public display
  async getActiveAdvertisements(filters = {}) {
    const now = new Date();
    const where = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (filters.type) where.type = filters.type;
    if (filters.position) where.position = filters.position;
    if (filters.page) where.displayPages = { hasSome: [filters.page, 'all'] };

    const advertisements = await prisma.advertisement.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { priority: 'desc' },
    });

    return advertisements.map((ad) => this.mapAdvertisement(ad));
  }

  // Get single advertisement
  async getAdvertisement(adId) {
    const advertisement = await prisma.advertisement.findUnique({
      where: { id: adId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!advertisement) {
      throw new AppError('Advertisement not found', 404);
    }

    return this.mapAdvertisement(advertisement);
  }

  // Create advertisement
  async createAdvertisement(adData) {
    const data = this.buildAdvertisementData(adData);

    const advertisement = await prisma.advertisement.create({
      data: {
        ...data,
        categories: adData.categories?.length
          ? {
              create: adData.categories.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapAdvertisement(advertisement);
  }

  // Update advertisement
  async updateAdvertisement(adId, updates) {
    const data = this.buildAdvertisementData(updates);

    if (updates.categories) {
      // Delete existing category associations and create new ones
      data.categories = {
        deleteMany: {},
        create: updates.categories.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    try {
      const advertisement = await prisma.advertisement.update({
        where: { id: adId },
        data,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return this.mapAdvertisement(advertisement);
    } catch (error) {
      throw new AppError('Advertisement not found', 404);
    }
  }

  // Delete advertisement
  async deleteAdvertisement(adId) {
    try {
      await prisma.advertisement.delete({ where: { id: adId } });
    } catch (error) {
      throw new AppError('Advertisement not found', 404);
    }

    return { message: 'Advertisement deleted successfully' };
  }

  // Track impression
  async trackImpression(adId) {
    try {
      await prisma.advertisement.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } },
      });
    } catch (error) {
      throw new AppError('Advertisement not found', 404);
    }

    return { message: 'Impression tracked' };
  }

  // Track click
  async trackClick(adId) {
    try {
      await prisma.advertisement.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
    } catch (error) {
      throw new AppError('Advertisement not found', 404);
    }

    return { message: 'Click tracked' };
  }

  // Get advertisement statistics
  async getAdvertisementStats() {
    const [totalAds, activeAds, aggregates, topPerformingAds] = await Promise.all([
      prisma.advertisement.count(),
      prisma.advertisement.count({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
      prisma.advertisement.aggregate({
        _sum: {
          impressions: true,
          clicks: true,
        },
      }),
      prisma.advertisement.findMany({
        orderBy: { clicks: 'desc' },
        take: 10,
        select: { id: true, name: true, clicks: true, impressions: true },
      }),
    ]);

    const totalImpressions = aggregates._sum.impressions || 0;
    const totalClicks = aggregates._sum.clicks || 0;

    return {
      totalAds,
      activeAds,
      totalImpressions,
      totalClicks,
      averageCTR:
        totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
      topPerformingAds,
    };
  }
}

export default new AdvertisementService();
