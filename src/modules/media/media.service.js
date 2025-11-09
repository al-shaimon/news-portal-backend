import Media from '../../models/Media.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MediaService {
  // Get all media files
  async getAllMedia(query, userId, userRole) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = buildSortObject(query.sort || '-createdAt');

    const filter = {};

    // Non-admins can only see their own uploads
    if (!['admin', 'super_admin'].includes(userRole)) {
      filter.uploadedBy = userId;
    }

    if (query.type) filter.type = query.type;
    if (query.folder) filter.folder = query.folder;
    if (query.uploadedBy) filter.uploadedBy = query.uploadedBy;

    // Search by filename
    if (query.search) {
      filter.$or = [
        { filename: { $regex: query.search, $options: 'i' } },
        { originalName: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [media, total] = await Promise.all([
      Media.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return {
      media,
      pagination: { page, limit, total },
    };
  }

  // Get single media file
  async getMedia(mediaId) {
    const media = await Media.findById(mediaId).populate('uploadedBy', 'name email').lean();

    if (!media) {
      throw new AppError('Media file not found', 404);
    }

    return media;
  }

  // Upload media file
  async uploadMedia(file, uploadedBy, additionalData = {}) {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    // Determine media type
    let type = 'image';
    if (file.mimetype.startsWith('video/')) {
      type = 'video';
    } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
      type = 'document';
    }

    // Create media record
    const media = await Media.create({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      type: type,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: uploadedBy,
      folder: additionalData.folder || 'general',
      alt: additionalData.alt,
      caption: additionalData.caption,
      tags: additionalData.tags,
    });

    return media;
  }

  // Upload multiple files
  async uploadMultipleMedia(files, uploadedBy, additionalData = {}) {
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    const uploadPromises = files.map((file) => this.uploadMedia(file, uploadedBy, additionalData));

    const media = await Promise.all(uploadPromises);
    return media;
  }

  // Update media metadata
  async updateMedia(mediaId, updates, userId, userRole) {
    const media = await Media.findById(mediaId);

    if (!media) {
      throw new AppError('Media file not found', 404);
    }

    // Check permissions
    if (
      !['admin', 'super_admin'].includes(userRole) &&
      media.uploadedBy.toString() !== userId.toString()
    ) {
      throw new AppError('You do not have permission to update this media', 403);
    }

    // Only allow updating certain fields
    const allowedUpdates = ['alt', 'caption', 'tags', 'folder', 'isPublic'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        media[key] = updates[key];
      }
    });

    await media.save();
    return media;
  }

  // Delete media file
  async deleteMedia(mediaId, userId, userRole) {
    const media = await Media.findById(mediaId);

    if (!media) {
      throw new AppError('Media file not found', 404);
    }

    // Check permissions
    if (
      !['admin', 'super_admin'].includes(userRole) &&
      media.uploadedBy.toString() !== userId.toString()
    ) {
      throw new AppError('You do not have permission to delete this media', 403);
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '../../../uploads', media.filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Media.findByIdAndDelete(mediaId);

    return { message: 'Media file deleted successfully' };
  }

  // Get media statistics
  async getMediaStats() {
    const totalMedia = await Media.countDocuments();
    const imageCount = await Media.countDocuments({ type: 'image' });
    const videoCount = await Media.countDocuments({ type: 'video' });
    const documentCount = await Media.countDocuments({ type: 'document' });

    const sizeStats = await Media.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    const recentUploads = await Media.find()
      .sort('-createdAt')
      .limit(10)
      .populate('uploadedBy', 'name')
      .lean();

    return {
      totalMedia,
      imageCount,
      videoCount,
      documentCount,
      totalSize: sizeStats[0]?.totalSize || 0,
      recentUploads,
    };
  }
}

export default new MediaService();
