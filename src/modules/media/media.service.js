import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';
import { USER_ROLES } from '../../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MediaService {
  mapMedia(media) {
    if (!media) return null;

    return {
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      url: media.url,
      type: media.type,
      mimeType: media.mimeType,
      size: media.size,
      width: media.width,
      height: media.height,
      duration: media.duration,
      alt: {
        en: media.altEn,
        bn: media.altBn,
      },
      caption: {
        en: media.captionEn,
        bn: media.captionBn,
      },
      uploadedBy: media.uploadedBy
        ? {
            id: media.uploadedBy.id,
            name: media.uploadedBy.name,
            email: media.uploadedBy.email,
          }
        : null,
      folder: media.folder,
      tags: media.tags,
      isPublic: media.isPublic,
      cloudinaryId: media.cloudinaryId,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }

  buildMediaData(file, uploadedBy, additionalData = {}) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      type: additionalData.type || this.detectMediaType(file.mimetype),
      mimeType: file.mimetype,
      size: file.size,
      width: additionalData.width,
      height: additionalData.height,
      duration: additionalData.duration,
      altEn: additionalData.alt?.en,
      altBn: additionalData.alt?.bn,
      captionEn: additionalData.caption?.en,
      captionBn: additionalData.caption?.bn,
      uploadedById: uploadedBy,
      folder: additionalData.folder || 'general',
      tags: additionalData.tags || [],
      isPublic: additionalData.isPublic ?? true,
      cloudinaryId: additionalData.cloudinaryId,
    };
  }

  detectMediaType(mimeType = '') {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    return 'image';
  }

  // Get all media files
  async getAllMedia(query, userId, userRole) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = buildSortObject(query.sort || '-createdAt');

    const where = {};

    if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(userRole)) {
      where.uploadedById = userId;
    }

    if (query.type) where.type = query.type;
    if (query.folder) where.folder = query.folder;
    if (query.uploadedBy) where.uploadedById = query.uploadedBy;

    if (query.search) {
      where.OR = [
        { filename: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return {
      media: media.map((item) => this.mapMedia(item)),
      pagination: { page, limit, total },
    };
  }

  // Get single media file
  async getMedia(mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!media) {
      throw new AppError('Media file not found', 404);
    }

    return this.mapMedia(media);
  }

  // Upload media file
  async uploadMedia(file, uploadedBy, additionalData = {}) {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    const media = await prisma.media.create({
      data: this.buildMediaData(file, uploadedBy, additionalData),
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.mapMedia(media);
  }

  // Upload multiple files
  async uploadMultipleMedia(files, uploadedBy, additionalData = {}) {
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    const uploads = await Promise.all(
      files.map((file) =>
        prisma.media.create({
          data: this.buildMediaData(file, uploadedBy, additionalData),
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        })
      )
    );

    return uploads.map((media) => this.mapMedia(media));
  }

  // Update media metadata
  async updateMedia(mediaId, updates, userId, userRole) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });

    if (!media) {
      throw new AppError('Media file not found', 404);
    }

    if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(userRole) && media.uploadedById !== userId) {
      throw new AppError('You do not have permission to update this media', 403);
    }

    const allowedUpdates = ['alt', 'caption', 'tags', 'folder', 'isPublic'];
    const data = {};

    Object.keys(updates).forEach((key) => {
      if (!allowedUpdates.includes(key)) {
        return;
      }

      if (key === 'alt') {
        data.altEn = updates.alt?.en;
        data.altBn = updates.alt?.bn;
      } else if (key === 'caption') {
        data.captionEn = updates.caption?.en;
        data.captionBn = updates.caption?.bn;
      } else {
        data[key] = updates[key];
      }
    });

    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.mapMedia(updatedMedia);
  }

  // Delete media file
  async deleteMedia(mediaId, userId, userRole) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });

    if (!media) {
      throw new AppError('Media file not found', 404);
    }

    if (![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(userRole) && media.uploadedById !== userId) {
      throw new AppError('You do not have permission to delete this media', 403);
    }

    try {
      const filePath = path.join(__dirname, '../../../uploads', media.filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await prisma.media.delete({ where: { id: mediaId } });

    return { message: 'Media file deleted successfully' };
  }

  // Get media statistics
  async getMediaStats() {
    const [totalMedia, imageCount, videoCount, documentCount, sizeStats, recentUploads] =
      await Promise.all([
        prisma.media.count(),
        prisma.media.count({ where: { type: 'image' } }),
        prisma.media.count({ where: { type: 'video' } }),
        prisma.media.count({ where: { type: 'document' } }),
        prisma.media.aggregate({
          _sum: { size: true },
        }),
        prisma.media.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
        }),
      ]);

    return {
      totalMedia,
      imageCount,
      videoCount,
      documentCount,
      totalSize: sizeStats._sum.size || 0,
      recentUploads: recentUploads.map((upload) => this.mapMedia(upload)),
    };
  }
}

export default new MediaService();
