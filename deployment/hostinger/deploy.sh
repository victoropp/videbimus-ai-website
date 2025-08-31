#!/bin/bash

# Deployment Script for Vidibemus AI
# Run this after setup-vps.sh

set -e

# Configuration
APP_DIR="/var/www/vidibemus"
REPO_URL="https://github.com/victoroppp/vidibemus-ai-website.git"
BRANCH="main"
PM2_APP_NAME="vidibemus-ai"

echo "🚀 Starting deployment of Vidibemus AI..."

# Switch to app user
cd $APP_DIR

# Clone or pull latest code
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
else
    echo "📥 Pulling latest changes..."
    git fetch origin
    git reset --hard origin/$BRANCH
fi

# Copy production environment file
echo "🔧 Setting up environment..."
if [ -f "$APP_DIR/.env.production" ]; then
    cp .env.production .env.local
else
    echo "⚠️  Warning: .env.production not found. Please create it from .env.production.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️ Building application..."
npm run build

# Setup PM2 configuration
echo "⚙️ Configuring PM2..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/vidibemus/error.log',
    out_file: '/var/log/vidibemus/out.log',
    log_file: '/var/log/vidibemus/combined.log',
    time: true
  }]
};
EOF

# Start or restart application with PM2
echo "🚀 Starting application with PM2..."
pm2 stop $PM2_APP_NAME 2>/dev/null || true
pm2 delete $PM2_APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/vidibemus <<EOF
/var/log/vidibemus/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 vidibemus vidibemus
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "📝 View logs with: pm2 logs $PM2_APP_NAME"
echo "🔄 Restart app with: pm2 restart $PM2_APP_NAME"
echo "📈 Monitor with: pm2 monit"