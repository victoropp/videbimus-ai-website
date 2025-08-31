# Hostinger VPS Deployment Guide

## Prerequisites

- Hostinger VPS with Ubuntu 22.04 LTS
- Root or sudo access
- Domain pointed to VPS IP
- At least 2GB RAM and 20GB storage

## Step 1: Initial VPS Access

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y
```

## Step 2: Run Automated Setup Script

```bash
# Create deployment directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/victoropp/videbimus-ai-website.git vidibemus
cd vidibemus

# Make setup script executable
chmod +x deployment/hostinger/setup-vps.sh

# Run the setup script
sudo ./deployment/hostinger/setup-vps.sh
```

## Step 3: Configure Environment Variables

```bash
# Copy environment template
cp .env.production.template .env.production

# Edit with your actual values
nano .env.production
```

### Required Environment Variables:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://vidibemus.ai

# Database
DATABASE_URL=postgresql://vidibemus:YOUR_SECURE_PASSWORD@localhost:5432/vidibemus_ai

# Authentication
NEXTAUTH_URL=https://vidibemus.ai
NEXTAUTH_SECRET=your_32_char_secret_here

# AI Providers (at least one required)
OPENAI_API_KEY=sk-proj-xxxxx

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
```

## Step 4: Set Up PostgreSQL Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE USER vidibemus WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE vidibemus_ai OWNER vidibemus;
GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;
\q

# Run migrations
cd /var/www/vidibemus
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## Step 5: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp deployment/config/nginx.conf /etc/nginx/sites-available/vidibemus.ai

# Enable the site
sudo ln -s /etc/nginx/sites-available/vidibemus.ai /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 6: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d vidibemus.ai -d www.vidibemus.ai \
  --non-interactive --agree-tos --email admin@vidibemus.ai

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 7: Deploy Application

```bash
cd /var/www/vidibemus

# Install dependencies
npm ci --production=false

# Build the application
npm run build

# Set up PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u vidibemus --hp /home/vidibemus
```

## Step 8: Configure Email Server

```bash
# Run email setup script
sudo ./deployment/config/email-setup.sh

# Create first email account
sudo ./deployment/scripts/manage-emails.sh
# Choose option 1 to create email account
```

## Step 9: Set Up Monitoring

```bash
# Configure monitoring script
chmod +x deployment/monitoring/monitor.sh

# Add to crontab for regular checks
crontab -e

# Add this line:
*/5 * * * * /var/www/vidibemus/deployment/monitoring/monitor.sh once
```

## Step 10: Configure Backups

```bash
# Set up backup script
chmod +x deployment/scripts/backup.sh

# Configure daily backups
crontab -e

# Add this line:
0 2 * * * /var/www/vidibemus/deployment/scripts/backup.sh
```

## Verification Steps

### 1. Check Services Status
```bash
systemctl status nginx
systemctl status postgresql
systemctl status redis-server
pm2 status
```

### 2. Test Website
```bash
# Test locally
curl http://localhost:3000/api/health

# Test externally
curl https://vidibemus.ai/api/health
```

### 3. Check Logs
```bash
# PM2 logs
pm2 logs vidibemus-ai

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Application not starting
```bash
pm2 logs vidibemus-ai --lines 50
npm run build
pm2 restart vidibemus-ai
```

### Database connection issues
```bash
sudo -u postgres psql
\l  # List databases
\du # List users
\q

# Check connection
psql -h localhost -U vidibemus -d vidibemus_ai
```

### Port conflicts
```bash
sudo lsof -i :3000
sudo lsof -i :80
sudo lsof -i :443
```

### SSL issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

## Maintenance Commands

### Update application
```bash
cd /var/www/vidibemus
git pull origin master
npm ci
npm run build
pm2 restart vidibemus-ai
```

### Restart services
```bash
pm2 restart vidibemus-ai
sudo systemctl restart nginx
sudo systemctl restart postgresql
sudo systemctl restart redis-server
```

### View real-time logs
```bash
pm2 logs vidibemus-ai --follow
```

## Security Hardening

### 1. Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 587/tcp  # SMTP
sudo ufw allow 993/tcp  # IMAPS
sudo ufw enable
```

### 2. Fail2ban Setup
```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
```

### 3. Regular Updates
```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

## Contact Support

If you encounter issues:
- UK: +44 7442 852675 (Call or WhatsApp)
- Ghana: +233 248769377 (Call or WhatsApp)
- Email: support@vidibemus.ai