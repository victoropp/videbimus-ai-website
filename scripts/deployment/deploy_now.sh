#!/bin/bash

# Automated VPS Deployment Script
echo "🚀 Starting automated deployment to Hostinger VPS..."

VPS_IP="31.97.117.30"
VPS_PASS="Advance@UK@2025"

# Install sshpass if needed (for automated password entry)
if ! command -v sshpass &> /dev/null; then
    echo "📦 Installing sshpass for automated deployment..."
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "Please install sshpass manually or use the manual deployment method"
        exit 1
    fi
fi

# Create setup script locally
cat > /tmp/setup_vps.sh <<'SETUP_SCRIPT'
#!/bin/bash
set -e

echo "🚀 Starting Vidibemus AI VPS Setup..."

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git vim build-essential software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban \
    htop net-tools zip unzip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install PostgreSQL 15
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-15 postgresql-client-15 postgresql-contrib-15

# Install Redis
apt install -y redis-server

# Install Nginx
apt install -y nginx

# Install Certbot
apt install -y certbot python3-certbot-nginx

# Configure PostgreSQL
sudo -u postgres psql <<EOF
CREATE USER vidibemus WITH PASSWORD 'fb671b96bdd3463085f9dfd645af44d4';
CREATE DATABASE vidibemus_ai OWNER vidibemus;
GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;
EOF

# Configure Redis
sed -i 's/^# requirepass .*/requirepass 1405675dc0d791fb76726d61c8959938/' /etc/redis/redis.conf
sed -i 's/^bind 127.0.0.1 ::1/bind 127.0.0.1/' /etc/redis/redis.conf
systemctl restart redis

# Create application user
useradd -m -s /bin/bash vidibemus || echo "User exists"
usermod -aG sudo vidibemus

# Create directories
mkdir -p /var/www/vidibemus
mkdir -p /var/log/vidibemus
mkdir -p /var/backups/vidibemus
chown -R vidibemus:vidibemus /var/www/vidibemus
chown -R vidibemus:vidibemus /var/log/vidibemus

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

# Clone repository
cd /var/www/vidibemus
sudo -u vidibemus git clone https://github.com/victoropp/videbimus-ai-website.git .

# Create environment file
cat > /var/www/vidibemus/.env.local <<'ENV'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://videbimusai.com
NEXTAUTH_URL=https://videbimusai.com
NEXTAUTH_SECRET=CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
DATABASE_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
REDIS_URL=redis://:1405675dc0d791fb76726d61c8959938@localhost:6379
JWT_SECRET=3d8f72a9b4c5e6f1827394a0b5c6d7e8
ENCRYPTION_KEY=f47ac10b58cc4372a5670e02b2c3d479
EMAIL_FROM=noreply@videbimusai.com
ENV

chown vidibemus:vidibemus /var/www/vidibemus/.env.local

# Install dependencies and build
cd /var/www/vidibemus
sudo -u vidibemus npm ci --production=false
sudo -u vidibemus npx prisma generate
sudo -u vidibemus npx prisma migrate deploy || true
sudo -u vidibemus npm run build

# Create PM2 config
cat > /var/www/vidibemus/ecosystem.config.js <<'PM2'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vidibemus',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
PM2

chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js

# Start application
sudo -u vidibemus pm2 start /var/www/vidibemus/ecosystem.config.js
sudo -u vidibemus pm2 save
pm2 startup systemd -u vidibemus --hp /home/vidibemus

# Configure Nginx
cat > /etc/nginx/sites-available/vidibemus <<'NGINX'
server {
    listen 80;
    server_name videbimusai.com www.videbimusai.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/vidibemus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "✅ Deployment complete!"
SETUP_SCRIPT

# Copy and execute on VPS
echo "📤 Uploading setup script to VPS..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no /tmp/setup_vps.sh root@$VPS_IP:/root/setup.sh

echo "🔧 Executing setup on VPS (this will take 15-20 minutes)..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no root@$VPS_IP "chmod +x /root/setup.sh && bash /root/setup.sh"

echo "✅ Deployment complete!"
echo "🌐 Your website should be accessible at http://31.97.117.30"
echo "📋 Next steps:"
echo "1. Configure DNS in Cloudflare to point to 31.97.117.30"
echo "2. Set up SSL certificate"