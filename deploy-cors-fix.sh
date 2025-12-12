#!/bin/bash

# CORS Fix Deployment Script for VPS
# Run this on your Hostinger VPS to fix CORS issues

set -e  # Exit on any error

echo "🚀 Starting CORS Fix Deployment..."
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_warning "Please run with sudo for Docker permissions"
fi

# Get the backend directory (current directory or passed as argument)
BACKEND_DIR="${1:-.}"
cd "$BACKEND_DIR"

print_success "Working in: $(pwd)"

# Step 1: Pull latest changes
echo ""
echo "📥 Step 1: Pulling latest changes from Git..."
if git pull origin main; then
    print_success "Git pull successful"
else
    print_error "Git pull failed. Make sure you have committed and pushed changes."
    exit 1
fi

# Step 2: Check if .env file exists
echo ""
echo "🔍 Step 2: Checking .env file..."
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_warning "Creating .env from .env.production.example..."
    cp .env.production.example .env
    print_warning "Please edit .env file with your production settings"
    exit 1
fi

# Step 3: Verify FRONTEND_URL in .env
echo ""
echo "🔍 Step 3: Verifying environment variables..."
if grep -q "FRONTEND_URL=https://thecontemporary.news" .env; then
    print_success "FRONTEND_URL is correctly set"
else
    print_warning "FRONTEND_URL not found or incorrect"
    echo "Adding FRONTEND_URL to .env..."
    echo "FRONTEND_URL=https://thecontemporary.news" >> .env
    print_success "FRONTEND_URL added"
fi

# Step 4: Show current environment variables (sanitized)
echo ""
echo "📋 Current environment configuration:"
echo "------------------------------------"
grep -v "PASSWORD\|SECRET\|KEY" .env | grep -E "FRONTEND_URL|NODE_ENV|BACKEND_DOMAIN" || echo "No relevant env vars found"

# Step 5: Stop containers
echo ""
echo "🛑 Step 4: Stopping Docker containers..."
if docker compose down; then
    print_success "Containers stopped"
else
    print_error "Failed to stop containers"
    exit 1
fi

# Step 6: Remove old images (optional)
echo ""
echo "🗑️  Step 5: Cleaning up old Docker images..."
docker system prune -f
print_success "Cleanup complete"

# Step 7: Rebuild with no cache
echo ""
echo "🔨 Step 6: Rebuilding Docker images (this may take a few minutes)..."
if docker compose build --no-cache; then
    print_success "Docker build successful"
else
    print_error "Docker build failed"
    exit 1
fi

# Step 8: Start containers
echo ""
echo "▶️  Step 7: Starting Docker containers..."
if docker compose up -d; then
    print_success "Containers started"
else
    print_error "Failed to start containers"
    exit 1
fi

# Step 9: Wait for services to be ready
echo ""
echo "⏳ Step 8: Waiting for services to be ready..."
sleep 10

# Step 10: Check container status
echo ""
echo "📊 Step 9: Checking container status..."
docker compose ps

# Step 11: Check if backend is responding
echo ""
echo "🔍 Step 10: Testing backend health..."
if curl -f -s http://localhost:5000/health > /dev/null; then
    print_success "Backend is responding"
else
    print_warning "Backend health check failed, checking logs..."
    docker compose logs app --tail=50
fi

# Step 12: Test CORS
echo ""
echo "🌐 Step 11: Testing CORS configuration..."
CORS_TEST=$(curl -s -I -X OPTIONS \
    -H "Origin: https://thecontemporary.news" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    https://backoffice.thecontemporary.news/health 2>/dev/null | grep -i "access-control" || echo "")

if [ ! -z "$CORS_TEST" ]; then
    print_success "CORS headers detected:"
    echo "$CORS_TEST"
else
    print_warning "CORS headers not detected in response"
    print_warning "This might be normal if testing from localhost"
fi

# Final steps
echo ""
echo "=================================="
print_success "Deployment Complete!"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo "1. Check backend logs: docker compose logs app -f"
echo "2. Test your frontend: https://thecontemporary.news"
echo "3. Monitor for errors in browser console"
echo ""
echo "🔧 Troubleshooting Commands:"
echo "   - View logs: docker compose logs app -f"
echo "   - Restart: docker compose restart"
echo "   - Check status: docker compose ps"
echo "   - Test health: curl http://localhost:5000/health"
echo ""
echo "📚 Documentation: See CORS_FIX.md for detailed troubleshooting"
echo ""

# Ask if user wants to see logs
read -p "Do you want to see the live logs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_success "Showing live logs (Press Ctrl+C to exit)..."
    docker compose logs app -f
fi
