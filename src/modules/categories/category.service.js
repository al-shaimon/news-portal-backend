import Category from '../../models/Category.model.js';
import Article from '../../models/Article.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createSlug, createUniqueSlug } from '../../utils/slugUtils.js';

class CategoryService {
  // Get all categories
  async getAllCategories(query = {}) {
    const filter = {};

    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.showInMenu !== undefined) filter.showInMenu = query.showInMenu === 'true';
    if (query.parent) {
      filter.parent = query.parent === 'null' ? null : query.parent;
    }

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .populate('subcategories')
      .sort('order')
      .lean();

    return categories;
  }

  // Get category by ID or slug
  async getCategory(identifier) {
    const filter = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { slug: identifier };

    const category = await Category.findOne(filter)
      .populate('parent', 'name slug')
      .populate('subcategories')
      .lean();

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  // Create category
  async createCategory(categoryData) {
    // Generate slug from English name
    const baseSlug = createSlug(categoryData.name.en);
    const slug = await createUniqueSlug(Category, baseSlug);

    const category = await Category.create({
      ...categoryData,
      slug,
    });

    return category;
  }

  // Update category
  async updateCategory(categoryId, updates) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Update slug if English name changed
    if (updates.name && updates.name.en && updates.name.en !== category.name.en) {
      const baseSlug = createSlug(updates.name.en);
      updates.slug = await createUniqueSlug(Category, baseSlug, categoryId);
    }

    Object.assign(category, updates);
    await category.save();

    return category;
  }

  // Delete category
  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has articles
    const articleCount = await Article.countDocuments({ category: categoryId });
    if (articleCount > 0) {
      throw new AppError(
        'Cannot delete category with existing articles. Please reassign or delete articles first.',
        400
      );
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: categoryId });
    if (subcategoryCount > 0) {
      throw new AppError(
        'Cannot delete category with subcategories. Please delete subcategories first.',
        400
      );
    }

    await Category.findByIdAndDelete(categoryId);

    return { message: 'Category deleted successfully' };
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree() {
    const categories = await Category.find({ isActive: true }).sort('order').lean();

    // Build tree structure
    const categoryMap = {};
    const tree = [];

    // Create map
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    // Build tree
    categories.forEach((cat) => {
      if (cat.parent) {
        const parentId = cat.parent.toString();
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryMap[cat._id.toString()]);
        }
      } else {
        tree.push(categoryMap[cat._id.toString()]);
      }
    });

    return tree;
  }

  // Get menu categories
  async getMenuCategories() {
    const categories = await Category.find({
      isActive: true,
      showInMenu: true,
      parent: null,
    })
      .populate('subcategories')
      .sort('order')
      .lean();

    return categories;
  }

  // Get category with articles
  async getCategoryWithArticles(identifier, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { slug: identifier };

    const category = await Category.findOne(filter).lean();

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const [articles, total] = await Promise.all([
      Article.find({
        category: category._id,
        status: 'published',
        publishedAt: { $lte: new Date() },
      })
        .populate('author', 'name avatar')
        .sort('-publishedAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments({
        category: category._id,
        status: 'published',
      }),
    ]);

    return {
      category,
      articles,
      pagination: { page, limit, total },
    };
  }
}

export default new CategoryService();
