import Article from '../../models/Article.model.js';
import User from '../../models/User.model.js';
import Category from '../../models/Category.model.js';
import Advertisement from '../../models/Advertisement.model.js';
import Media from '../../models/Media.model.js';

class DashboardService {
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
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      User.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Advertisement.countDocuments({ isActive: true }),
      Media.countDocuments(),
      Article.find({ status: 'published' })
        .sort('-publishedAt')
        .limit(5)
        .populate('author', 'name')
        .populate('category', 'name')
        .select('title slug views publishedAt')
        .lean(),
    ]);

    // Get total views
    const viewStats = await Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
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
      totalViews: viewStats[0]?.totalViews || 0,
      recentArticles,
    };
  }

  // Get article statistics by date range
  async getArticleStatsByDateRange(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const articles = await Article.aggregate([
      {
        $match: {
          publishedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' },
          },
          count: { $sum: 1 },
          views: { $sum: '$views' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return articles;
  }

  // Get top performing articles
  async getTopArticles(limit = 10, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const articles = await Article.find({
      status: 'published',
      publishedAt: { $gte: startDate },
    })
      .sort('-views')
      .limit(limit)
      .populate('author', 'name')
      .populate('category', 'name')
      .select('title slug views likes shares publishedAt')
      .lean();

    return articles;
  }

  // Get category-wise article distribution
  async getCategoryDistribution() {
    const distribution = await Article.aggregate([
      {
        $match: { status: 'published' },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          categoryName: '$category.name',
          count: 1,
          totalViews: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return distribution;
  }

  // Get user activity
  async getUserActivity(limit = 10) {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: 'author',
          as: 'articles',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          articleCount: { $size: '$articles' },
          lastLogin: 1,
        },
      },
      { $sort: { articleCount: -1 } },
      { $limit: limit },
    ]);

    return users;
  }

  // Get traffic trends
  async getTrafficTrends(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trends = await Article.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' },
          },
          articles: { $sum: 1 },
          views: { $sum: '$views' },
          likes: { $sum: '$likes' },
          shares: { $sum: '$shares' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trends;
  }
}

export default new DashboardService();
