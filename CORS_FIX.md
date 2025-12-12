# CORS Configuration Fix Guide

## Problem

Frontend at `https://thecontemporary.news` is getting CORS errors when trying to access the backend
API.

## Solution Applied

### 1. Updated CORS Configuration in `server.js`

The CORS middleware has been updated to:

- ✅ Allow multiple origins (localhost + production domains)
- ✅ Support both `www` and non-`www` versions
- ✅ Handle credentials properly
- ✅ Allow all necessary HTTP methods
- ✅ Support preflight OPTIONS requests
- ✅ Expose necessary headers

### 2. Allowed Origins

The following origins are now allowed:

- `http://localhost:3000` (local development)
- `http://localhost:3001` (local development alternate)
- `https://thecontemporary.news` (production)
- `https://www.thecontemporary.news` (production with www)
- Any origin specified in `FRONTEND_URL` environment variable

## Production Deployment Steps

### On Your VPS (Hostinger)

1. **Update the `.env` file on your server:**

```bash
cd /path/to/your/backend
nano .env
```

Add or update:

```env
FRONTEND_URL=https://thecontemporary.news
NODE_ENV=production
```

2. **Restart your Docker containers:**

```bash
docker compose down
docker compose up -d --build
```

3. **Verify the changes:**

```bash
# Check if containers are running
docker compose ps

# Check backend logs
docker compose logs app -f
```

## Testing CORS

### Method 1: Browser Console

Open your frontend (`https://thecontemporary.news`) and check the browser console:

```javascript
fetch('https://YOUR_BACKEND_URL/health')
  .then((response) => response.json())
  .then((data) => console.log('Success:', data))
  .catch((error) => console.error('Error:', error));
```

### Method 2: CURL Test

Test from command line:

```bash
# Test basic GET request
curl -I https://YOUR_BACKEND_URL/api/v1/categories

# Test CORS preflight (OPTIONS)
curl -X OPTIONS https://YOUR_BACKEND_URL/api/v1/categories \
  -H "Origin: https://thecontemporary.news" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

Expected response headers:

```
Access-Control-Allow-Origin: https://thecontemporary.news
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

## Common Issues & Solutions

### Issue 1: Still Getting CORS Errors

**Solution:**

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to backend directory
cd /path/to/backend

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs app -f
```

### Issue 2: Backend Not Using Updated Code

**Solution:**

```bash
# Force rebuild without cache
docker compose down
docker compose build --no-cache app
docker compose up -d
```

### Issue 3: Environment Variables Not Loading

**Solution:**

```bash
# Verify .env file exists and is readable
cat .env

# Check if Docker is reading it
docker compose exec app env | grep FRONTEND_URL

# If not found, restart containers
docker compose restart
```

### Issue 4: Multiple Subdomains

If you have multiple subdomains (api.example.com, admin.example.com, etc.):

Update `server.js` allowed origins:

```javascript
const allowedOrigins = [
  'https://thecontemporary.news',
  'https://www.thecontemporary.news',
  'https://admin.thecontemporary.news',
  'https://api.thecontemporary.news',
  // Add more as needed
];
```

## Frontend Configuration

Make sure your frontend is making requests to the correct backend URL:

### Next.js Example

```javascript
// .env.local or .env.production
NEXT_PUBLIC_API_URL=https://backoffice.thecontemporary.news/api/v1
```

### Fetch/Axios Configuration

```javascript
// With credentials (cookies)
fetch('https://backoffice.thecontemporary.news/api/v1/articles', {
  method: 'GET',
  credentials: 'include', // Important for cookies/auth
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // If using JWT
  },
});
```

## Verification Checklist

- [ ] Backend `.env` has `FRONTEND_URL=https://thecontemporary.news`
- [ ] Backend code has been updated (git pull)
- [ ] Docker containers rebuilt with `--no-cache`
- [ ] Docker containers are running (`docker compose ps`)
- [ ] No errors in logs (`docker compose logs app`)
- [ ] Preflight OPTIONS requests return 200 OK
- [ ] Response includes CORS headers
- [ ] Frontend is using correct backend URL
- [ ] Frontend includes `credentials: 'include'` if using auth
- [ ] SSL/HTTPS is working on both domains

## Security Notes

1. **Never use `origin: '*'` in production** - This allows any website to access your API
2. **Keep credentials: true** - Necessary for cookie-based authentication
3. **Use HTTPS** - Always use SSL in production
4. **Validate JWT tokens** - Don't rely only on CORS for security
5. **Rate limiting** - Already implemented in the backend

## Need More Help?

Check these files:

- `backend/src/server.js` - CORS configuration
- `backend/.env` - Environment variables
- `backend/docker-compose.yml` - Docker setup
- Backend logs: `docker compose logs app -f`

## Quick Fix Script

Create a file `fix-cors.sh` on your VPS:

```bash
#!/bin/bash
echo "Fixing CORS configuration..."

cd /path/to/your/backend

# Update from git
git pull origin main

# Update .env if needed
if ! grep -q "FRONTEND_URL=https://thecontemporary.news" .env; then
    echo "FRONTEND_URL=https://thecontemporary.news" >> .env
fi

# Rebuild and restart
docker compose down
docker compose build --no-cache app
docker compose up -d

echo "Done! Check logs with: docker compose logs app -f"
```

Run it:

```bash
chmod +x fix-cors.sh
./fix-cors.sh
```

## Contact

If issues persist after following these steps, check:

1. Backend logs for specific errors
2. Browser console for detailed CORS error messages
3. Network tab in browser DevTools to see actual request/response headers
