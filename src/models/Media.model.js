import mongoose from 'mongoose';
import { MEDIA_TYPES } from '../config/constants.js';

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    type: {
      type: String,
      enum: Object.values(MEDIA_TYPES),
      required: [true, 'Media type is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    duration: {
      type: Number, // For videos in seconds
      default: null,
    },
    alt: {
      en: String,
      bn: String,
    },
    caption: {
      en: String,
      bn: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    folder: {
      type: String,
      default: 'general',
    },
    tags: [
      {
        type: String,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    cloudinaryId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ folder: 1 });

// Virtual for human-readable file size
mediaSchema.virtual('formattedSize').get(function () {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(this.size) / Math.log(1024)));
  return Math.round(this.size / Math.pow(1024, i), 2) + ' ' + sizes[i];
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
