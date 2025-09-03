# Super Simple Deployment - Just Copy & Paste!

## Step 1: Open PowerShell or Command Prompt

## Step 2: Connect to your VPS
Copy and paste this command:
```
ssh root@31.97.117.30
```

When asked "Are you sure you want to continue connecting", type: `yes`
When prompted for password, paste: `Advance@UK@2025`

## Step 3: Run the Complete Setup (Copy & Paste This ENTIRE Block)

Once connected, copy and paste this ENTIRE command block at once:

```bash
wget -O setup.sh https://raw.githubusercontent.com/victoropp/videbimus-ai-website/master/deployment/hostinger/setup-ubuntu24.sh && \
chmod +x setup.sh && \
bash setup.sh
```

**Wait! That won't work because the file isn't in the repo yet. Instead, use this:**

Copy and paste this ENTIRE block (it's long but copy it all):

```bash
cat > setup.sh << 'FULLSCRIPT'
#!/bin/bash
set -e

echo "🚀 Starting Complete Vidibemus AI Setup..."

# Quick system update
apt update -y && DEBIAN_FRONTEND=noninteractive apt upgrade -y

# Install everything needed
apt install -y curl wget git vim build-essential nodejs npm \
    postgresql postgresql-client redis-server nginx \
    certbot python3-certbot-nginx ufw

# Install PM2
npm install -g pm2

# Setup database
sudo -u postgres psql -c "CREATE USER vidibemus WITH PASSWORD 'fb671b96bdd3463085f9dfd645af44d4';"
sudo -u postgres psql -c "CREATE DATABASE vidibemus_ai OWNER vidibemus;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;"

# Configure Redis
echo "requirepass 1405675dc0d791fb76726d61c8959938" >> /etc/redis/redis.conf
systemctl restart redis

# Create app user and directories
useradd -m vidibemus 2>/dev/null || true
mkdir -p /var/www/vidibemus
chown -R vidibemus:vidibemus /var/www/vidibemus

# Clone and setup app
cd /var/www/vidibemus
sudo -u vidibemus git clone https://github.com/victoropp/videbimus-ai-website.git .

# Create environment file
cat > /var/www/vidibemus/.env.local << 'ENV'
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

# Build application
cd /var/www/vidibemus
sudo -u vidibemus npm install
sudo -u vidibemus npx prisma generate
sudo -u vidibemus npm run build

# Setup PM2
cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vidibemus',
    instances: 2,
    exec_mode: 'cluster'
  }]
};
PM2

sudo -u vidibemus pm2 start ecosystem.config.js
sudo -u vidibemus pm2 save
pm2 startup systemd -u vidibemus --hp /home/vidibemus

# Setup Nginx
cat > /etc/nginx/sites-available/vidibemus << 'NGX'
server {
    listen 80;
    server_name videbimusai.com www.videbimusai.com 31.97.117.30;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGX

ln -sf /etc/nginx/sites-available/vidibemus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo "✅ SETUP COMPLETE!"
echo "🌐 Your site is live at: http://31.97.117.30"
echo "📋 Next: Set up DNS in Cloudflare to point to 31.97.117.30"
FULLSCRIPT

chmod +x setup.sh && bash setup.sh
```

## Step 4: Wait for Completion
The script will take about 10-15 minutes to complete. You'll see progress messages.

## Step 5: Verify It's Working
Once complete, open your browser and go to:
**http://31.97.117.30**

You should see your website!

## Step 6: Set Up Your Domain (Cloudflare)
1. Log into Cloudflare
2. Select videbimusai.com
3. Go to DNS settings
4. Add these records:
   - Type: A, Name: @, Content: 31.97.117.30
   - Type: A, Name: www, Content: 31.97.117.30

## That's It! 🎉
Your website is now live and running on your VPS!

---

## If You See Any Errors:
Just run this to check the app status:
```bash
pm2 status
pm2 logs vidibemus-ai
```