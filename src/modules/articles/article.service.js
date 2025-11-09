import Article from '../../models/Article.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';
import { createSlug, createUniqueSlug } from '../../utils/slugUtils.js';
import { ARTICLE_STATUS } from '../../config/constants.js';

class ArticleService {
  // Get all articles with filters
  async getAllArticles(query, user = null) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = buildSortObject(query.sort || '-publishedAt');

    // Build filter
    const filter = {};

    // For public API, only show published articles
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      filter.status = ARTICLE_STATUS.PUBLISHED;
      filter.publishedAt = { $lte: new Date() };
    } else {
      // Admins can filter by status
      if (query.status) filter.status = query.status;
    }

    if (query.category) filter.category = query.category;
    if (query.author) filter.author = query.author;
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';
    if (query.isBreaking !== undefined) filter.isBreaking = query.isBreaking === 'true';
    if (query.isTrending !== undefined) filter.isTrending = query.isTrending === 'true';

    // Search
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Date range
    if (query.startDate || query.endDate) {
      filter.publishedAt = {};
      if (query.startDate) filter.publishedAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.publishedAt.$lte = new Date(query.endDate);
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name slug')
        .populate('author', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return {
      articles,
      pagination: { page, limit, total },
    };
  }

  // Get article by ID or slug
  async getArticle(identifier, incrementView = false) {
    const filter = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { slug: identifier, status: ARTICLE_STATUS.PUBLISHED };

    const article = await Article.findOne(filter)
      .populate('category', 'name slug')
      .populate('author', 'name email avatar bio')
      .populate('relatedArticles', 'title slug featuredImage publishedAt')
      .lean();

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    // Increment view count
    if (incrementView) {
      await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
      article.views += 1;
    }

    return article;
  }

  // Create article
  async createArticle(articleData, authorId) {
    // Generate slug from English title
    const baseSlug = createSlug(articleData.title.en);
    const slug = await createUniqueSlug(Article, baseSlug);

    const article = await Article.create({
      ...articleData,
      slug,
      author: authorId,
    });

    return article;
  }

  // Update article
  async updateArticle(articleId, updates, userId, userRole) {
    const article = await Article.findById(articleId);

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    // Check permissions
    if (
      !['admin', 'super_admin'].includes(userRole) &&
      article.author.toString() !== userId.toString()
    ) {
      throw new AppError('You do not have permission to update this article', 403);
    }

    // Update slug if title changed
    if (updates.title && updates.title.en && updates.title.en !== article.title.en) {
      const baseSlug = createSlug(updates.title.en);
      updates.slug = await createUniqueSlug(Article, baseSlug, articleId);
    }

    // Set published date if status changed to published
    if (updates.status === ARTICLE_STATUS.PUBLISHED && !article.publishedAt) {
      updates.publishedAt = new Date();
    }

    Object.assign(article, updates);
    await article.save();

    return article;
  }

  // Delete article
  async deleteArticle(articleId, userId, userRole) {
    const article = await Article.findById(articleId);

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    // Check permissions
    if (
      !['admin', 'super_admin'].includes(userRole) &&
      article.author.toString() !== userId.toString()
    ) {
      throw new AppError('You do not have permission to delete this article', 403);
    }

    await Article.findByIdAndDelete(articleId);

    return { message: 'Article deleted successfully' };
  }

  // Get featured articles
  async getFeaturedArticles(limit = 5) {
    const articles = await Article.find({
      status: ARTICLE_STATUS.PUBLISHED,
      isFeatured: true,
      publishedAt: { $lte: new Date() },
    })
      .populate('category', 'name slug')
      .populate('author', 'name avatar')
      .sort('-publishedAt')
      .limit(limit)
      .lean();

    return articles;
  }

  // Get breaking news
  async getBreakingNews() {
    const articles = await Article.find({
      status: ARTICLE_STATUS.PUBLISHED,
      isBreaking: true,
      publishedAt: { $lte: new Date() },
    })
      .populate('category', 'name slug')
      .sort('-publishedAt')
      .limit(3)
      .lean();

    return articles;
  }

  // Get trending articles
  async getTrendingArticles(limit = 10) {
    const articles = await Article.find({
      status: ARTICLE_STATUS.PUBLISHED,
      isTrending: true,
      publishedAt: { $lte: new Date() },
    })
      .populate('category', 'name slug')
      .populate('author', 'name avatar')
      .sort('-views')
      .limit(limit)
      .lean();

    return articles;
  }

  // Get latest articles
  async getLatestArticles(limit = 10) {
    const articles = await Article.find({
      status: ARTICLE_STATUS.PUBLISHED,
      publishedAt: { $lte: new Date() },
    })
      .populate('category', 'name slug')
      .populate('author', 'name avatar')
      .sort('-publishedAt')
      .limit(limit)
      .lean();

    return articles;
  }

  // Get related articles
  async getRelatedArticles(articleId, categoryId, limit = 5) {
    const articles = await Article.find({
      _id: { $ne: articleId },
      category: categoryId,
      status: ARTICLE_STATUS.PUBLISHED,
      publishedAt: { $lte: new Date() },
    })
      .populate('category', 'name slug')
      .sort('-publishedAt')
      .limit(limit)
      .lean();

    return articles;
  }

  // Search articles
  async searchArticles(searchQuery, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      status: ARTICLE_STATUS.PUBLISHED,
      publishedAt: { $lte: new Date() },
      $text: { $search: searchQuery },
    };

    const [articles, total] = await Promise.all([
      Article.find(filter, { score: { $meta: 'textScore' } })
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return {
      articles,
      pagination: { page, limit, total },
    };
  }

  // Get article statistics
  async getArticleStats() {
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: ARTICLE_STATUS.PUBLISHED });
    const draftArticles = await Article.countDocuments({ status: ARTICLE_STATUS.DRAFT });
    const archivedArticles = await Article.countDocuments({ status: ARTICLE_STATUS.ARCHIVED });

    const totalViews = await Article.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    const topArticles = await Article.find({ status: ARTICLE_STATUS.PUBLISHED })
      .sort('-views')
      .limit(10)
      .select('title slug views')
      .lean();

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      archivedArticles,
      totalViews: totalViews[0]?.total || 0,
      topArticles,
    };
  }
}

export default new ArticleService();
