#!/bin/bash
# Complete Fix Script - Copy and paste this entire block into your VPS terminal

echo "🔧 Starting comprehensive fix..."

# Fix as vidibemus user
su - vidibemus << 'EOSU'
cd /var/www/vidibemus

# Check and show current status
echo "📊 Current PM2 Status:"
pm2 status

# Stop everything
pm2 delete all 2>/dev/null || true

# Check if files exist
echo "📁 Checking files..."
ls -la .env.local
ls -la package.json
ls -la ecosystem.config.js

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma migrate deploy --skip-seed || npx prisma db push

# Rebuild application
echo "🏗️ Building application..."
npm run build

# Check if build succeeded
if [ -d ".next" ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - checking error"
    npm run build 2>&1 | tail -20
fi

# Create new PM2 config
cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'vidibemus',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: 5000
  }]
};
PM2

# Create logs directory
mkdir -p logs

# Start with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js
pm2 save

# Wait for app to start
sleep 5

# Check status
echo "📊 Final Status:"
pm2 status
pm2 logs --lines 30

# Test if working
echo "🧪 Testing application..."
curl -I http://localhost:3000
EOSU

# Back as root, check nginx
echo "🌐 Checking Nginx..."
systemctl status nginx --no-pager
nginx -t
systemctl restart nginx

# Final test
echo "🎯 Final test..."
sleep 3
curl -I http://localhost:3000

echo "✅ Fix complete! Check http://31.97.117.30"