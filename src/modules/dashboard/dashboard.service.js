import { prisma } from '../../config/database.js';

class DashboardService {
  formatArticleSummary(article) {
    return {
      id: article.id,
      title: {
        en: article.titleEn,
        bn: article.titleBn,
      },
      slug: article.slug,
      views: article.views,
      likes: article.likes,
      shares: article.shares,
      publishedAt: article.publishedAt,
      author: article.author ? { id: article.author.id, name: article.author.name } : null,
      category: article.category
        ? {
            id: article.category.id,
            name: {
              en: article.category.nameEn,
              bn: article.category.nameBn,
            },
          }
        : null,
    };
  }

  // Get overview statistics
  async getOverviewStats() {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalUsers,
      totalCategories,
      totalAds,
      totalMedia,
      recentArticles,
      viewStats,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'published' } }),
      prisma.article.count({ where: { status: 'draft' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.advertisement.count({ where: { isActive: true } }),
      prisma.media.count(),
      prisma.article.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, nameEn: true, nameBn: true } },
        },
      }),
      prisma.article.aggregate({ _sum: { views: true } }),
    ]);

    return {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
      },
      users: totalUsers,
      categories: totalCategories,
      advertisements: totalAds,
      media: totalMedia,
      totalViews: viewStats._sum.views || 0,
      recentArticles: recentArticles.map((article) => this.formatArticleSummary(article)),
    };
  }

  // Get article statistics by date range
  async getArticleStatsByDateRange(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const results = await prisma.$queryRaw`
      SELECT
        DATE("publishedAt") as date,
        COUNT(*) as count,
        COALESCE(SUM("views"), 0) as views
      FROM "Article"
      WHERE "publishedAt" BETWEEN ${start} AND ${end}
      GROUP BY DATE("publishedAt")
      ORDER BY DATE("publishedAt")
    `;

    return results.map((row) => ({
      date: row.date,
      count: Number(row.count),
      views: Number(row.views),
    }));
  }

  // Get top performing articles
  async getTopArticles(limit = 10, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        publishedAt: { gte: startDate },
      },
      orderBy: { views: 'desc' },
      take: limit,
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, nameEn: true, nameBn: true } },
      },
    });

    return articles.map((article) => this.formatArticleSummary(article));
  }

  // Get category-wise article distribution
  async getCategoryDistribution() {
    const counts = await prisma.article.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      _sum: { views: true },
    });

    const categoryIds = counts.map((entry) => entry.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, nameEn: true, nameBn: true },
    });

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {});

    return counts.map((entry) => ({
      categoryId: entry.categoryId,
      categoryName: categoryMap[entry.categoryId]
        ? {
            en: categoryMap[entry.categoryId].nameEn,
            bn: categoryMap[entry.categoryId].nameBn,
          }
        : null,
      count: entry._count.id,
      totalViews: entry._sum.views || 0,
    }));
  }

  // Get user activity
  async getUserActivity(limit = 10) {
    const articleCounts = await prisma.article.groupBy({
      by: ['authorId'],
      _count: { id: true },
    });

    const userIds = articleCounts.map((entry) => entry.authorId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLogin: true,
      },
    });

    const countMap = articleCounts.reduce((acc, entry) => {
      acc[entry.authorId] = entry._count.id;
      return acc;
    }, {});

    return users
      .map((user) => ({
        ...user,
        articleCount: countMap[user.id] || 0,
      }))
      .sort((a, b) => b.articleCount - a.articleCount)
      .slice(0, limit);
  }

  // Get traffic trends
  async getTrafficTrends(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const results = await prisma.$queryRaw`
      SELECT
        DATE("publishedAt") AS date,
        COUNT(*) AS articles,
        COALESCE(SUM("views"), 0) AS views,
        COALESCE(SUM("likes"), 0) AS likes,
        COALESCE(SUM("shares"), 0) AS shares
      FROM "Article"
      WHERE "status" = 'published' AND "publishedAt" >= ${startDate}
      GROUP BY DATE("publishedAt")
      ORDER BY DATE("publishedAt")
    `;

    return results.map((row) => ({
      date: row.date,
      articles: Number(row.articles),
      views: Number(row.views),
      likes: Number(row.likes),
      shares: Number(row.shares),
    }));
  }
}

export default new DashboardService();
