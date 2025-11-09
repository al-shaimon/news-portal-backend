import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
      bn: {
        type: String,
        required: [true, 'Bangla name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      en: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
      },
      bn: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
      },
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showInMenu: {
      type: Boolean,
      default: true,
    },
    metaTitle: {
      en: String,
      bn: String,
    },
    metaDescription: {
      en: String,
      bn: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual for article count
categorySchema.virtual('articleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
