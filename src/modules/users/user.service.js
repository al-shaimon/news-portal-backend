import User from '../../models/User.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPaginationParams, buildSortObject } from '../../utils/queryUtils.js';

class UserService {
  // Get all users with pagination and filters
  async getAllUsers(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = buildSortObject(query.sort || '-createdAt');

    // Build filter
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password -refreshToken').sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: { page, limit, total },
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .populate('articles')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Create new user (Admin only)
  async createUser(userData) {
    const { email } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const user = await User.create(userData);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  // Update user
  async updateUser(userId, updates) {
    // Don't allow password update through this method
    delete updates.password;
    delete updates.refreshToken;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Delete user (soft delete)
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return { message: 'User deactivated successfully' };
  }

  // Permanently delete user
  async permanentlyDeleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return { message: 'User permanently deleted' };
  }

  // Get user statistics
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byRole: stats,
    };
  }
}

export default new UserService();
