import dotenv from 'dotenv';
import connectDB from '../../config/database.js';
import User from '../../models/User.model.js';
import Category from '../../models/Category.model.js';
import { USER_ROLES } from '../../config/constants.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists:', existingSuperAdmin.email);
      console.log('ℹ️  Use this email and password to login\n');
      process.exit(0);
    }

    // Create Super Admin
    const superAdmin = await User.create({
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@newsportal.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345',
      role: USER_ROLES.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    console.log('✅ Super Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password:', process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345');
    console.log('👤 Role:', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create some default categories
    const categories = [
      {
        name: { en: 'Politics', bn: 'রাজনীতি' },
        slug: 'politics',
        description: { en: 'Political news and updates', bn: 'রাজনৈতিক সংবাদ এবং আপডেট' },
        order: 1,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'Business', bn: 'ব্যবসা' },
        slug: 'business',
        description: { en: 'Business and economy news', bn: 'ব্যবসা এবং অর্থনীতি সংবাদ' },
        order: 2,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'Sports', bn: 'খেলাধুলা' },
        slug: 'sports',
        description: { en: 'Sports news and updates', bn: 'খেলাধুলার সংবাদ এবং আপডেট' },
        order: 3,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'Entertainment', bn: 'বিনোদন' },
        slug: 'entertainment',
        description: { en: 'Entertainment and celebrity news', bn: 'বিনোদন এবং সেলিব্রিটি সংবাদ' },
        order: 4,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'Technology', bn: 'প্রযুক্তি' },
        slug: 'technology',
        description: { en: 'Technology and innovation news', bn: 'প্রযুক্তি এবং উদ্ভাবন সংবাদ' },
        order: 5,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'International', bn: 'আন্তর্জাতিক' },
        slug: 'international',
        description: { en: 'International news', bn: 'আন্তর্জাতিক সংবাদ' },
        order: 6,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'Health', bn: 'স্বাস্থ্য' },
        slug: 'health',
        description: { en: 'Health and wellness news', bn: 'স্বাস্থ্য এবং সুস্থতা সংবাদ' },
        order: 7,
        isActive: true,
        showInMenu: true,
      },
      {
        name: { en: 'Education', bn: 'শিক্ষা' },
        slug: 'education',
        description: { en: 'Education news and updates', bn: 'শিক্ষা সংবাদ এবং আপডেট' },
        order: 8,
        isActive: true,
        showInMenu: true,
      },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} default categories created\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('⚠️  IMPORTANT: Change the super admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();
