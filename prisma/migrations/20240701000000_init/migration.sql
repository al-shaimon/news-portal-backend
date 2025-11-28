-- Enums
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'journalist', 'reader');
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'archived', 'scheduled');
CREATE TYPE "AdType" AS ENUM ('banner', 'sidebar', 'in_content', 'popup');
CREATE TYPE "AdPosition" AS ENUM ('top', 'middle', 'bottom', 'sidebar_top', 'sidebar_middle', 'sidebar_bottom');
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'document');

-- Users
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'reader',
  "avatar" TEXT,
  "phone" VARCHAR(50),
  "bio" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  "lastLogin" TIMESTAMP,
  "refreshToken" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE "Category" (
  "id" UUID PRIMARY KEY,
  "nameEn" VARCHAR(255) NOT NULL,
  "nameBn" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "descriptionEn" TEXT,
  "descriptionBn" TEXT,
  "parentId" UUID,
  "image" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "showInMenu" BOOLEAN NOT NULL DEFAULT true,
  "metaTitleEn" TEXT,
  "metaTitleBn" TEXT,
  "metaDescriptionEn" TEXT,
  "metaDescriptionBn" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL
);

CREATE INDEX "Category_parent_idx" ON "Category" ("parentId");
CREATE INDEX "Category_order_idx" ON "Category" ("order");

-- Articles
CREATE TABLE "Article" (
  "id" UUID PRIMARY KEY,
  "titleEn" TEXT NOT NULL,
  "titleBn" TEXT NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "excerptEn" TEXT,
  "excerptBn" TEXT,
  "contentEn" TEXT NOT NULL,
  "contentBn" TEXT NOT NULL,
  "featuredImage" JSONB,
  "gallery" JSONB,
  "tags" JSONB,
  "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
  "publishedAt" TIMESTAMP,
  "scheduledAt" TIMESTAMP,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isBreaking" BOOLEAN NOT NULL DEFAULT false,
  "isTrending" BOOLEAN NOT NULL DEFAULT false,
  "views" INTEGER NOT NULL DEFAULT 0,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "readTime" INTEGER NOT NULL DEFAULT 0,
  "metaTitleEn" TEXT,
  "metaTitleBn" TEXT,
  "metaDescriptionEn" TEXT,
  "metaDescriptionBn" TEXT,
  "metaKeywords" TEXT[] NOT NULL DEFAULT '{}',
  "allowComments" BOOLEAN NOT NULL DEFAULT true,
  "categoryId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT,
  CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT
);

CREATE INDEX "Article_status_idx" ON "Article" ("status");
CREATE INDEX "Article_category_idx" ON "Article" ("categoryId");
CREATE INDEX "Article_author_idx" ON "Article" ("authorId");
CREATE INDEX "Article_publishedAt_idx" ON "Article" ("publishedAt");

-- Self relation join table for related articles
CREATE TABLE "_ArticleToArticle" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL,
  CONSTRAINT "_ArticleToArticle_A_fkey" FOREIGN KEY ("A") REFERENCES "Article" ("id") ON DELETE CASCADE,
  CONSTRAINT "_ArticleToArticle_B_fkey" FOREIGN KEY ("B") REFERENCES "Article" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "_ArticleToArticle_AB_unique" ON "_ArticleToArticle" ("A", "B");
CREATE INDEX "_ArticleToArticle_B_index" ON "_ArticleToArticle" ("B");

-- Advertisements
CREATE TABLE "Advertisement" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "titleEn" TEXT,
  "titleBn" TEXT,
  "descriptionEn" TEXT,
  "descriptionBn" TEXT,
  "type" "AdType" NOT NULL,
  "position" "AdPosition" NOT NULL,
  "image" JSONB NOT NULL,
  "linkUrl" TEXT NOT NULL,
  "openInNewTab" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "displayPages" TEXT[] NOT NULL DEFAULT '{}',
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "client" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Advertisement categories junction
CREATE TABLE "AdvertisementCategory" (
  "advertisementId" UUID NOT NULL,
  "categoryId" UUID NOT NULL,
  CONSTRAINT "AdvertisementCategory_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement" ("id") ON DELETE CASCADE,
  CONSTRAINT "AdvertisementCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE,
  PRIMARY KEY ("advertisementId", "categoryId")
);

-- Media
CREATE TABLE "Media" (
  "id" UUID PRIMARY KEY,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "type" "MediaType" NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "duration" INTEGER,
  "altEn" TEXT,
  "altBn" TEXT,
  "captionEn" TEXT,
  "captionBn" TEXT,
  "uploadedById" UUID NOT NULL,
  "folder" TEXT NOT NULL DEFAULT 'general',
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "cloudinaryId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT
);

CREATE INDEX "Media_uploadedBy_idx" ON "Media" ("uploadedById");
CREATE INDEX "Media_type_idx" ON "Media" ("type");
