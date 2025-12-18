import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB, { prisma } from '../../config/database.js';
import { USER_ROLES } from '../../config/constants.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    const isProduction = process.env.NODE_ENV === 'production';

    const generatePassword = () => crypto.randomBytes(24).toString('base64url');

    const ensureUserForRole = async ({ role, envPrefix, defaultName, defaultEmail }) => {
      const existing = await prisma.user.findFirst({ where: { role } });
      if (existing) {
        return { role, email: existing.email, password: null, created: false };
      }

      const name = process.env[`${envPrefix}_NAME`] || defaultName;
      const email = process.env[`${envPrefix}_EMAIL`] || defaultEmail;
      const passwordFromEnv = process.env[`${envPrefix}_PASSWORD`];

      if (isProduction && !passwordFromEnv) {
        throw new Error(
          `Missing ${envPrefix}_PASSWORD. Refusing to seed privileged accounts in production without explicit passwords.`
        );
      }

      const password = passwordFromEnv || generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          isActive: true,
          isEmailVerified: true,
        },
      });

      return { role: user.role, email: user.email, password, created: true };
    };

    const seededUsers = [];
    seededUsers.push(
      await ensureUserForRole({
        role: USER_ROLES.SUPER_ADMIN,
        envPrefix: 'SUPER_ADMIN',
        defaultName: 'Super Admin',
        defaultEmail: 'admin@newsportal.com',
      })
    );
    seededUsers.push(
      await ensureUserForRole({
        role: USER_ROLES.ADMIN,
        envPrefix: 'ADMIN',
        defaultName: 'Admin',
        defaultEmail: 'admin.staff@newsportal.com',
      })
    );
    seededUsers.push(
      await ensureUserForRole({
        role: USER_ROLES.EDITORIAL,
        envPrefix: 'EDITORIAL',
        defaultName: 'Editorial',
        defaultEmail: 'editorial@newsportal.com',
      })
    );

    console.log('✅ Seed users summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    seededUsers.forEach((u) => {
      const status = u.created ? 'created' : 'exists';
      console.log(`👤 ${u.role} (${status})`);
      console.log(`📧 Email: ${u.email}`);
      if (!isProduction && u.password) {
        console.log(`🔑 Password: ${u.password}`);
      } else if (isProduction) {
        console.log('🔑 Password: (set via env)');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    console.log('');

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
    if (!isProduction) {
      console.log('⚠️  IMPORTANT: Change these seeded passwords after first login!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
