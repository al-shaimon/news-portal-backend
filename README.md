# News Portal Backend API

A modern, scalable REST API for a bilingual (English & Bangla) news portal built with Express.js and
PostgreSQL (via Prisma ORM).

## Features

- 🔐 **Authentication & Authorization** - JWT-based with role-based access control
- 📰 **Article Management** - Full CRUD operations with bilingual support
- 📂 **Category Management** - Hierarchical category structure
- 📢 **Advertisement System** - Ad management with tracking
- 📁 **Media Management** - File upload and management system
- 📊 **Dashboard Analytics** - Comprehensive statistics and insights
- 🌐 **Bilingual Support** - English and Bangla content
- 🔒 **Security** - Helmet, rate limiting, input sanitization
- 📱 **RESTful API** - Well-structured and documented endpoints

## User Roles

- **Super Admin** - Full system access
- **Admin** - Manage content, users, and settings
- **Journalist** - Create and manage own articles
- **Reader** - Public access (no authentication required)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js
│   │   ├── constants.js
│   │   └── multer.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validate.js
│   │   └── rateLimiter.js
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── articles/
│   │   ├── categories/
│   │   ├── advertisements/
│   │   ├── media/
│   │   └── dashboard/
│   ├── utils/          # Utility functions
│   ├── database/       # Database seeders
│   └── server.js       # Entry point
├── prisma/            # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── uploads/           # Uploaded files
├── .env              # Environment variables
├── .gitignore
└── package.json
```

## Installation

1. **Clone the repository**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/news_portal?schema=public
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
SUPER_ADMIN_EMAIL=admin@newsportal.com
SUPER_ADMIN_PASSWORD=Admin@12345
```

4. **Run database migrations**

```bash
npx prisma migrate deploy
```

5. **Create uploads directory**

```bash
mkdir uploads
```

6. **Seed the database** (Creates super admin and default categories)

```bash
npm run seed
```

7. **Start the server**

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Docker Compose Deployment

This repository now ships with a dedicated PostgreSQL container (`backend-db`) that is completely isolated from any other database you might be running (for example, the Postgres instance that powers your Next.js frontend). By default it binds to host port **5434** (configurable via `BACKEND_DB_PORT`), so it won’t collide with an existing Postgres service on `5432`.

1. Ensure your `.env` file is configured (at minimum, `JWT_*`, `SUPER_ADMIN_*`, `FRONTEND_URL`). When developing on the host, Prisma connects through `DATABASE_URL=postgresql://news_portal_user:d123@localhost:5434/news_portal?schema=public`; inside the container the app overrides this to `postgresql://news_portal_user:d123@backend-db:5432/news_portal?schema=public`.
2. Build and start the full stack:

```bash
docker compose up -d --build
```

3. (Optional) Run the seed script inside the container after the database is ready:

```bash
docker compose exec app npm run seed
```

The API will be available on `http://localhost:5000` (or the port you set via `PORT`).

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/change-password` - Change password
- `PUT /api/v1/auth/profile` - Update profile

### Users (Admin Only)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/stats` - Get user statistics

### Articles

- `GET /api/v1/articles` - Get all articles (public)
- `GET /api/v1/articles/:identifier` - Get single article
- `POST /api/v1/articles` - Create article (Auth required)
- `PUT /api/v1/articles/:id` - Update article (Auth required)
- `DELETE /api/v1/articles/:id` - Delete article (Auth required)
- `GET /api/v1/articles/featured/list` - Get featured articles
- `GET /api/v1/articles/breaking/list` - Get breaking news
- `GET /api/v1/articles/trending/list` - Get trending articles
- `GET /api/v1/articles/latest/list` - Get latest articles
- `GET /api/v1/articles/search/query` - Search articles
- `GET /api/v1/articles/:id/related` - Get related articles

### Categories

- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:identifier` - Get single category
- `POST /api/v1/categories` - Create category (Admin)
- `PUT /api/v1/categories/:id` - Update category (Admin)
- `DELETE /api/v1/categories/:id` - Delete category (Admin)
- `GET /api/v1/categories/tree/all` - Get category tree
- `GET /api/v1/categories/menu/list` - Get menu categories
- `GET /api/v1/categories/:identifier/articles` - Get category articles

### Advertisements

- `GET /api/v1/advertisements` - Get all ads (Admin)
- `GET /api/v1/advertisements/active` - Get active ads (Public)
- `GET /api/v1/advertisements/:id` - Get single ad (Admin)
- `POST /api/v1/advertisements` - Create ad (Admin)
- `PUT /api/v1/advertisements/:id` - Update ad (Admin)
- `DELETE /api/v1/advertisements/:id` - Delete ad (Admin)
- `POST /api/v1/advertisements/:id/impression` - Track impression
- `POST /api/v1/advertisements/:id/click` - Track click

### Media

- `GET /api/v1/media` - Get all media (Auth required)
- `GET /api/v1/media/:id` - Get single media
- `POST /api/v1/media/upload` - Upload single file
- `POST /api/v1/media/upload/multiple` - Upload multiple files
- `PUT /api/v1/media/:id` - Update media metadata
- `DELETE /api/v1/media/:id` - Delete media

### Dashboard (Admin Only)

- `GET /api/v1/dashboard/overview` - Get overview statistics
- `GET /api/v1/dashboard/articles/stats` - Get article statistics
- `GET /api/v1/dashboard/articles/top` - Get top articles
- `GET /api/v1/dashboard/categories/distribution` - Category distribution
- `GET /api/v1/dashboard/users/activity` - User activity
- `GET /api/v1/dashboard/traffic/trends` - Traffic trends

## Default Credentials

After running the seeder:

- **Email**: admin@newsportal.com
- **Password**: Admin@12345

⚠️ **IMPORTANT**: Change the password after first login!

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Prisma-powered SQL injection protection
- XSS protection

## Development

### Running in Development Mode

```bash
npm run dev
```

### Code Structure Guidelines

- Each module follows the MVC pattern
- Services handle business logic
- Controllers handle HTTP requests/responses
- Routes define API endpoints
- Validators handle input validation
- Prisma schema defines data models

## Environment Variables

| Variable      | Description                 | Default               |
| ------------- | --------------------------- | --------------------- |
| NODE_ENV      | Environment mode            | development           |
| PORT          | Server port                 | 5000                  |
| DATABASE_URL  | PostgreSQL connection URL   | -                     |
| JWT_SECRET    | JWT secret key              | -                     |
| JWT_EXPIRE    | JWT expiration time         | 7d                    |
| FRONTEND_URL  | Frontend URL for CORS       | http://localhost:3000 |

## Contributing

1. Follow the existing code structure
2. Use ES6 modules syntax
3. Write clean, commented code
4. Test all endpoints before committing

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
Need the database without the API? You can start it standalone with:

```bash
docker compose up -d backend-db
```
