import mongoose from 'mongoose';
import { ARTICLE_STATUS } from '../config/constants.js';

const articleSchema = new mongoose.Schema(
  {
    title: {
      en: {
        type: String,
        required: [true, 'English title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
      },
      bn: {
        type: String,
        required: [true, 'Bangla title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      en: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters'],
      },
      bn: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters'],
      },
    },
    content: {
      en: {
        type: String,
        required: [true, 'English content is required'],
      },
      bn: {
        type: String,
        required: [true, 'Bangla content is required'],
      },
    },
    featuredImage: {
      url: String,
      alt: {
        en: String,
        bn: String,
      },
      caption: {
        en: String,
        bn: String,
      },
    },
    gallery: [
      {
        url: String,
        alt: {
          en: String,
          bn: String,
        },
        caption: {
          en: String,
          bn: String,
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: [
      {
        en: String,
        bn: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.DRAFT,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // in minutes
      default: 0,
    },
    metaTitle: {
      en: String,
      bn: String,
    },
    metaDescription: {
      en: String,
      bn: String,
    },
    metaKeywords: [
      {
        type: String,
      },
    ],
    allowComments: {
      type: Boolean,
      default: true,
    },
    relatedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ isFeatured: 1, status: 1 });
articleSchema.index({ isBreaking: 1, status: 1 });
articleSchema.index({ isTrending: 1, status: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({
  'title.en': 'text',
  'title.bn': 'text',
  'content.en': 'text',
  'content.bn': 'text',
});

// Auto-publish scheduled articles
articleSchema.pre('save', function (next) {
  if (this.status === ARTICLE_STATUS.PUBLISHED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Calculate read time based on content length
articleSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.en.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

export default Article;
