#!/bin/bash

# SSH through ngrok and fix the deployment
sshpass -p "Advance@UK@2025" ssh -o StrictHostKeyChecking=no -p 10886 root@0.tcp.eu.ngrok.io << 'ENDSSH'

echo "🔧 Connected! Starting fix..."

# Switch to vidibemus user and fix
su - vidibemus << 'EOSU'
cd /var/www/vidibemus

echo "📊 Current status:"
pm2 list

# Stop all PM2 processes
pm2 delete all 2>/dev/null || true

# Check environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cat > .env.local << 'ENV'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://31.97.117.30
NEXTAUTH_URL=http://31.97.117.30
NEXTAUTH_SECRET=CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
DATABASE_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
REDIS_URL=redis://:1405675dc0d791fb76726d61c8959938@localhost:6379
JWT_SECRET=3d8f72a9b4c5e6f1827394a0b5c6d7e8
ENCRYPTION_KEY=f47ac10b58cc4372a5670e02b2c3d479
ENV
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push --skip-seed

# Build app
echo "🏗️ Building..."
npm run build

# Create proper PM2 config
cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/vidibemus',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
PM2

# Start app
pm2 start ecosystem.config.js
pm2 save
pm2 logs --lines 20
EOSU

# Check Nginx
echo "🌐 Checking Nginx..."
systemctl restart nginx

# Test
sleep 3
curl -I http://localhost:3000

echo "✅ Fix complete!"

ENDSSH