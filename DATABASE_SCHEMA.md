# Database Schema Documentation

Complete database schema for the News Portal Backend API using PostgreSQL and Prisma ORM.

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Data Models](#data-models)
- [Enums](#enums)
- [Relationships](#relationships)
- [Indexes and Constraints](#indexes-and-constraints)

## Overview

The database uses PostgreSQL 18+ with Prisma ORM. It consists of 5 main tables and 1 join table:

- **User** - Authentication and user management
- **Category** - Hierarchical content categorization
- **Article** - News content with bilingual support
- **Advertisement** - Ad management with tracking
- **Media** - File management system
- **AdvertisementCategory** - Join table for many-to-many relationship

## Entity Relationship Diagram

### Complete Schema Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NEWS PORTAL DATABASE SCHEMA                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│           User               │
├──────────────────────────────┤
│ id: String (PK, UUID)        │
│ name: String                 │
│ email: String (UNIQUE)       │
│ password: String             │
│ role: UserRole (ENUM)        │
│ avatar: String?              │
│ phone: String?               │
│ bio: String?                 │
│ isActive: Boolean            │
│ isEmailVerified: Boolean     │
│ lastLogin: DateTime?         │
│ refreshToken: String?        │
│ createdAt: DateTime          │
│ updatedAt: DateTime          │
└──────────────────────────────┘
         │
         │ 1:Many (Author)
         │
         ├─────────────────────────────────────────┐
         │                                         │
         │ 1:Many (Uploader)                      │
         │                                         │
         ↓                                         ↓
┌──────────────────────────────┐        ┌──────────────────────────────┐
│         Article              │        │           Media              │
├──────────────────────────────┤        ├──────────────────────────────┤
│ id: String (PK, UUID)        │        │ id: String (PK, UUID)        │
│ titleEn: String              │        │ filename: String             │
│ titleBn: String              │        │ originalName: String         │
│ slug: String (UNIQUE)        │        │ url: String                  │
│ excerptEn: String?           │        │ type: MediaType (ENUM)       │
│ excerptBn: String?           │        │ mimeType: String             │
│ contentEn: String            │        │ size: Int                    │
│ contentBn: String            │        │ width: Int?                  │
│ featuredImage: Json?         │        │ height: Int?                 │
│ gallery: Json?               │        │ duration: Int?               │
│ tags: Json?                  │        │ altEn: String?               │
│ status: ArticleStatus (ENUM) │        │ altBn: String?               │
│ publishedAt: DateTime?       │        │ captionEn: String?           │
│ scheduledAt: DateTime?       │        │ captionBn: String?           │
│ isFeatured: Boolean          │        │ uploadedById: String (FK)    │
│ isBreaking: Boolean          │        │ folder: String               │
│ isTrending: Boolean          │        │ tags: String[]               │
│ views: Int                   │        │ isPublic: Boolean            │
│ likes: Int                   │        │ cloudinaryId: String?        │
│ shares: Int                  │        │ createdAt: DateTime          │
│ readTime: Int                │        │ updatedAt: DateTime          │
│ metaTitleEn: String?         │        └──────────────────────────────┘
│ metaTitleBn: String?         │
│ metaDescriptionEn: String?   │
│ metaDescriptionBn: String?   │
│ metaKeywords: String[]       │
│ allowComments: Boolean       │
│ categoryId: String (FK)      │
│ authorId: String (FK)        │
│ createdAt: DateTime          │
│ updatedAt: DateTime          │
└──────────────────────────────┘
         │
         │ Many:1 (Category)
         │
         ↓
┌──────────────────────────────┐
│         Category             │
├──────────────────────────────┤
│ id: String (PK, UUID)        │
│ nameEn: String               │
│ nameBn: String               │
│ slug: String (UNIQUE)        │
│ descriptionEn: String?       │
│ descriptionBn: String?       │
│ parentId: String? (FK)       │←─────┐
│ image: String?               │      │ Self-Join
│ order: Int                   │      │ Parent-Child
│ isActive: Boolean            │      │ Relationship
│ showInMenu: Boolean          │      │
│ metaTitleEn: String?         │      │
│ metaTitleBn: String?         │      │
│ metaDescriptionEn: String?   │──────┘
│ metaDescriptionBn: String?   │
│ createdAt: DateTime          │
│ updatedAt: DateTime          │
└──────────────────────────────┘
         │
         │ Many:Many (via Join Table)
         │
         ↓
┌──────────────────────────────────────┐
│    AdvertisementCategory (JOIN)      │
├──────────────────────────────────────┤
│ advertisementId: String (PK,FK) ─────┼───────┐
│ categoryId: String (PK,FK)           │       │
│                                      │       │
│ @@id([advertisementId, categoryId])  │       │
└──────────────────────────────────────┘       │
                                                │
                                                ↓
                                ┌──────────────────────────────┐
                                │      Advertisement           │
                                ├──────────────────────────────┤
                                │ id: String (PK, UUID)        │
                                │ name: String                 │
                                │ titleEn: String?             │
                                │ titleBn: String?             │
                                │ descriptionEn: String?       │
                                │ descriptionBn: String?       │
                                │ type: AdType (ENUM)          │
                                │ position: AdPosition (ENUM)  │
                                │ image: Json                  │
                                │ linkUrl: String              │
                                │ openInNewTab: Boolean        │
                                │ startDate: DateTime          │
                                │ endDate: DateTime            │
                                │ isActive: Boolean            │
                                │ priority: Int                │
                                │ displayPages: String[]       │
                                │ impressions: Int             │
                                │ clicks: Int                  │
                                │ client: Json?                │
                                │ createdAt: DateTime          │
                                │ updatedAt: DateTime          │
                                └──────────────────────────────┘
```

### Relationship Summary

```text
User (1) ──────> (*) Article [Author relationship]
User (1) ──────> (*) Media [Uploader relationship]
Category (1) ──────> (*) Article [Category assignment]
Category (1) ──────> (*) Category [Self-join: Parent-Child]
Advertisement (*) <──────> (*) Category [Many-to-many via AdvertisementCategory]
```

## Data Models

### User Model

Stores user authentication and profile information.

```prisma
model User {
  id              String          @id @default(uuid())
  name            String
  email           String          @unique
  password        String
  role            UserRole        @default(reader)
  avatar          String?
  phone           String?
  bio             String?
  isActive        Boolean         @default(true)
  isEmailVerified Boolean         @default(false)
  lastLogin       DateTime?
  refreshToken    String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  articles        Article[]       @relation("ArticleAuthor")
  media           Media[]
}
```

**Key Features:**

- UUID primary key for security
- Unique email constraint
- Role-based access control
- Optional profile fields (avatar, phone, bio)
- Email verification tracking
- Last login tracking
- Refresh token storage for JWT

**Relations:**

- `articles`: One-to-many with Article (as author)
- `media`: One-to-many with Media (as uploader)

### Category Model

Hierarchical content organization with parent-child relationships.

```prisma
model Category {
  id                 String                    @id @default(uuid())
  nameEn             String
  nameBn             String
  slug               String                    @unique
  descriptionEn      String?
  descriptionBn      String?
  parentId           String?
  image              String?
  order              Int                       @default(0)
  isActive           Boolean                   @default(true)
  showInMenu         Boolean                   @default(true)
  metaTitleEn        String?
  metaTitleBn        String?
  metaDescriptionEn  String?
  metaDescriptionBn  String?
  createdAt          DateTime                  @default(now())
  updatedAt          DateTime                  @updatedAt
  parent             Category?                 @relation("CategoryChildren", fields: [parentId], references: [id])
  children           Category[]                @relation("CategoryChildren")
  articles           Article[]
  advertisements     AdvertisementCategory[]
}
```

**Key Features:**

- Bilingual names and descriptions (English/Bangla)
- Unique slug for URL-friendly identifiers
- Self-referential relationship (parent-child)
- Ordering capability
- Menu display toggle
- SEO metadata (meta titles, descriptions)
- Active/inactive status

**Relations:**

- `parent`: Many-to-one self-join (child points to parent)
- `children`: One-to-many self-join (parent has multiple children)
- `articles`: One-to-many with Article
- `advertisements`: Many-to-many with Advertisement (via join table)

**Hierarchy Example:**

```text
News (root)
├── Politics (child of News)
│   ├── Local Politics (child of Politics)
│   └── International Politics (child of Politics)
├── Sports (child of News)
└── Technology (child of News)
    └── AI & Machine Learning (child of Technology)
```

### Article Model

News content with rich metadata and bilingual support.

```prisma
model Article {
  id                 String           @id @default(uuid())
  titleEn            String
  titleBn            String
  slug               String           @unique
  excerptEn          String?
  excerptBn          String?
  contentEn          String
  contentBn          String
  featuredImage      Json?
  gallery            Json?
  tags               Json?
  status             ArticleStatus    @default(draft)
  publishedAt        DateTime?
  scheduledAt        DateTime?
  isFeatured         Boolean          @default(false)
  isBreaking         Boolean          @default(false)
  isTrending         Boolean          @default(false)
  views              Int              @default(0)
  likes              Int              @default(0)
  shares             Int              @default(0)
  readTime           Int              @default(0)
  metaTitleEn        String?
  metaTitleBn        String?
  metaDescriptionEn  String?
  metaDescriptionBn  String?
  metaKeywords       String[]         @default([])
  allowComments      Boolean          @default(true)
  categoryId         String
  authorId           String
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
  category           Category         @relation(fields: [categoryId], references: [id])
  author             User             @relation("ArticleAuthor", fields: [authorId], references: [id])
}
```

**Key Features:**

- Full bilingual support (title, excerpt, content)
- Unique slug for SEO-friendly URLs
- Status workflow (draft → published/scheduled → archived)
- Featured/breaking/trending flags
- Performance metrics (views, likes, shares)
- Estimated read time
- SEO optimization (meta tags, keywords)
- Rich media support (featured image, gallery as JSON)
- Flexible tags (stored as JSON)
- Comment control

**Relations:**

- `category`: Many-to-one with Category
- `author`: Many-to-one with User

**JSON Fields:**

- `featuredImage`: `{ url: string, alt: { en: string, bn: string } }`
- `gallery`: `Array<{ url: string, alt: { en: string, bn: string } }>`
- `tags`: `Array<{ en: string, bn: string }>`

### Advertisement Model

Advertisement management with scheduling and tracking.

```prisma
model Advertisement {
  id             String                   @id @default(uuid())
  name           String
  titleEn        String?
  titleBn        String?
  descriptionEn  String?
  descriptionBn  String?
  type           AdType
  position       AdPosition
  image          Json
  linkUrl        String
  openInNewTab   Boolean                  @default(true)
  startDate      DateTime
  endDate        DateTime
  isActive       Boolean                  @default(true)
  priority       Int                      @default(0)
  displayPages   String[]                 @default([])
  impressions    Int                      @default(0)
  clicks         Int                      @default(0)
  client         Json?
  createdAt      DateTime                 @default(now())
  updatedAt      DateTime                 @updatedAt
  categories     AdvertisementCategory[]
}
```

**Key Features:**

- Internal name for management
- Optional bilingual titles/descriptions
- Ad type and position enums
- Date-based scheduling (start/end dates)
- Priority-based ordering
- Page-specific display control
- Performance tracking (impressions, clicks)
- Client information (stored as JSON)
- Active/inactive toggle

**Relations:**

- `categories`: Many-to-many with Category (via join table)

**JSON Fields:**

- `image`: `{ url: string, alt: { en: string, bn: string } }`
- `client`: `{ name: string, contact: string, email: string }`

**Display Logic:**

Ads are shown when:

1. `isActive = true`
2. `startDate <= current_date <= endDate`
3. Matches requested `type` and `position`
4. Requested page in `displayPages[]` or "all" is in array

### Media Model

File management with metadata and organization.

```prisma
model Media {
  id           String     @id @default(uuid())
  filename     String
  originalName String
  url          String
  type         MediaType
  mimeType     String
  size         Int
  width        Int?
  height       Int?
  duration     Int?
  altEn        String?
  altBn        String?
  captionEn    String?
  captionBn    String?
  uploadedById String
  folder       String     @default("general")
  tags         String[]   @default([])
  isPublic     Boolean    @default(true)
  cloudinaryId String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  uploadedBy   User       @relation(fields: [uploadedById], references: [id])
}
```

**Key Features:**

- Dual filename storage (system filename, original name)
- Type classification (image/video/document)
- File metadata (size, mime type, dimensions, duration)
- Bilingual alt text and captions
- Folder-based organization
- Tag-based categorization
- Public/private access control
- Cloud storage integration (Cloudinary support)

**Relations:**

- `uploadedBy`: Many-to-one with User

**Type-Specific Fields:**

- Images: `width`, `height`
- Videos: `width`, `height`, `duration`
- Documents: None (only size and mimeType)

### AdvertisementCategory (Join Table)

Many-to-many relationship between Advertisements and Categories.

```prisma
model AdvertisementCategory {
  advertisementId String
  categoryId      String
  advertisement   Advertisement @relation(fields: [advertisementId], references: [id])
  category        Category      @relation(fields: [categoryId], references: [id])

  @@id([advertisementId, categoryId])
}
```

**Key Features:**

- Composite primary key (both IDs)
- No additional metadata (pure join table)
- Enables targeted ad placement by category

**Usage:**

Allows advertisements to be associated with multiple categories, enabling targeted display. For
example, a tech product ad can appear in both "Technology" and "Gadgets" categories.

## Enums

### UserRole

User permission levels.

```prisma
enum UserRole {
  super_admin  // Full system access
  admin        // Content and user management
  journalist   // Article creation and management
  reader       // Public access
}
```

### ArticleStatus

Article workflow states.

```prisma
enum ArticleStatus {
  draft      // Work in progress
  published  // Live on site
  archived   // Hidden but preserved
  scheduled  // Scheduled for future publication
}
```

### AdType

Advertisement format types.

```prisma
enum AdType {
  banner      // Horizontal banner
  sidebar     // Vertical sidebar
  in_content  // Within article content
  popup       // Overlay popup
}
```

### AdPosition

Advertisement placement positions.

```prisma
enum AdPosition {
  top              // Top of page
  middle           // Middle of page
  bottom           // Bottom of page
  sidebar_top      // Top of sidebar
  sidebar_middle   // Middle of sidebar
  sidebar_bottom   // Bottom of sidebar
}
```

### MediaType

File type classification.

```prisma
enum MediaType {
  image     // Images (jpg, png, gif, webp, etc.)
  video     // Videos (mp4, webm, etc.)
  document  // Documents (pdf, doc, etc.)
}
```

## Relationships

### One-to-Many Relationships

#### User → Article (Author)

- One user can author many articles
- Each article has exactly one author
- Foreign key: `Article.authorId → User.id`

**Cascade Behavior:** Not defined (prevent deletion if articles exist)

#### User → Media (Uploader)

- One user can upload many media files
- Each media file has exactly one uploader
- Foreign key: `Media.uploadedById → User.id`

**Cascade Behavior:** Not defined (prevent deletion if media exists)

#### Category → Article

- One category can contain many articles
- Each article belongs to exactly one category
- Foreign key: `Article.categoryId → Category.id`

**Cascade Behavior:** Not defined (prevent deletion if articles exist)

### Self-Referential Relationship

#### Category → Category (Parent-Child)

- One category can have one parent
- One category can have many children
- Foreign key: `Category.parentId → Category.id` (nullable)

**Structure:**

```text
Root Category (parentId = null)
  ├── Child Category 1 (parentId = Root.id)
  │   ├── Grandchild 1.1 (parentId = Child1.id)
  │   └── Grandchild 1.2 (parentId = Child1.id)
  └── Child Category 2 (parentId = Root.id)
```

**Cascade Behavior:** Not defined (requires manual handling of children)

### Many-to-Many Relationship

#### Advertisement ↔ Category

- One advertisement can be linked to many categories
- One category can have many advertisements
- Join table: `AdvertisementCategory`
- Composite key: `[advertisementId, categoryId]`

**Example:**

```text
Advertisement "Tech Product Ad"
  ├── Category "Technology"
  ├── Category "Gadgets"
  └── Category "Reviews"

Category "Technology"
  ├── Advertisement "Tech Product Ad"
  ├── Advertisement "Software Banner"
  └── Advertisement "Hardware Promotion"
```

## Indexes and Constraints

### Primary Keys

All tables use UUID primary keys for security and distribution:

- `User.id`
- `Category.id`
- `Article.id`
- `Advertisement.id`
- `Media.id`
- `AdvertisementCategory.[advertisementId, categoryId]` (composite)

### Unique Constraints

- `User.email` - Prevents duplicate accounts
- `Category.slug` - SEO-friendly unique URLs
- `Article.slug` - SEO-friendly unique URLs

### Foreign Keys

- `Article.authorId → User.id`
- `Article.categoryId → Category.id`
- `Media.uploadedById → User.id`
- `Category.parentId → Category.id` (self-reference)
- `AdvertisementCategory.advertisementId → Advertisement.id`
- `AdvertisementCategory.categoryId → Category.id`

### Recommended Indexes (Performance)

While Prisma auto-generates indexes for foreign keys and unique constraints, consider adding these
for better query performance:

```sql
-- Article queries
CREATE INDEX idx_article_status ON "Article"(status);
CREATE INDEX idx_article_published ON "Article"("publishedAt");
CREATE INDEX idx_article_featured ON "Article"("isFeatured");
CREATE INDEX idx_article_category ON "Article"("categoryId");
CREATE INDEX idx_article_author ON "Article"("authorId");

-- Category queries
CREATE INDEX idx_category_parent ON "Category"("parentId");
CREATE INDEX idx_category_active ON "Category"("isActive");
CREATE INDEX idx_category_menu ON "Category"("showInMenu");
CREATE INDEX idx_category_order ON "Category"("order");

-- Advertisement queries
CREATE INDEX idx_ad_dates ON "Advertisement"("startDate", "endDate");
CREATE INDEX idx_ad_active ON "Advertisement"("isActive");
CREATE INDEX idx_ad_type_position ON "Advertisement"(type, position);

-- Media queries
CREATE INDEX idx_media_type ON "Media"(type);
CREATE INDEX idx_media_folder ON "Media"(folder);
CREATE INDEX idx_media_uploader ON "Media"("uploadedById");

-- User queries
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_active ON "User"("isActive");
```

## Database Diagram (Simplified)

```text
┌─────────┐     ┌─────────┐     ┌─────────────┐
│  User   │────>│ Article │────>│  Category   │
└─────────┘  1:*└─────────┘  *:1└─────────────┘
    │ 1:*                              │ *:*
    │                                  │
    v                                  v
┌─────────┐              ┌──────────────────────┐
│  Media  │              │ AdvertisementCategory│
└─────────┘              └──────────────────────┘
                                      │ *:1
                                      v
                              ┌───────────────┐
                              │Advertisement  │
                              └───────────────┘
```

## Migration History

The database uses Prisma migrations stored in `prisma/migrations/`:

- `20240701000000_init` - Initial schema with all tables and relationships

## Best Practices

### Querying

1. **Always include relations explicitly:**

   ```javascript
   const article = await prisma.article.findUnique({
     where: { id },
     include: {
       author: true,
       category: true,
     },
   });
   ```

2. **Use select for specific fields:**

   ```javascript
   const categories = await prisma.category.findMany({
     select: {
       id: true,
       nameEn: true,
       nameBn: true,
       slug: true,
     },
   });
   ```

3. **Handle many-to-many correctly:**

   ```javascript
   // Get advertisement with categories
   const ad = await prisma.advertisement.findUnique({
     where: { id },
     include: {
       categories: {
         include: {
           category: true, // Access nested category via join table
         },
       },
     },
   });
   ```

### Data Integrity

1. **Check for dependencies before deletion**
2. **Use transactions for multi-step operations**
3. **Validate foreign key existence before creating records**
4. **Handle null parent IDs for root categories**

### Performance

1. **Use pagination for large datasets**
2. **Add indexes for frequently queried fields**
3. **Avoid N+1 queries with proper includes**
4. **Use select to limit returned fields**
5. **Batch operations when possible**

## Schema Statistics

- **Total Tables:** 6 (5 main + 1 join)
- **Total Enums:** 5
- **Total Relationships:** 8 (5 direct + 2 self-join + 1 many-to-many)
- **UUID Primary Keys:** 5
- **Composite Primary Key:** 1
- **Unique Constraints:** 3
- **Bilingual Fields:** 23 field pairs
- **JSON Fields:** 5
- **Array Fields:** 3
