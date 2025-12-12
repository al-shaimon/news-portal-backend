import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB, { prisma } from '../../config/database.js';
import { createSlug } from '../../utils/slugUtils.js';
import { USER_ROLES } from '../../config/constants.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedArticles = async () => {
  try {
    await connectDB();

    console.log('📰 Starting article seeding...\n');

    // Find an author (super_admin, admin, or journalist)
    const author = await prisma.user.findFirst({
      where: {
        role: {
          in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.JOURNALIST],
        },
      },
    });

    if (!author) {
      console.error('❌ Error: No admin or journalist user found!');
      console.log('ℹ️  Please create at least one admin or journalist user first\n');
      process.exit(1);
    }

    console.log('✅ Found author:', author.email, `(${author.role})`);

    // Load article data from JSON file
    const articleDataPath = path.join(__dirname, '../../../article-seed.json');

    if (!fs.existsSync(articleDataPath)) {
      console.error('❌ Error: article-seed.json not found!');
      console.log('ℹ️  Expected location:', articleDataPath);
      process.exit(1);
    }

    const articleData = JSON.parse(fs.readFileSync(articleDataPath, 'utf-8'));
    console.log(`📄 Loaded ${articleData.length} articles from article-seed.json\n`);

    // Check if articles already exist
    const existingArticleCount = await prisma.article.count();
    if (existingArticleCount > 0) {
      console.log(`⚠️  Warning: ${existingArticleCount} articles already exist in database`);
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question('Do you want to continue and add more articles? (y/n): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Article seeding cancelled\n');
        process.exit(0);
      }
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log('🚀 Starting to seed articles...\n');

    for (const articleItem of articleData) {
      try {
        // Generate slug from English title
        const slug = createSlug(articleItem.title.en);

        // Check if article with same slug already exists
        const existingArticle = await prisma.article.findUnique({
          where: { slug },
        });

        if (existingArticle) {
          console.log(`⏭️  Skipped: "${articleItem.title.en}" (slug already exists)`);
          skippedCount++;
          continue;
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
          where: { id: articleItem.category },
        });

        if (!category) {
          console.log(
            `⚠️  Warning: Category ${articleItem.category} not found for article "${articleItem.title.en}"`
          );
          console.log('   Using first available category...');

          const firstCategory = await prisma.category.findFirst();
          if (!firstCategory) {
            console.error('❌ Error: No categories found in database!');
            console.log('ℹ️  Please run: npm run seed:admin first\n');
            process.exit(1);
          }
          articleItem.category = firstCategory.id;
        }

        // Calculate read time (average reading speed: 200 words per minute)
        const wordCount = articleItem.content.en.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);

        // Prepare article data
        const articleData = {
          titleEn: articleItem.title.en,
          titleBn: articleItem.title.bn,
          slug,
          excerptEn: articleItem.excerpt?.en || null,
          excerptBn: articleItem.excerpt?.bn || null,
          contentEn: articleItem.content.en,
          contentBn: articleItem.content.bn,
          featuredImage: articleItem.featuredImage || null,
          gallery: articleItem.gallery || null,
          tags: articleItem.tags || null,
          status: articleItem.status || 'draft',
          publishedAt: articleItem.status === 'published' ? new Date() : null,
          scheduledAt: articleItem.scheduledAt ? new Date(articleItem.scheduledAt) : null,
          isFeatured: articleItem.isFeatured || false,
          isBreaking: articleItem.isBreaking || false,
          isTrending: articleItem.isTrending || false,
          views: 0,
          likes: 0,
          shares: 0,
          readTime,
          metaTitleEn: articleItem.metaTitle?.en || articleItem.title.en,
          metaTitleBn: articleItem.metaTitle?.bn || articleItem.title.bn,
          metaDescriptionEn: articleItem.metaDescription?.en || articleItem.excerpt?.en || null,
          metaDescriptionBn: articleItem.metaDescription?.bn || articleItem.excerpt?.bn || null,
          metaKeywords: articleItem.metaKeywords || [],
          allowComments: articleItem.allowComments !== false,
          categoryId: articleItem.category,
          authorId: author.id,
        };

        // Create article
        const createdArticle = await prisma.article.create({
          data: articleData,
        });

        console.log(`✅ Created: "${createdArticle.titleEn}" (${createdArticle.status})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating article "${articleItem.title.en}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Article Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully created: ${successCount} articles`);
    if (skippedCount > 0) {
      console.log(`⏭️  Skipped (duplicates): ${skippedCount} articles`);
    }
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} articles`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (successCount > 0) {
      console.log('🎉 Article seeding completed successfully!');
      console.log('ℹ️  You can now view articles in your news portal\n');
    } else {
      console.log('⚠️  No new articles were created\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedArticles();
