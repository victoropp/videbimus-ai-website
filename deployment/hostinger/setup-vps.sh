#!/bin/bash

# Hostinger VPS Setup Script for Vidibemus AI
# Ubuntu 22.04 LTS
# Run as root or with sudo

set -e  # Exit on error

echo "========================================="
echo "Hostinger VPS Setup for Vidibemus AI"
echo "========================================="

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt install -y curl wget git build-essential software-properties-common ufw fail2ban

# Setup firewall
echo "🔒 Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 25/tcp    # SMTP
ufw allow 587/tcp   # SMTP (submission)
ufw allow 993/tcp   # IMAPS
ufw allow 995/tcp   # POP3S
ufw --force enable

# Install Node.js 20 LTS
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2
echo "🚀 Installing PM2..."
npm install -g pm2
pm2 startup systemd

# Install PostgreSQL 15
echo "🐘 Installing PostgreSQL 15..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-15 postgresql-client-15 postgresql-contrib-15

# Configure PostgreSQL
echo "🔧 Configuring PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE USER vidibemus WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE vidibemus_ai OWNER vidibemus;
GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;
EOF

# Install Redis
echo "📦 Installing Redis..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Configure Redis for production
echo "🔧 Configuring Redis..."
cat > /etc/redis/redis.conf <<EOF
bind 127.0.0.1
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

systemctl restart redis-server

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx
systemctl enable nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install mail server
echo "📧 Installing mail server (Postfix + Dovecot)..."
debconf-set-selections <<< "postfix postfix/mailname string vidibemus.ai"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt install -y postfix dovecot-core dovecot-imapd dovecot-pop3d

# Create application user
echo "👤 Creating application user..."
useradd -m -s /bin/bash vidibemus || echo "User already exists"
usermod -aG sudo vidibemus

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/vidibemus
chown -R vidibemus:vidibemus /var/www/vidibemus

# Setup log directory
echo "📝 Setting up logging..."
mkdir -p /var/log/vidibemus
chown -R vidibemus:vidibemus /var/log/vidibemus

# Install monitoring tools
echo "📊 Installing monitoring tools..."
apt install -y htop netdata

# Setup swap (if not exists)
echo "💾 Setting up swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
fi

# Install additional utilities
echo "🛠️ Installing additional utilities..."
apt install -y zip unzip ncdu iotop

echo "✅ Basic VPS setup complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Change PostgreSQL password: sudo -u postgres psql -c \"ALTER USER vidibemus PASSWORD 'your_secure_password';\""
echo "2. Configure Postfix for your domain"
echo "3. Run the deploy script to install the application"
echo "4. Configure SSL with: certbot --nginx -d vidibemus.ai -d www.vidibemus.ai"
echo "5. Update firewall rules if needed"
echo ""
echo "📝 Check setup-notes.md for detailed configuration instructions"