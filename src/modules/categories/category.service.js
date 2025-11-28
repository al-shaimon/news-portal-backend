import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { createSlug, createUniqueSlug } from '../../utils/slugUtils.js';

const isUUID = (value = '') =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value
  );

class CategoryService {
  mapCategory(category, { includeChildren = true } = {}) {
    if (!category) return null;

    const mapped = {
      id: category.id,
      name: {
        en: category.nameEn,
        bn: category.nameBn,
      },
      slug: category.slug,
      description: {
        en: category.descriptionEn,
        bn: category.descriptionBn,
      },
      parent: category.parent
        ? {
          id: category.parent.id,
          name: {
            en: category.parent.nameEn,
            bn: category.parent.nameBn,
          },
          slug: category.parent.slug,
        }
        : null,
      image: category.image,
      order: category.order,
      isActive: category.isActive,
      showInMenu: category.showInMenu,
      metaTitle: {
        en: category.metaTitleEn,
        bn: category.metaTitleBn,
      },
      metaDescription: {
        en: category.metaDescriptionEn,
        bn: category.metaDescriptionBn,
      },
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    if (includeChildren && category.children) {
      mapped.subcategories = category.children.map((child) =>
        this.mapCategory(
          {
            ...child,
            parent: undefined,
            children: child.children || [],
          },
          { includeChildren: false }
        )
      );
    }

    return mapped;
  }

  buildCategoryData(payload) {
    return {
      nameEn: payload.name?.en,
      nameBn: payload.name?.bn,
      descriptionEn: payload.description?.en,
      descriptionBn: payload.description?.bn,
      parentId: payload.parent === 'null' ? null : payload.parent,
      image: payload.image,
      order: payload.order,
      isActive: payload.isActive,
      showInMenu: payload.showInMenu,
      metaTitleEn: payload.metaTitle?.en,
      metaTitleBn: payload.metaTitle?.bn,
      metaDescriptionEn: payload.metaDescription?.en,
      metaDescriptionBn: payload.metaDescription?.bn,
    };
  }

  // Get all categories
  async getAllCategories(query = {}) {
    const where = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.showInMenu !== undefined) {
      where.showInMenu = query.showInMenu === 'true';
    }

    if (query.parent) {
      where.parentId = query.parent === 'null' ? null : query.parent;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return categories.map((category) => this.mapCategory(category));
  }

  // Get category by ID or slug
  async getCategory(identifier) {
    const filter = isUUID(identifier) ? { id: identifier } : { slug: identifier };

    const category = await prisma.category.findFirst({
      where: filter,
      include: {
        parent: true,
        children: { orderBy: { order: 'asc' } },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return this.mapCategory(category);
  }

  // Create category
  async createCategory(categoryData) {
    const baseSlug = createSlug(categoryData.name.en);
    const slug = await createUniqueSlug('category', baseSlug);

    const data = {
      ...this.buildCategoryData(categoryData),
      slug,
    };

    const category = await prisma.category.create({ data });
    return this.mapCategory(category, { includeChildren: false });
  }

  // Update category
  async updateCategory(categoryId, updates) {
    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    const data = this.buildCategoryData(updates);

    if (updates.name?.en && updates.name.en !== existingCategory.nameEn) {
      const baseSlug = createSlug(updates.name.en);
      data.slug = await createUniqueSlug('category', baseSlug, categoryId);
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    return this.mapCategory(category);
  }

  // Delete category
  async deleteCategory(categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const [articleCount, subcategoryCount] = await Promise.all([
      prisma.article.count({ where: { categoryId } }),
      prisma.category.count({ where: { parentId: categoryId } }),
    ]);

    if (articleCount > 0) {
      throw new AppError(
        'Cannot delete category with existing articles. Please reassign or delete articles first.',
        400
      );
    }

    if (subcategoryCount > 0) {
      throw new AppError(
        'Cannot delete category with subcategories. Please delete subcategories first.',
        400
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return { message: 'Category deleted successfully' };
  }

  // Get category tree
  async getCategoryTree() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const categoryMap = {};
    const tree = [];

    categories.forEach((cat) => {
      categoryMap[cat.id] = { ...this.mapCategory(cat, { includeChildren: false }), children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parentId) {
        categoryMap[cat.parentId]?.children.push(categoryMap[cat.id]);
      } else {
        tree.push(categoryMap[cat.id]);
      }
    });

    return tree;
  }

  // Get menu categories
  async getMenuCategories() {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        showInMenu: true,
        parentId: null,
      },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isActive: true, showInMenu: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return categories.map((category) => this.mapCategory(category));
  }

  // Get category with articles
  async getCategoryWithArticles(identifier, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = isUUID(identifier) ? { id: identifier } : { slug: identifier };

    const category = await prisma.category.findFirst({ where: filter });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const where = {
      categoryId: category.id,
      status: 'published',
      publishedAt: { lte: new Date() },
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const mappedArticles = articles.map((article) => ({
      id: article.id,
      title: { en: article.titleEn, bn: article.titleBn },
      slug: article.slug,
      excerpt: { en: article.excerptEn, bn: article.excerptBn },
      content: { en: article.contentEn, bn: article.contentBn },
      featuredImage: article.featuredImage,
      category: this.mapCategory(category, { includeChildren: false }),
      author: article.author,
      publishedAt: article.publishedAt,
      status: article.status,
      isFeatured: article.isFeatured,
      isBreaking: article.isBreaking,
      isTrending: article.isTrending,
      views: article.views,
      likes: article.likes,
      shares: article.shares,
    }));

    return {
      category: this.mapCategory(category, { includeChildren: false }),
      articles: mappedArticles,
      pagination: { page: Number(page), limit: Number(limit), total },
    };
  }
}

export default new CategoryService();
