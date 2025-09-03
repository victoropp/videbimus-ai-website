#!/bin/bash

# VPS Setup Script for Ubuntu 24.04 LTS
# Hostinger VPS: 31.97.117.30
# Domain: videbimusai.com

set -e

echo "🚀 Starting Vidibemus AI VPS Setup for Ubuntu 24.04..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt install -y curl wget git vim build-essential software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban \
    htop net-tools zip unzip

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
echo "⚙️ Installing PM2..."
npm install -g pm2

# Install PostgreSQL 15
echo "🗄️ Installing PostgreSQL 15..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-15 postgresql-client-15 postgresql-contrib-15

# Install Redis
echo "💾 Installing Redis..."
apt install -y redis-server

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Configure PostgreSQL
echo "🗄️ Configuring PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE USER vidibemus WITH PASSWORD 'fb671b96bdd3463085f9dfd645af44d4';
CREATE DATABASE vidibemus_ai OWNER vidibemus;
GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;
EOF

# Configure Redis
echo "💾 Configuring Redis..."
sed -i 's/^# requirepass .*/requirepass 1405675dc0d791fb76726d61c8959938/' /etc/redis/redis.conf
sed -i 's/^bind 127.0.0.1 ::1/bind 127.0.0.1/' /etc/redis/redis.conf
systemctl restart redis

# Create application user
echo "👤 Creating application user..."
useradd -m -s /bin/bash vidibemus || echo "User already exists"
usermod -aG sudo vidibemus

# Create application directories
echo "📁 Creating application directories..."
mkdir -p /var/www/vidibemus
mkdir -p /var/log/vidibemus
mkdir -p /var/backups/vidibemus
chown -R vidibemus:vidibemus /var/www/vidibemus
chown -R vidibemus:vidibemus /var/log/vidibemus
chown -R vidibemus:vidibemus /var/backups/vidibemus

# Configure firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

# Configure fail2ban
echo "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/vidibemus <<'NGINX'
upstream vidibemus_backend {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name videbimusai.com www.videbimusai.com;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name videbimusai.com www.videbimusai.com;

    # SSL will be configured by certbot
    
    client_max_body_size 100M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    
    location / {
        proxy_pass http://vidibemus_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Timeouts for long-running AI requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /_next/static {
        proxy_pass http://vidibemus_backend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    location /api {
        proxy_pass http://vidibemus_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Longer timeout for API calls
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /socket.io {
        proxy_pass http://vidibemus_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

# Enable Nginx site
ln -sf /etc/nginx/sites-available/vidibemus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Install email server components
echo "📧 Installing email server..."
debconf-set-selections <<< "postfix postfix/mailname string videbimusai.com"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt install -y postfix dovecot-core dovecot-imapd dovecot-pop3d

# Setup swap file (4GB)
echo "💾 Setting up swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Set up log rotation
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

# Create deployment script for vidibemus user
echo "📝 Creating deployment script..."
cat > /home/vidibemus/deploy.sh <<'DEPLOY'
#!/bin/bash

set -e

APP_DIR="/var/www/vidibemus"
REPO_URL="https://github.com/victoropp/videbimus-ai-website.git"
BRANCH="master"

echo "🚀 Starting deployment..."

cd $APP_DIR

# Clone or update repository
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
else
    echo "📥 Pulling latest changes..."
    git fetch origin
    git reset --hard origin/$BRANCH
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

# Build application
echo "🏗️ Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
DEPLOY

chown vidibemus:vidibemus /home/vidibemus/deploy.sh
chmod +x /home/vidibemus/deploy.sh

# Create PM2 ecosystem config
echo "⚙️ Creating PM2 configuration..."
cat > /var/www/vidibemus/ecosystem.config.js <<'PM2'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vidibemus',
    instances: 4,
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
PM2

chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js

# System optimization
echo "⚡ Optimizing system..."
cat >> /etc/sysctl.conf <<EOF

# Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# File system
fs.file-max = 2097152
EOF

sysctl -p

echo "✅ VPS Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update DNS records to point to: 31.97.117.30"
echo "2. Run SSL certificate setup: certbot --nginx -d videbimusai.com -d www.videbimusai.com"
echo "3. Deploy application as vidibemus user: su - vidibemus && cd /var/www/vidibemus && bash /home/vidibemus/deploy.sh"
echo "4. Configure environment variables in /var/www/vidibemus/.env.local"
echo ""
echo "📊 Service Status:"
systemctl status postgresql@15-main --no-pager | head -n 3
systemctl status redis --no-pager | head -n 3
systemctl status nginx --no-pager | head -n 3
echo ""
echo "🔑 Database Credentials:"
echo "Database: vidibemus_ai"
echo "User: vidibemus"
echo "Password: fb671b96bdd3463085f9dfd645af44d4"
echo ""
echo "🔑 Redis Password: 1405675dc0d791fb76726d61c8959938"