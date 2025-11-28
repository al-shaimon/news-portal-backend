import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';

class UserService {
  sanitizeUser(user) {
    if (!user) return null;
    const { password, refreshToken, ...rest } = user;
    return rest;
  }

  mapUserWithArticles(user) {
    if (!user) return null;
    const sanitized = this.sanitizeUser(user);

    if (user.articles) {
      sanitized.articles = user.articles.map((article) => ({
        id: article.id,
        title: {
          en: article.titleEn,
          bn: article.titleBn,
        },
        slug: article.slug,
        status: article.status,
        publishedAt: article.publishedAt,
      }));
    }

    return sanitized;
  }

  // Get all users with pagination and filters
  async getAllUsers(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = buildSortObject(query.sort || '-createdAt');

    const where = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => this.sanitizeUser(user)),
      pagination: { page, limit, total },
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        articles: {
          select: {
            id: true,
            titleEn: true,
            titleBn: true,
            slug: true,
            status: true,
            publishedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.mapUserWithArticles(user);
  }

  // Create new user (Admin only)
  async createUser(userData) {
    const { email, password } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    return this.sanitizeUser(user);
  }

  // Update user
  async updateUser(userId, updates) {
    delete updates.password;
    delete updates.refreshToken;

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
      });

      return this.sanitizeUser(user);
    } catch (error) {
      throw new AppError('User not found', 404);
    }
  }

  // Delete user (soft delete)
  async deleteUser(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    } catch (error) {
      throw new AppError('User not found', 404);
    }

    return { message: 'User deactivated successfully' };
  }

  // Permanently delete user
  async permanentlyDeleteUser(userId) {
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      throw new AppError('User not found', 404);
    }

    return { message: 'User permanently deleted' };
  }

  // Get user statistics
  async getUserStats() {
    const [totalUsers, activeUsers, inactiveUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byRole: byRole.map((entry) => ({
        role: entry.role,
        count: entry._count.role,
      })),
    };
  }
}

export default new UserService();
