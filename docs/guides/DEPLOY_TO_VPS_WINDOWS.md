# Windows Deployment Instructions for Hostinger VPS

## VPS Connection Details
- **IP Address**: 31.97.117.30
- **Username**: root
- **Password**: Advance@UK@2025

## Step 1: Connect to VPS using Windows Terminal or PowerShell

Open PowerShell or Windows Terminal and run:
```powershell
ssh root@31.97.117.30
```

When prompted, enter password: `Advance@UK@2025`

## Step 2: Create Setup Script on VPS

Once connected, create the setup script:
```bash
nano /root/setup.sh
```

Copy and paste the entire contents of `deployment/hostinger/setup-ubuntu24.sh` into the editor.
- Save: Ctrl+O, then Enter
- Exit: Ctrl+X

## Step 3: Make Script Executable and Run

```bash
chmod +x /root/setup.sh
bash /root/setup.sh
```

This will take about 10-15 minutes to complete.

## Step 4: Create Environment Configuration

```bash
nano /root/.env.local
```

Copy and paste this configuration:
```env
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://videbimusai.com
NEXTAUTH_URL=https://videbimusai.com
NEXTAUTH_SECRET=CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=

# Database
DATABASE_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
DIRECT_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai

# Redis
REDIS_URL=redis://:1405675dc0d791fb76726d61c8959938@localhost:6379

# Security
JWT_SECRET=3d8f72a9b4c5e6f1827394a0b5c6d7e8
ENCRYPTION_KEY=f47ac10b58cc4372a5670e02b2c3d479

# Email
EMAIL_FROM=noreply@videbimusai.com
EMAIL_SERVER_HOST=localhost
EMAIL_SERVER_PORT=25
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=

# AI Providers (Add your API keys here)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
HUGGING_FACE_API_KEY=
GROQ_API_KEY=
COHERE_API_KEY=
TOGETHER_API_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=

# Stripe (Add your keys if using payments)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

## Step 5: Deploy Application

Switch to the application user and deploy:
```bash
# Switch to vidibemus user
su - vidibemus

# Go to application directory
cd /var/www/vidibemus

# Clone repository
git clone https://github.com/victoropp/videbimus-ai-website.git .

# Copy environment file
sudo cp /root/.env.local /var/www/vidibemus/.env.local
sudo chown vidibemus:vidibemus /var/www/vidibemus/.env.local

# Install dependencies
npm ci --production=false

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u vidibemus --hp /home/vidibemus
```

## Step 6: Configure SSL Certificate

As root user (type `exit` to return to root):
```bash
certbot --nginx -d videbimusai.com -d www.videbimusai.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose whether to share email
- Certificate will be automatically configured

## Step 7: Configure DNS (Cloudflare)

1. Log into Cloudflare
2. Select your domain (videbimusai.com)
3. Go to DNS settings
4. Add these records:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | 31.97.117.30 | Proxied |
| A | www | 31.97.117.30 | Proxied |
| A | * | 31.97.117.30 | Proxied |

## Step 8: Verify Deployment

1. Check application status:
```bash
pm2 status
pm2 logs vidibemus-ai
```

2. Check Nginx:
```bash
systemctl status nginx
```

3. Test website:
- Open browser to: https://videbimusai.com
- Should see your website running!

## Troubleshooting Commands

```bash
# View application logs
pm2 logs vidibemus-ai

# Restart application
pm2 restart vidibemus-ai

# Check system resources
htop

# Check disk space
df -h

# View Nginx error logs
tail -f /var/log/nginx/error.log

# Test database connection
sudo -u postgres psql -d vidibemus_ai -c "SELECT 1;"
```

## Important Passwords to Save

- **VPS Root**: Advance@UK@2025
- **Database Password**: fb671b96bdd3463085f9dfd645af44d4
- **Redis Password**: 1405675dc0d791fb76726d61c8959938
- **NextAuth Secret**: CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=

## Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs`
2. Check system logs: `journalctl -xe`
3. Verify all services are running: `systemctl status postgresql@15-main redis nginx`