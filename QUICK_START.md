# Quick Start Guide - News Portal Backend

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already created with default values. Update if needed:

- MongoDB connection string
- JWT secrets
- Admin credentials
- Frontend URL

### 3. Create Upload Directory

```bash
mkdir uploads
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
net start MongoDB

# Or using MongoDB Compass, just ensure the connection is active
```

### 5. Seed Database

This creates the super admin and default categories:

```bash
npm run seed
```

**Default Login Credentials:**

- Email: `admin@newsportal.com`
- Password: `Admin@12345`

⚠️ Change the password after first login!

### 6. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## Testing the API

### 1. Check Health

```bash
curl http://localhost:5000/health
```

### 2. Login as Admin

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@newsportal.com","password":"Admin@12345"}'
```

Copy the `accessToken` from the response.

### 3. Get Categories (Public)

```bash
curl http://localhost:5000/api/v1/categories
```

### 4. Create an Article (Authenticated)

```bash
curl -X POST http://localhost:5000/api/v1/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": {"en": "Test Article", "bn": "টেস্ট আর্টিকেল"},
    "content": {"en": "Article content", "bn": "নিবন্ধের বিষয়বস্তু"},
    "category": "CATEGORY_ID_FROM_PREVIOUS_REQUEST",
    "status": "published"
  }'
```

## Project Structure Overview

```
backend/
├── src/
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── models/             # MongoDB models
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User management
│   │   ├── articles/       # Article/News management
│   │   ├── categories/     # Category management
│   │   ├── advertisements/ # Advertisement system
│   │   ├── media/          # File upload/management
│   │   └── dashboard/      # Dashboard analytics
│   ├── utils/             # Utility functions
│   ├── database/          # Seeders
│   └── server.js          # Entry point
└── uploads/              # Uploaded files
```

## Module Structure (Example: Articles)

```
articles/
├── article.service.js      # Business logic
├── article.controller.js   # Request handlers
├── article.routes.js       # API routes
└── article.validation.js   # Input validation
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with admin and categories

## API Endpoints Overview

### Public Endpoints (No Auth Required)

- `GET /api/v1/articles` - Get published articles
- `GET /api/v1/categories` - Get categories
- `GET /api/v1/advertisements/active` - Get active ads
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register

### Protected Endpoints (Auth Required)

- `POST /api/v1/articles` - Create article
- `PUT /api/v1/articles/:id` - Update article
- `DELETE /api/v1/articles/:id` - Delete article
- `POST /api/v1/media/upload` - Upload file
- `GET /api/v1/dashboard/*` - Dashboard endpoints

### Admin Only Endpoints

- `GET /api/v1/users` - User management
- `POST /api/v1/categories` - Category management
- `POST /api/v1/advertisements` - Ad management

## User Roles

1. **Super Admin** - Full access to everything
2. **Admin** - Manage content, users, categories, ads
3. **Journalist** - Create and edit own articles
4. **Reader** - Public access (no auth needed)

## Common Issues & Solutions

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running and the connection string in `.env` is correct.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change the PORT in `.env` or kill the process using port 5000.

### File Upload Error

```
Error: ENOENT: no such file or directory, open 'uploads/...'
```

**Solution**: Create the uploads directory: `mkdir uploads`

## Next Steps

1. ✅ Backend is set up and running
2. 📱 Integrate with your Next.js frontend
3. 🎨 Customize categories and content
4. 🔐 Change default admin password
5. 🚀 Deploy to production

## Testing with Postman

1. Import the base URL: `http://localhost:5000/api/v1`
2. Create environment variables:
   - `base_url`: `http://localhost:5000/api/v1`
   - `token`: (set after login)
3. Use the API documentation to test endpoints

## Production Deployment

Before deploying:

1. Change all secrets in `.env`
2. Set `NODE_ENV=production`
3. Use production MongoDB (MongoDB Atlas)
4. Configure proper CORS settings
5. Set up proper file storage (AWS S3, Cloudinary)
6. Enable HTTPS
7. Set up monitoring and logging

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`

For issues or questions, create an issue in the repository.
