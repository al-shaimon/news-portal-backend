# Quick CORS Fix Commands

## On Your VPS (Copy and paste these commands)

### Option 1: Quick One-Liner (Recommended)

```bash
cd /path/to/your/backend && git pull && docker compose down && docker compose build --no-cache && docker compose up -d && docker compose logs app -f
```

Replace `/path/to/your/backend` with your actual path, example:

```bash
cd ~/news-portal-backend && git pull && docker compose down && docker compose build --no-cache && docker compose up -d && docker compose logs app -f
```

### Option 2: Step by Step

```bash
# 1. Go to backend directory
cd /path/to/your/backend

# 2. Pull latest changes
git pull

# 3. Stop containers
docker compose down

# 4. Rebuild (this takes 2-3 minutes)
docker compose build --no-cache

# 5. Start containers
docker compose up -d

# 6. Check logs
docker compose logs app -f
```

### Option 3: Use Deployment Script

```bash
# 1. Make script executable
chmod +x deploy-cors-fix.sh

# 2. Run it
./deploy-cors-fix.sh
```

## What Changed?

### 1. Helmet Configuration (server.js)

- Now allows cross-origin requests
- Won't block CORS headers

### 2. Caddyfile (Reverse Proxy)

- Handles OPTIONS preflight requests directly
- Adds CORS headers at proxy level
- Preserves headers from backend

## Verify CORS is Working

### Test 1: Check OPTIONS Request

```bash
curl -I -X OPTIONS \
  -H "Origin: https://thecontemporary.news" \
  -H "Access-Control-Request-Method: GET" \
  https://backoffice.thecontemporary.news/api/v1/categories
```

**Expected output:**

```
HTTP/2 200
access-control-allow-origin: https://thecontemporary.news
access-control-allow-credentials: true
access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Test 2: Check GET Request

```bash
curl -I \
  -H "Origin: https://thecontemporary.news" \
  https://backoffice.thecontemporary.news/api/v1/categories
```

**Expected output:**

```
HTTP/2 200
access-control-allow-origin: https://thecontemporary.news
access-control-allow-credentials: true
```

### Test 3: Browser Console

Open `https://thecontemporary.news` and run:

```javascript
fetch('https://backoffice.thecontemporary.news/api/v1/categories')
  .then((res) => res.json())
  .then((data) => console.log('✅ SUCCESS!', data))
  .catch((err) => console.error('❌ ERROR:', err));
```

## Still Not Working?

### Check 1: Verify containers are running

```bash
docker compose ps
```

All should show "Up":

- backend-db
- app
- caddy

### Check 2: View backend logs

```bash
docker compose logs app --tail=100
```

Look for:

- "Connected to PostgreSQL via Prisma" ✅
- "News Portal API is running" ✅
- No error messages

### Check 3: View Caddy logs

```bash
docker compose logs caddy --tail=50
```

Look for certificate errors or proxy issues.

### Check 4: Test backend directly

```bash
# From inside VPS
curl http://localhost:5000/health

# Should return:
{"success":true,"message":"News Portal API is running",...}
```

### Check 5: Environment variables

```bash
docker compose exec app env | grep FRONTEND_URL
```

Should show:

```
FRONTEND_URL=https://thecontemporary.news
```

If not found:

```bash
echo "FRONTEND_URL=https://thecontemporary.news" >> .env
docker compose restart
```

## Common Issues

### Issue: "CORS blocked" still showing

**Cause:** Old Docker images cached

**Solution:**

```bash
docker compose down
docker system prune -af  # Remove ALL images (warning: downloads everything again)
docker compose up -d --build
```

### Issue: Caddy not starting

**Cause:** Port 80 or 443 already in use

**Solution:**

```bash
# Check what's using port 80
sudo lsof -i :80

# Check what's using port 443
sudo lsof -i :443

# Stop conflicting service or change ports
```

### Issue: Backend shows old code

**Cause:** Changes not committed/pushed to Git

**Solution:**

```bash
# On your local machine:
git add .
git commit -m "Fix CORS configuration"
git push origin main

# On VPS:
cd /path/to/backend
git pull
docker compose down
docker compose up -d --build
```

## Test Results from Browser

After deployment, you should see in browser console:

✅ **Before (Error):**

```
Access to fetch at 'https://backoffice.thecontemporary.news/...'
from origin 'https://thecontemporary.news' has been blocked by
CORS policy: No 'Access-Control-Allow-Origin' header is present
```

✅ **After (Success):**

```
Status: 200 OK
Response Headers:
  access-control-allow-origin: https://thecontemporary.news
  access-control-allow-credentials: true
```

## Quick Health Check

Run this to verify everything:

```bash
#!/bin/bash
echo "🔍 CORS Health Check"
echo "===================="
echo ""

echo "1. Containers Status:"
docker compose ps
echo ""

echo "2. Backend Health:"
curl -s http://localhost:5000/health | jq .success
echo ""

echo "3. CORS Headers (OPTIONS):"
curl -s -I -X OPTIONS \
  -H "Origin: https://thecontemporary.news" \
  https://backoffice.thecontemporary.news/health | grep -i access-control
echo ""

echo "4. Environment:"
docker compose exec app env | grep FRONTEND_URL
echo ""

echo "Done! ✅"
```

Save as `check-cors.sh`, make executable with `chmod +x check-cors.sh`, then run `./check-cors.sh`

## Support

If CORS errors persist after trying everything:

1. Share the output of: `docker compose logs app --tail=100`
2. Share browser console screenshot
3. Share output of:
   `curl -I -X OPTIONS -H "Origin: https://thecontemporary.news" https://backoffice.thecontemporary.news/health`

The CORS configuration is now at BOTH levels:

- **Express (backend)** - Handles logic
- **Caddy (proxy)** - Adds headers for all responses

This dual-layer approach ensures CORS works even if one layer fails.
