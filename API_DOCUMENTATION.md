# News Portal Backend – API Documentation

Base URL: `http://localhost:5000/api/v1`

All endpoints below assume the `/api/v1` prefix unless stated otherwise. Include `Accept: application/json` on every request.

## Authentication & Headers

- Most endpoints require a JWT. Send it via `Authorization: Bearer <access-token>`.
- Bodies are JSON unless otherwise specified. File uploads use `multipart/form-data`.
- Admin-only routes require the authenticated user to have the `admin` or `super_admin` role. Some sensitive actions (for example, permanently deleting a user) are limited to `super_admin`.

## Health Check

### GET `/health` (Public)

Simple uptime probe.

```json
{
  "success": true,
  "message": "News Portal API is running",
  "timestamp": "2024-02-01T09:20:15.123Z",
  "environment": "development"
}
```

## Common Response Shapes

### Success

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "status": "error",
  "message": "Error message"
}
```

### Paginated

```json
{
  "success": true,
  "message": "Success message",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Pagination defaults: `page=1`, `limit=10` (max 100). Sorting uses the `sort` query string (comma-separated fields, prefix `-` for descending). Unless stated, IDs are UUID strings and timestamps are ISO 8601 UTC strings.

---

## Authentication APIs

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | /auth/register | Public | Create a user (defaults to `reader` role) |
| POST | /auth/login | Public | Exchange credentials for tokens |
| POST | /auth/refresh-token | Public | Issue a new access token |
| POST | /auth/logout | Authenticated | Revoke refresh token |
| GET | /auth/me | Authenticated | Current user details |
| PUT | /auth/change-password | Authenticated | Update password |
| PUT | /auth/profile | Authenticated | Update profile metadata |

### Register

```http
POST /auth/register
```

**Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "journalist"
}
```

**Response**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "f4bf6e3e-63f1-4f0c-9312-3a252c7bbdae",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "reader",
      "avatar": null,
      "phone": null,
      "bio": null,
      "isActive": true,
      "isEmailVerified": false,
      "lastLogin": null,
      "createdAt": "2024-02-01T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

```http
POST /auth/login
```

```json
{
  "email": "admin@newsportal.com",
  "password": "Admin@12345"
}
```

Response mirrors registration (user object + tokens) with `message: "Login successful"`.

### Refresh Token

```http
POST /auth/refresh-token
```

```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }
```

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Logout / Me / Change Password / Profile

- `POST /auth/logout` → `{ "message": "Logged out successfully" }`
- `GET /auth/me` → sanitized user profile
- `PUT /auth/change-password`

```json
{
  "currentPassword": "Current@123",
  "newPassword": "NewPassword@123"
}
```

- `PUT /auth/profile` (all fields optional)

```json
{
  "name": "Jane Reporter",
  "phone": "+8801000000099",
  "bio": "Senior journalist.",
  "avatar": "https://cdn.example.com/avatars/jane.png"
}
```

---

## User Management (Admin only)

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | /users | admin / super_admin | Paginated list with filters |
| POST | /users | admin / super_admin | Create newsroom accounts |
| GET | /users/stats | admin / super_admin | Aggregate metrics |
| GET | /users/:id | admin / super_admin | Fetch user + authored articles |
| PUT | /users/:id | admin / super_admin | Update metadata / role |
| DELETE | /users/:id | admin / super_admin | Soft delete (sets `isActive=false`) |
| DELETE | /users/:id/permanent | super_admin | Hard delete |

### List Users

Query parameters: `page`, `limit`, `sort`, `role`, `isActive`, `search` (matches name/email).

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "d3d53d63-91f8-41b5-89a2-1bbfb730c1fd",
      "name": "Super Admin",
      "email": "admin@newsportal.com",
      "role": "super_admin",
      "isActive": true,
      "createdAt": "2023-12-15T05:02:33.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 24, "totalPages": 3 }
}
```

### Create / Update User

```json
{
  "name": "News Writer",
  "email": "writer@example.com",
  "password": "Writer@123",
  "role": "journalist"
}
```

Update accepts the same fields plus `isActive`.

### Get / Delete

`GET /users/:id` returns the user plus authored article summaries. Delete routes return `{ "message": "...deleted..." }`.

### Stats

```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 24,
    "activeUsers": 21,
    "inactiveUsers": 3,
    "byRole": [
      { "role": "super_admin", "count": 1 },
      { "role": "admin", "count": 4 }
    ]
  }
}
```

---

## Article APIs

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | /articles | Public (+ optional auth) | List published articles (admins can filter drafts) |
| GET | /articles/:identifier | Public | Fetch by slug or UUID (increments views for published) |
| POST | /articles | journalist / admin / super_admin | Create article |
| PUT | /articles/:id | journalist owner / admin / super_admin | Update article |
| DELETE | /articles/:id | journalist owner / admin / super_admin | Delete article |
| GET | /articles/:id/related | Public | Related items in same category |
| GET | /articles/featured/list | Public | Featured articles |
| GET | /articles/breaking/list | Public | Breaking news |
| GET | /articles/trending/list | Public | Trending articles |
| GET | /articles/latest/list | Public | Recent articles |
| GET | /articles/search/query | Public | Full-text search |
| GET | /articles/stats/overview | admin / super_admin | Aggregated stats |

### List Articles

**Query parameters:** `page`, `limit`, `sort` (default `-publishedAt`), `status`, `category`, `author`, `isFeatured`, `isBreaking`, `isTrending`, `search`, `startDate`, `endDate`.

Each article object contains:

```json
{
  "id": "b6a2670d-3d37-4384-bcd5-3d9351a0d1cd",
  "title": { "en": "Breaking News Title", "bn": "ব্রেকিং নিউজ শিরোনাম" },
  "slug": "breaking-news-title",
  "excerpt": { "en": "Short summary", "bn": "সংক্ষিপ্ত সারাংশ" },
  "content": { "en": "Article body...", "bn": "নিবন্ধ..." },
  "featuredImage": {
    "url": "https://cdn.example.com/news/breaking.jpg",
    "alt": { "en": "Image description", "bn": "ছবির বর্ণনা" }
  },
  "gallery": [],
  "tags": [{ "en": "politics", "bn": "রাজনীতি" }],
  "category": {
    "id": "c248c8f5-46f0-4eee-8b4c-1f31d4007c31",
    "name": { "en": "Politics", "bn": "রাজনীতি" },
    "slug": "politics"
  },
  "author": {
    "id": "6a6fb9e6-915d-4ae6-9d3b-d2d4077b65f4",
    "name": "News Writer",
    "email": "writer@example.com",
    "avatar": null,
    "bio": null
  },
  "status": "published",
  "publishedAt": "2024-02-12T05:30:00.000Z",
  "scheduledAt": null,
  "isFeatured": false,
  "isBreaking": false,
  "isTrending": true,
  "views": 420,
  "likes": 12,
  "shares": 3,
  "readTime": 4,
  "metaTitle": { "en": "Breaking News Title", "bn": "ব্রেকিং নিউজ শিরোনাম" },
  "metaDescription": { "en": "SEO description", "bn": "এসইও বর্ণনা" },
  "metaKeywords": ["politics", "breaking-news"],
  "allowComments": true,
  "relatedArticles": [],
  "createdAt": "2024-02-11T23:05:00.000Z",
  "updatedAt": "2024-02-12T05:30:00.000Z"
}
```

### Create Article

```json
{
  "title": { "en": "Breaking News Title", "bn": "ব্রেকিং নিউজ শিরোনাম" },
  "excerpt": { "en": "Short summary", "bn": "সংক্ষিপ্ত সারাংশ" },
  "content": { "en": "Article content...", "bn": "বাংলা বিষয়বস্তু..." },
  "category": "c248c8f5-46f0-4eee-8b4c-1f31d4007c31",
  "featuredImage": {
    "url": "https://cdn.example.com/news/breaking.jpg",
    "alt": { "en": "Image description", "bn": "ছবির বর্ণনা" }
  },
  "gallery": [{ "url": "https://cdn.example.com/news/photo-1.jpg" }],
  "tags": [{ "en": "politics", "bn": "রাজনীতি" }],
  "status": "published",
  "isFeatured": false,
  "isBreaking": false,
  "isTrending": true,
  "publishedAt": "2024-02-12T05:30:00.000Z",
  "scheduledAt": null,
  "likes": 0,
  "shares": 0,
  "metaTitle": { "en": "Breaking News Title", "bn": "ব্রেকিং নিউজ শিরোনাম" },
  "metaDescription": { "en": "SEO description", "bn": "এসইও বর্ণনা" },
  "metaKeywords": ["politics", "breaking-news"],
  "allowComments": true
}
```

Response returns the full article object (slug auto-generated; published articles get `publishedAt` if omitted).

### Update / Delete

- `PUT /articles/:id` accepts any subset of the above fields.
- `DELETE /articles/:id` returns `{ "message": "Article deleted successfully" }`.

### Related & Highlighted Lists

- `GET /articles/:id/related?limit=5`
- `GET /articles/featured/list?limit=5`
- `GET /articles/breaking/list`
- `GET /articles/trending/list?limit=10`
- `GET /articles/latest/list?limit=10`

Each returns an array in the article summary shape.

### Search

```http
GET /articles/search/query?q=budget&limit=10&page=1
```

Response is paginated with the article summary fields.

### Article Stats (Admin)

```http
GET /articles/stats/overview
```

```json
{
  "success": true,
  "message": "Article statistics retrieved successfully",
  "data": {
    "totalArticles": 150,
    "publishedArticles": 120,
    "draftArticles": 20,
    "archivedArticles": 10,
    "totalViews": 54000,
    "topArticles": [
      {
        "id": "b6a2670d-3d37-4384-bcd5-3d9351a0d1cd",
        "title": { "en": "Breaking News Title", "bn": "ব্রেকিং নিউজ শিরোনাম" },
        "slug": "breaking-news-title",
        "views": 421
      }
    ]
  }
}
```

---

## Category APIs

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | /categories | Public | List categories (filters: `isActive`, `showInMenu`, `parent`) |
| GET | /categories/tree/all | Public | Nested tree of active categories |
| GET | /categories/menu/list | Public | Categories flagged for menus |
| GET | /categories/:identifier | Public | Fetch by slug or UUID |
| GET | /categories/:identifier/articles | Public | Articles within a category (paginated) |
| POST | /categories | admin / super_admin | Create category |
| PUT | /categories/:identifier | admin / super_admin | Update |
| DELETE | /categories/:identifier | admin / super_admin | Delete (fails if articles/subcategories exist) |

### Category Payload

```json
{
  "name": { "en": "Politics", "bn": "রাজনীতি" },
  "description": { "en": "Political news and updates", "bn": "রাজনৈতিক সংবাদ এবং আপডেট" },
  "parent": null,
  "image": "https://cdn.example.com/categories/politics.png",
  "order": 1,
  "isActive": true,
  "showInMenu": true,
  "metaTitle": { "en": "Politics", "bn": "রাজনীতি" },
  "metaDescription": { "en": "Latest politics coverage", "bn": "সর্বশেষ রাজনীতি" }
}
```

Response objects include `id`, `slug`, `parent`, and `subcategories`.

### Category Articles

```http
GET /categories/:identifier/articles?page=1&limit=10
```

Returns a paginated list of article summaries plus the category object.

---

## Media APIs (Authenticated)

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | /media | Any authenticated user | Paginated list (non-admins only see their uploads) |
| POST | /media/upload | Authenticated | Upload single file |
| POST | /media/upload/multiple | Authenticated | Upload up to 10 files |
| GET | /media/:id | Authenticated | Fetch metadata |
| PUT | /media/:id | Owner / admin | Update alt/caption/tags/folder/isPublic |
| DELETE | /media/:id | Owner / admin | Delete media |
| GET | /media/stats/overview | admin / super_admin | Aggregate counts + latest uploads |

### Upload Single File

`POST /media/upload` (multipart)

- `file` (required) – binary file (images ≤ 5 MB, videos ≤ 50 MB, documents ≤ 10 MB)
- `folder` (optional, default `general`)
- `type` (`image`, `video`, `document`) – inferred if omitted
- `alt[en]`, `alt[bn]`, `caption[en]`, `caption[bn]`
- `tags[]` – repeated field value
- `isPublic` – boolean

**Response**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "fb1c383d-96cf-4c34-a51f-9c27fb541b65",
    "filename": "1708150827123-breaking.jpg",
    "originalName": "breaking.jpg",
    "url": "/uploads/1708150827123-breaking.jpg",
    "type": "image",
    "mimeType": "image/jpeg",
    "size": 312399,
    "width": null,
    "height": null,
    "duration": null,
    "alt": { "en": "Breaking photo", "bn": "ব্রেকিং ছবি" },
    "caption": { "en": "Reporter on site", "bn": "ঘটনাস্থলে প্রতিবেদক" },
    "uploadedBy": { "id": "6a6f...", "name": "News Writer", "email": "writer@example.com" },
    "folder": "articles",
    "tags": ["politics"],
    "isPublic": true,
    "cloudinaryId": null,
    "createdAt": "2024-02-17T09:20:27.123Z",
    "updatedAt": "2024-02-17T09:20:27.123Z"
  }
}
```

`POST /media/upload/multiple` behaves similarly but returns an array of media objects.

### List / Update / Delete

- `GET /media` supports `page`, `limit`, `sort`, `type`, `folder`, `uploadedBy`, `search`.
- `PUT /media/:id` body:

```json
{
  "alt": { "en": "Updated alt", "bn": "নতুন বিবরণ" },
  "caption": { "en": "Updated caption", "bn": "নতুন ক্যাপশন" },
  "tags": ["politics", "feature"],
  "folder": "features",
  "isPublic": false
}
```

- `DELETE /media/:id` returns `{ "message": "Media file deleted successfully" }`.

### Stats

`GET /media/stats/overview`

```json
{
  "success": true,
  "message": "Media statistics retrieved successfully",
  "data": {
    "totalMedia": 320,
    "imageCount": 250,
    "videoCount": 40,
    "documentCount": 30,
    "totalSize": 187654321,
    "recentUploads": [
      {
        "id": "fb1c383d-96cf-4c34-a51f-9c27fb541b65",
        "filename": "breaking.jpg",
        "url": "/uploads/breaking.jpg",
        "type": "image",
        "uploadedBy": { "id": "6a6f...", "name": "News Writer" }
      }
    ]
  }
}
```

---

## Advertisement APIs

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | /advertisements/active | Public | Live ads filtered by type/position/page |
| POST | /advertisements/:id/impression | Public | Increment impressions |
| POST | /advertisements/:id/click | Public | Increment clicks |
| GET | /advertisements | admin / super_admin | Paginated list |
| POST | /advertisements | admin / super_admin | Create ad |
| GET | /advertisements/:id | admin / super_admin | Fetch details |
| PUT | /advertisements/:id | admin / super_admin | Update |
| DELETE | /advertisements/:id | admin / super_admin | Delete |
| GET | /advertisements/stats/overview | admin / super_admin | Aggregate statistics |

### Active Ads

```http
GET /advertisements/active?type=banner&position=top&page=home
```

Returns ads with fields:

```json
{
  "id": "572bd884-54dd-4cd0-8c1f-4987734cc6c1",
  "name": "Homepage Banner",
  "title": { "en": "Your brand", "bn": "আপনার ব্র্যান্ড" },
  "description": { "en": "Premium placement", "bn": "প্রিমিয়াম স্থাপন" },
  "type": "banner",
  "position": "top",
  "image": {
    "url": "https://cdn.example.com/ads/home-top.jpg",
    "alt": { "en": "Advertisement", "bn": "বিজ্ঞাপন" }
  },
  "linkUrl": "https://example.com",
  "openInNewTab": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "priority": 10,
  "displayPages": ["home", "all"],
  "client": "Example Brand",
  "categories": [
    {
      "id": "c248c8f5-46f0-4eee-8b4c-1f31d4007c31",
      "name": { "en": "Politics", "bn": "রাজনীতি" },
      "slug": "politics"
    }
  ],
  "impressions": 10234,
  "clicks": 543
}
```

### Create / Update Ad

```json
{
  "name": "Homepage Banner",
  "title": { "en": "Your brand", "bn": "আপনার ব্র্যান্ড" },
  "description": { "en": "Premium placement", "bn": "প্রিমিয়াম স্থাপন" },
  "type": "banner",
  "position": "top",
  "image": {
    "url": "https://cdn.example.com/ads/home-top.jpg",
    "alt": { "en": "Advertisement", "bn": "বিজ্ঞাপন" }
  },
  "linkUrl": "https://example.com",
  "openInNewTab": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "priority": 10,
  "displayPages": ["home", "all"],
  "client": "Example Brand",
  "categories": ["c248c8f5-46f0-4eee-8b4c-1f31d4007c31"]
}
```

### Track Impression / Click

`POST /advertisements/:id/impression` and `POST /advertisements/:id/click` → `{ "message": "Impression tracked" }` / `{ "message": "Click tracked" }`.

### Advertisement Stats

```json
{
  "success": true,
  "message": "Advertisement statistics retrieved successfully",
  "data": {
    "totalAds": 35,
    "activeAds": 18,
    "totalImpressions": 124532,
    "totalClicks": 6532,
    "averageCTR": "5.25",
    "topPerformingAds": [
      { "id": "572bd884-54dd-4cd0-8c1f-4987734cc6c1", "name": "Homepage Banner", "clicks": 543, "impressions": 10234 }
    ]
  }
}
```

---

## Dashboard APIs (Admin only)

| Method | Path | Description |
| --- | --- | --- |
| GET | /dashboard/overview | Combined newsroom KPIs |
| GET | /dashboard/articles/stats | Article counts per day in range |
| GET | /dashboard/articles/top | Top performing articles |
| GET | /dashboard/categories/distribution | Article counts/views per category |
| GET | /dashboard/users/activity | Top authors with article counts |
| GET | /dashboard/traffic/trends | Daily engagement trends |

### Overview Example

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "articles": { "total": 150, "published": 120, "draft": 30 },
    "users": 25,
    "categories": 8,
    "advertisements": 18,
    "media": 320,
    "totalViews": 54000,
    "recentArticles": [
      {
        "id": "b6a2670d-3d37-4384-bcd5-3d9351a0d1cd",
        "title": { "en": "Breaking News Title", "bn": "ব্রেকিং নিউজ শিরোনাম" },
        "slug": "breaking-news-title",
        "views": 421,
        "likes": 12,
        "shares": 3,
        "publishedAt": "2024-02-12T05:30:00.000Z",
        "author": { "id": "6a6f...", "name": "News Writer" },
        "category": { "id": "c248...", "name": { "en": "Politics", "bn": "রাজনীতি" } }
      }
    ]
  }
}
```

Other endpoints return arrays of statistics:

- `/dashboard/articles/stats?startDate=2024-02-01&endDate=2024-02-10`

```json
[ { "date": "2024-02-10", "count": 5, "views": 1500 } ]
```

- `/dashboard/categories/distribution`

```json
[ { "categoryId": "c248...", "categoryName": { "en": "Politics", "bn": "রাজনীতি" }, "count": 45, "totalViews": 18432 } ]
```

- `/dashboard/users/activity?limit=10` → authors sorted by `articleCount`.
- `/dashboard/traffic/trends?days=30` → `{ "date": "2024-02-10", "articles": 5, "views": 1500, "likes": 120, "shares": 40 }`.

---

## Analytics APIs (Admin only)

| Method | Path | Description |
| --- | --- | --- |
| GET | /analytics/realtime | Active users, PV/minute, referrers |
| GET | /analytics/traffic | Time bucketed trend (`window` + `interval`) |
| GET | /analytics/content | Content leaderboard (`sort` by views/likes/shares/publishedAt) |
| GET | /analytics/ads/summary | Aggregate ad stats + per position |
| GET | /analytics/ads/top | Top ads by CTR/impressions/clicks |
| GET | /analytics/media/summary | Media usage breakdown |
| GET | /analytics/auth | Auth/session stats per role |

### Examples

**Realtime**

```json
{
  "success": true,
  "message": "Realtime analytics snapshot retrieved",
  "data": {
    "activeUsers": 3,
    "pageViewsPerMinute": 12,
    "topPages": [{ "path": "/articles/example-article", "views": 420 }],
    "referrers": [
      { "source": "google", "sessions": 30 },
      { "source": "facebook", "sessions": 20 }
    ]
  }
}
```

**Traffic Trend**

```http
GET /analytics/traffic?window=24h&interval=1h
```

```json
{
  "success": true,
  "message": "Traffic trend data retrieved",
  "data": [
    { "ts": "2024-02-15T01:00:00.000Z", "pageViews": 420, "uniqueUsers": 8 },
    { "ts": "2024-02-15T02:00:00.000Z", "pageViews": 380, "uniqueUsers": 6 }
  ]
}
```

**Content Performance**

```http
GET /analytics/content?limit=10&sort=views&order=desc
```

```json
[ { "articleId": "b6a2670d-3d37-4384-bcd5-3d9351a0d1cd", "title": "Breaking News Title", "views": 421, "likes": 12, "shares": 3 } ]
```

**Ad Summary**

```json
{
  "success": true,
  "message": "Advertisement performance summary retrieved",
  "data": {
    "totals": { "impressions": 10234, "clicks": 543, "ctr": 0.0531 },
    "byPosition": [
      { "position": "top", "impressions": 6000, "clicks": 400, "ctr": 0.0667 }
    ]
  }
}
```

**Top Ads**

```json
[ { "adId": "572bd884-54dd-4cd0-8c1f-4987734cc6c1", "title": "Your brand", "position": "top", "impressions": 10234, "clicks": 543, "ctr": 0.0531 } ]
```

**Media Summary**

```json
{
  "success": true,
  "message": "Media usage summary retrieved",
  "data": {
    "counts": { "image": 250, "video": 40, "document": 30 },
    "storageMb": 178.23,
    "recentUploads": [
      { "id": "fb1c383d-96cf-4c34-a51f-9c27fb541b65", "filename": "breaking.jpg", "type": "image", "uploadedAt": "2024-02-17T09:20:27.123Z" }
    ]
  }
}
```

**Auth Stats**

```json
{
  "success": true,
  "message": "Authentication statistics retrieved",
  "data": {
    "logins": 58,
    "failedLogins": 0,
    "passwordResets": 0,
    "byRole": {
      "super_admin": 1,
      "admin": 4,
      "journalist": 10,
      "reader": 12
    }
  }
}
```

---

## Rate Limiting & Errors

| Status Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 400 | Validation / bad request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 429 | Too many requests (100 per 15 minutes per IP by default) |
| 500 | Internal server error |

Client IPs hitting `/api/*` are throttled to 100 requests per 15 minutes (configurable via env vars). Exceeding the limit returns HTTP 429 and `message: "Too many requests from this IP..."`.

## Additional Notes

1. Slugs are generated from English titles/names and automatically deduplicated.
2. Upload endpoints accept JPG/PNG/WebP/GIF images, MP4/WebM/Ogg videos, and PDF/DOC/DOCX documents.
3. Maximum file sizes: 5 MB (images), 50 MB (videos), 10 MB (documents).
4. For localized fields, always pass both `en` and `bn` variants when available.
5. Use the documented query parameters to combine filters instead of creating ad-hoc endpoints.

