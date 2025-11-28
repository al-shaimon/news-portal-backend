import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB, { prisma } from '../../config/database.js';
import { USER_ROLES } from '../../config/constants.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: USER_ROLES.SUPER_ADMIN },
    });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists:', existingSuperAdmin.email);
      console.log('ℹ️  Use this email and password to login\n');
      process.exit(0);
    }

    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.create({
      data: {
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@newsportal.com',
        password: hashedPassword,
        role: USER_ROLES.SUPER_ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const categories = [
      {
        nameEn: 'Politics',
        nameBn: 'রাজনীতি',
        slug: 'politics',
        descriptionEn: 'Political news and updates',
        descriptionBn: 'রাজনৈতিক সংবাদ এবং আপডেট',
        order: 1,
      },
      {
        nameEn: 'Business',
        nameBn: 'ব্যবসা',
        slug: 'business',
        descriptionEn: 'Business and economy news',
        descriptionBn: 'ব্যবসা এবং অর্থনীতি সংবাদ',
        order: 2,
      },
      {
        nameEn: 'Sports',
        nameBn: 'খেলাধুলা',
        slug: 'sports',
        descriptionEn: 'Sports news and updates',
        descriptionBn: 'খেলাধুলার সংবাদ এবং আপডেট',
        order: 3,
      },
      {
        nameEn: 'Entertainment',
        nameBn: 'বিনোদন',
        slug: 'entertainment',
        descriptionEn: 'Entertainment and celebrity news',
        descriptionBn: 'বিনোদন এবং সেলিব্রিটি সংবাদ',
        order: 4,
      },
      {
        nameEn: 'Technology',
        nameBn: 'প্রযুক্তি',
        slug: 'technology',
        descriptionEn: 'Technology and innovation news',
        descriptionBn: 'প্রযুক্তি এবং উদ্ভাবন সংবাদ',
        order: 5,
      },
      {
        nameEn: 'International',
        nameBn: 'আন্তর্জাতিক',
        slug: 'international',
        descriptionEn: 'International news',
        descriptionBn: 'আন্তর্জাতিক সংবাদ',
        order: 6,
      },
      {
        nameEn: 'Health',
        nameBn: 'স্বাস্থ্য',
        slug: 'health',
        descriptionEn: 'Health and wellness news',
        descriptionBn: 'স্বাস্থ্য এবং সুস্থতা সংবাদ',
        order: 7,
      },
      {
        nameEn: 'Education',
        nameBn: 'শিক্ষা',
        slug: 'education',
        descriptionEn: 'Education news and updates',
        descriptionBn: 'শিক্ষা সংবাদ এবং আপডেট',
        order: 8,
      },
    ];

    await prisma.category.createMany({
      data: categories.map((category) => ({
        ...category,
        showInMenu: true,
        isActive: true,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ ${categories.length} default categories created\n`);
    console.log('🎉 Database seeding completed successfully!');
    console.log('⚠️  IMPORTANT: Change the super admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
