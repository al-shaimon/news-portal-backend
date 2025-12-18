import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';
import { createSlug, createUniqueSlug } from '../../utils/slugUtils.js';
import { ARTICLE_STATUS, USER_ROLES } from '../../config/constants.js';

const isUUID = (value = '') =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value
  );

const calculateReadTime = (content = '') => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

class ArticleService {
  mapArticle(article) {
    if (!article) return null;

    return {
      id: article.id,
      title: {
        en: article.titleEn,
        bn: article.titleBn,
      },
      slug: article.slug,
      excerpt: {
        en: article.excerptEn,
        bn: article.excerptBn,
      },
      content: {
        en: article.contentEn,
        bn: article.contentBn,
      },
      featuredImage: article.featuredImage,
      gallery: article.gallery,
      tags: article.tags,
      category: article.category
        ? {
            id: article.category.id,
            name: {
              en: article.category.nameEn,
              bn: article.category.nameBn,
            },
            slug: article.category.slug,
          }
        : null,
      author: article.author
        ? {
            id: article.author.id,
            name: article.author.name,
            email: article.author.email,
            avatar: article.author.avatar,
            bio: article.author.bio,
          }
        : null,
      status: article.status,
      publishedAt: article.publishedAt,
      scheduledAt: article.scheduledAt,
      isFeatured: article.isFeatured,
      isBreaking: article.isBreaking,
      isTrending: article.isTrending,
      views: article.views,
      likes: article.likes,
      shares: article.shares,
      readTime: article.readTime,
      metaTitle: {
        en: article.metaTitleEn,
        bn: article.metaTitleBn,
      },
      metaDescription: {
        en: article.metaDescriptionEn,
        bn: article.metaDescriptionBn,
      },
      metaKeywords: article.metaKeywords,
      allowComments: article.allowComments,
      relatedArticles: article.relatedArticles
        ? article.relatedArticles.map((related) => ({
            id: related.id,
            title: {
              en: related.titleEn,
              bn: related.titleBn,
            },
            slug: related.slug,
            featuredImage: related.featuredImage,
            publishedAt: related.publishedAt,
          }))
        : [],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  buildArticleData(articleData, authorId = null) {
    const data = {
      titleEn: articleData.title?.en,
      titleBn: articleData.title?.bn,
      excerptEn: articleData.excerpt?.en,
      excerptBn: articleData.excerpt?.bn,
      contentEn: articleData.content?.en,
      contentBn: articleData.content?.bn,
      featuredImage: articleData.featuredImage,
      gallery: articleData.gallery,
      tags: articleData.tags,
      categoryId: articleData.category,
      status: articleData.status,
      publishedAt: articleData.publishedAt ? new Date(articleData.publishedAt) : undefined,
      scheduledAt: articleData.scheduledAt ? new Date(articleData.scheduledAt) : undefined,
      isFeatured: articleData.isFeatured,
      isBreaking: articleData.isBreaking,
      isTrending: articleData.isTrending,
      likes: articleData.likes,
      shares: articleData.shares,
      metaTitleEn: articleData.metaTitle?.en,
      metaTitleBn: articleData.metaTitle?.bn,
      metaDescriptionEn: articleData.metaDescription?.en,
      metaDescriptionBn: articleData.metaDescription?.bn,
      metaKeywords: articleData.metaKeywords,
      allowComments: articleData.allowComments,
    };

    if (authorId) {
      data.authorId = authorId;
    }

    if (articleData.content?.en) {
      data.readTime = calculateReadTime(articleData.content.en);
    }

    if (articleData.status === ARTICLE_STATUS.PUBLISHED && !articleData.publishedAt) {
      data.publishedAt = new Date();
    }

    return data;
  }

  // Get all articles with filters
  async getAllArticles(query, user = null) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = buildSortObject(query.sort || '-publishedAt');

    const where = {};

    if (!user) {
      where.status = ARTICLE_STATUS.PUBLISHED;
      where.publishedAt = { lte: new Date() };
    } else if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
      if (query.status) {
        where.status = query.status;
      }
    } else if (user.role === USER_ROLES.EDITORIAL) {
      // Editorial users can access their own articles in the CMS (drafts included)
      where.authorId = user.id;
      if (query.status) {
        where.status = query.status;
      }
    } else {
      // Default fallback: only published content
      where.status = ARTICLE_STATUS.PUBLISHED;
      where.publishedAt = { lte: new Date() };
    }

    if (query.category) where.categoryId = query.category;
    if (query.author) where.authorId = query.author;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === 'true';
    if (query.isBreaking !== undefined) where.isBreaking = query.isBreaking === 'true';
    if (query.isTrending !== undefined) where.isTrending = query.isTrending === 'true';

    if (query.search) {
      where.OR = [
        { titleEn: { contains: query.search, mode: 'insensitive' } },
        { titleBn: { contains: query.search, mode: 'insensitive' } },
        { contentEn: { contains: query.search, mode: 'insensitive' } },
        { contentBn: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.publishedAt = {};
      if (query.startDate) where.publishedAt.gte = new Date(query.startDate);
      if (query.endDate) where.publishedAt.lte = new Date(query.endDate);
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          author: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles: articles.map((article) => this.mapArticle(article)),
      pagination: { page, limit, total },
    };
  }

  // Get article by ID or slug
  async getArticle(identifier, incrementView = false) {
    const filter = isUUID(identifier)
      ? { id: identifier }
      : { slug: identifier, status: ARTICLE_STATUS.PUBLISHED };

    const article = await prisma.article.findFirst({
      where: filter,
      include: {
        category: true,
        author: true,
      },
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    if (incrementView) {
      await prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      });
      article.views += 1;
    }

    return this.mapArticle(article);
  }

  // Create article
  async createArticle(articleData, authorId) {
    const baseSlug = createSlug(articleData.title.en);
    const slug = await createUniqueSlug('article', baseSlug);
    const data = this.buildArticleData(articleData, authorId);

    const article = await prisma.article.create({
      data: {
        ...data,
        slug,
        metaKeywords: articleData.metaKeywords || [],
      },
      include: {
        category: true,
        author: true,
      },
    });

    return this.mapArticle(article);
  }

  // Update article
  async updateArticle(articleId, updates, userId, userRole) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    if (
      ![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(userRole) &&
      article.authorId !== userId
    ) {
      throw new AppError('You do not have permission to update this article', 403);
    }

    const data = this.buildArticleData(updates);

    if (updates.title?.en && updates.title.en !== article.titleEn) {
      const baseSlug = createSlug(updates.title.en);
      data.slug = await createUniqueSlug('article', baseSlug, articleId);
    }

    if (
      updates.status === ARTICLE_STATUS.PUBLISHED &&
      article.status !== ARTICLE_STATUS.PUBLISHED &&
      !article.publishedAt
    ) {
      data.publishedAt = new Date();
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...data,
        metaKeywords: updates.metaKeywords || article.metaKeywords,
      },
      include: {
        category: true,
        author: true,
      },
    });

    return this.mapArticle(updatedArticle);
  }

  // Delete article
  async deleteArticle(articleId, userId, userRole) {
    if (userRole === USER_ROLES.EDITORIAL) {
      throw new AppError('You do not have permission to delete articles', 403);
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    if (
      ![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(userRole) &&
      article.authorId !== userId
    ) {
      throw new AppError('You do not have permission to delete this article', 403);
    }

    await prisma.article.delete({ where: { id: articleId } });

    return { message: 'Article deleted successfully' };
  }

  async getFeaturedArticles(limit = 5) {
    const articles = await prisma.article.findMany({
      where: {
        status: ARTICLE_STATUS.PUBLISHED,
        isFeatured: true,
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return articles.map((article) => this.mapArticle(article));
  }

  async getBreakingNews() {
    const articles = await prisma.article.findMany({
      where: {
        status: ARTICLE_STATUS.PUBLISHED,
        isBreaking: true,
        publishedAt: { lte: new Date() },
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    return articles.map((article) => this.mapArticle(article));
  }

  async getTrendingArticles(limit = 10) {
    const articles = await prisma.article.findMany({
      where: {
        status: ARTICLE_STATUS.PUBLISHED,
        isTrending: true,
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { views: 'desc' },
      take: limit,
    });

    return articles.map((article) => this.mapArticle(article));
  }

  async getLatestArticles(limit = 10) {
    const articles = await prisma.article.findMany({
      where: {
        status: ARTICLE_STATUS.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return articles.map((article) => this.mapArticle(article));
  }

  async getRelatedArticles(articleId, categoryId, limit = 5) {
    const articles = await prisma.article.findMany({
      where: {
        id: { not: articleId },
        categoryId,
        status: ARTICLE_STATUS.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return articles.map((article) => this.mapArticle(article));
  }

  async searchArticles(searchQuery, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where = {
      status: ARTICLE_STATUS.PUBLISHED,
      publishedAt: { lte: new Date() },
      OR: [
        { titleEn: { contains: searchQuery, mode: 'insensitive' } },
        { titleBn: { contains: searchQuery, mode: 'insensitive' } },
        { contentEn: { contains: searchQuery, mode: 'insensitive' } },
        { contentBn: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: [{ publishedAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles: articles.map((article) => this.mapArticle(article)),
      pagination: { page: Number(page), limit: Number(limit), total },
    };
  }

  async getArticleStats() {
    const [totalArticles, publishedArticles, draftArticles, archivedArticles, totalViews] =
      await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { status: ARTICLE_STATUS.PUBLISHED } }),
        prisma.article.count({ where: { status: ARTICLE_STATUS.DRAFT } }),
        prisma.article.count({ where: { status: ARTICLE_STATUS.ARCHIVED } }),
        prisma.article.aggregate({
          _sum: { views: true },
        }),
      ]);

    const topArticles = await prisma.article.findMany({
      where: { status: ARTICLE_STATUS.PUBLISHED },
      orderBy: { views: 'desc' },
      take: 10,
      select: {
        id: true,
        titleEn: true,
        titleBn: true,
        slug: true,
        views: true,
      },
    });

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      archivedArticles,
      totalViews: totalViews._sum.views || 0,
      topArticles: topArticles.map((article) => ({
        id: article.id,
        title: { en: article.titleEn, bn: article.titleBn },
        slug: article.slug,
        views: article.views,
      })),
    };
  }
}

export default new ArticleService();
