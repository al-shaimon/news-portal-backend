import mongoose from 'mongoose';
import { AD_TYPES, AD_POSITIONS } from '../config/constants.js';

const advertisementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Advertisement name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    title: {
      en: String,
      bn: String,
    },
    description: {
      en: String,
      bn: String,
    },
    type: {
      type: String,
      enum: Object.values(AD_TYPES),
      required: [true, 'Advertisement type is required'],
    },
    position: {
      type: String,
      enum: Object.values(AD_POSITIONS),
      required: [true, 'Advertisement position is required'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Image URL is required'],
      },
      alt: {
        en: String,
        bn: String,
      },
    },
    linkUrl: {
      type: String,
      required: [true, 'Link URL is required'],
    },
    openInNewTab: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    displayPages: [
      {
        type: String,
        enum: ['home', 'article', 'category', 'all'],
        default: 'all',
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    client: {
      name: String,
      email: String,
      phone: String,
      company: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
advertisementSchema.index({ type: 1, position: 1, isActive: 1 });
advertisementSchema.index({ startDate: 1, endDate: 1 });
advertisementSchema.index({ priority: -1 });

// Virtual for CTR (Click Through Rate)
advertisementSchema.virtual('ctr').get(function () {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Check if ad is currently active
advertisementSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

export default Advertisement;
