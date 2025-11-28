# News Portal Backend - API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization
header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this structure:

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "status": "error",
  "message": "Error message"
}
```

### Paginated Response

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

## Authentication Endpoints

### Register User

```
POST /auth/register
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login

```
POST /auth/login
```

**Body:**

```json
{
  "email": "admin@newsportal.com",
  "password": "Admin@12345"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Super Admin",
      "email": "admin@newsportal.com",
      "role": "super_admin"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Article Endpoints

### Get All Articles (Public)

```
GET /articles?page=1&limit=10&category=<categoryId>&status=published&search=<query>
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `category` - Filter by category ID
- `status` - Filter by status (published, draft, archived)
- `isFeatured` - Filter featured articles (true/false)
- `isBreaking` - Filter breaking news (true/false)
- `search` - Search in title and content
- `sort` - Sort field (e.g., -publishedAt, views)

### Get Single Article

```
GET /articles/:slugOrId
```

### Create Article (Auth Required)

```
POST /articles
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": {
    "en": "Breaking News Title",
    "bn": "ব্রেকিং নিউজ শিরোনাম"
  },
  "content": {
    "en": "Article content in English...",
    "bn": "বাংলায় নিবন্ধের বিষয়বস্তু..."
  },
  "excerpt": {
    "en": "Short summary in English",
    "bn": "বাংলায় সংক্ষিপ্ত সারাংশ"
  },
  "category": "category_id",
  "featuredImage": {
    "url": "https://example.com/image.jpg",
    "alt": {
      "en": "Image description",
      "bn": "ছবির বর্ণনা"
    }
  },
  "tags": [{ "en": "politics", "bn": "রাজনীতি" }],
  "status": "published",
  "isFeatured": false,
  "isBreaking": false
}
```

### Get Featured Articles

```
GET /articles/featured/list?limit=5
```

### Get Breaking News

```
GET /articles/breaking/list
```

### Search Articles

```
GET /articles/search/query?q=<search-term>&page=1&limit=10
```

## Category Endpoints

### Get All Categories

```
GET /categories?isActive=true&showInMenu=true
```

### Get Category Tree

```
GET /categories/tree/all
```

### Get Category with Articles

```
GET /categories/:slugOrId/articles?page=1&limit=10
```

### Create Category (Admin)

```
POST /categories
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": {
    "en": "Politics",
    "bn": "রাজনীতি"
  },
  "description": {
    "en": "Political news and updates",
    "bn": "রাজনৈতিক সংবাদ এবং আপডেট"
  },
  "parent": null,
  "order": 1,
  "isActive": true,
  "showInMenu": true
}
```

## Media Endpoints

### Upload Single File

```
POST /media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `file` - The file to upload
- `folder` - Folder name (optional)
- `alt[en]` - Alt text in English (optional)
- `alt[bn]` - Alt text in Bangla (optional)

### Get All Media

```
GET /media?page=1&limit=20&type=image&folder=articles
```

## Dashboard Endpoints (Admin Only)

### Get Overview Statistics

```
GET /dashboard/overview
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "articles": {
      "total": 150,
      "published": 120,
      "draft": 30
    },
    "users": 25,
    "categories": 8,
    "totalViews": 50000,
    "recentArticles": []
  }
}
```

### Get Top Articles

```
GET /dashboard/articles/top?limit=10&days=30
```

### Get Traffic Trends

```
GET /dashboard/traffic/trends?days=30
```

## Advertisement Endpoints

### Get Active Advertisements (Public)

```
GET /advertisements/active?type=banner&position=top&page=home
```

### Track Impression

```
POST /advertisements/:id/impression
```

### Track Click

```
POST /advertisements/:id/click
```

### Create Advertisement (Admin)

```
POST /advertisements
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Homepage Banner",
  "type": "banner",
  "position": "top",
  "image": {
    "url": "https://example.com/ad.jpg",
    "alt": {
      "en": "Advertisement",
      "bn": "বিজ্ঞাপন"
    }
  },
  "linkUrl": "https://example.com",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "isActive": true,
  "displayPages": ["home", "all"]
}
```

## Error Codes

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | Success               |
| 201         | Created               |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Not Found             |
| 429         | Too Many Requests     |
| 500         | Internal Server Error |

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## Notes

1. All dates should be in ISO 8601 format
2. All IDs are UUID strings
3. Slugs are automatically generated from English titles
4. File uploads support images (jpg, png, webp), videos (mp4), and documents (pdf)
5. Maximum file size: 5MB for images, 50MB for videos
