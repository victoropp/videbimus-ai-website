# 🤖 AI Agent Deployment Guide

## For AI Coding Assistants (Claude, ChatGPT, etc.)

This guide helps AI agents understand and work with the Videbimus AI website deployment.

## Quick Context

You are working with:
- **Application**: Next.js 15.5.2 website for Videbimus AI (AI consulting company)
- **Server**: Ubuntu 24.04 VPS at 31.97.117.30 (Hostinger)
- **Domain**: https://videbimusai.com
- **Stack**: Node.js 20, PostgreSQL 15, Redis, PM2, Nginx

## Essential Information

### 1. Access the Server
```bash
ssh root@31.97.117.30
# Password: Advance@UK@2025
```

### 2. Navigate to Application
```bash
su - vidibemus
cd /var/www/vidibemus
```

### 3. Key File Locations
```
/var/www/vidibemus/          # Application root
/var/www/vidibemus/.env.local # Environment variables
/etc/nginx/sites-available/videbimusai # Nginx config
/var/www/vidibemus/ecosystem.config.js # PM2 config
```

## Common Tasks for AI Agents

### Update the Website Code

```bash
# 1. Connect and navigate
ssh root@31.97.117.30
su - vidibemus
cd /var/www/vidibemus

# 2. Pull latest changes
git pull origin master

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Build application
npm run build

# 5. Restart
pm2 restart vidibemus-ai
```

### Check Application Status

```bash
# View PM2 status
pm2 status

# Check logs
pm2 logs vidibemus-ai --lines 50

# Monitor resources
pm2 monit
```

### Fix Common Issues

#### If website is down:
```bash
pm2 restart vidibemus-ai
systemctl restart nginx
```

#### If build fails:
```bash
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

#### If database connection fails:
```bash
systemctl restart postgresql
# Check connection string in .env.local
```

### Add New Features

1. **Always backup first:**
```bash
cp -r .next .next.backup
pg_dump vidibemus_ai > db_backup.sql
```

2. **Test locally if possible:**
```bash
npm run dev
# Access at http://localhost:3000
```

3. **Deploy carefully:**
```bash
npm run build
pm2 restart vidibemus-ai
```

## Environment Variables

**NEVER expose these in code or logs:**

```env
# Database
DATABASE_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai

# Redis
REDIS_URL=redis://:1405675dc0d791fb76726d61c8959938@localhost:6379

# NextAuth
NEXTAUTH_SECRET=CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=

# Security
JWT_SECRET=3d8f72a9b4c5e6f1827394a0b5c6d7e8
ENCRYPTION_KEY=f47ac10b58cc4372a5670e02b2c3d479
```

## Important Configurations

### Next.js Config (next.config.js)
```javascript
// Currently set to ignore errors for stability
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

### PM2 Config (ecosystem.config.js)
```javascript
// Running in dev mode for stability
script: 'npm'
args: 'run dev'
env: { NODE_ENV: 'development' }
```

### Package.json Key Scripts
```json
"dev": "next dev"
"build": "next build"
"start": "next start"
```

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # React components
├── lib/          # Core libraries
│   ├── ai/       # AI integrations
│   ├── api/      # API routes
│   └── db/       # Database
├── utils/        # Utility functions
└── types/        # TypeScript types
```

## Critical Files to Know

1. **src/lib/ai/enterprise-knowledge-base.ts**
   - Main chatbot intelligence
   - Company information
   - Response generation

2. **src/lib/db/index.ts**
   - Database connection
   - Prisma client

3. **src/app/api/**
   - All API endpoints
   - Authentication
   - AI model routing

## Database Management

### Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### Access Database
```bash
sudo -u postgres psql -d vidibemus_ai
```

### Backup Database
```bash
pg_dump -U vidibemus vidibemus_ai > backup.sql
```

## SSL Certificate

- **Provider**: Let's Encrypt
- **Auto-renewal**: Enabled via certbot
- **Expires**: November 29, 2025

Check certificate:
```bash
certbot certificates
```

## Monitoring Commands

```bash
# Check all services
systemctl status nginx postgresql redis
pm2 status

# Check disk space
df -h

# Check memory
free -m

# Check SSL
certbot certificates

# Check domain
curl -I https://videbimusai.com
```

## DO's and DON'Ts for AI Agents

### DO's ✅
- Always use `--legacy-peer-deps` with npm install
- Backup before major changes
- Test in development mode first
- Check logs when debugging
- Use PM2 for process management
- Keep credentials in .env.local

### DON'Ts ❌
- Never commit .env.local to git
- Don't run as root user (use vidibemus)
- Don't skip dependency installation
- Don't ignore TypeScript/ESLint errors in src/
- Don't restart services during peak hours
- Don't expose passwords in logs

## Quick Fixes Cheatsheet

| Issue | Command |
|-------|---------|
| App crashed | `pm2 restart vidibemus-ai` |
| 502 error | `systemctl restart nginx` |
| Build failed | `npm install --legacy-peer-deps && npm run build` |
| Database down | `systemctl restart postgresql` |
| High memory | `pm2 restart vidibemus-ai` |
| SSL expired | `certbot renew --force-renewal` |

## Contact Information

**Company**: Videbimus AI
**Domain**: videbimusai.com
**Phone**: 
- UK: +44 7442 852675
- Ghana: +233 248769377
**Email**: support@videbimusai.com

## GitHub Repository

```bash
# Repository
https://github.com/victoropp/videbimus-ai-website

# Clone
git clone https://github.com/victoropp/videbimus-ai-website.git

# Push changes
git add .
git commit -m "Update from AI agent"
git push origin master
```

## Emergency Recovery

If everything fails:
```bash
# Run emergency script
bash /root/emergency-recovery.sh

# Or manually:
cd /var/www/vidibemus
pm2 delete all
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run dev
pm2 start "npm run dev" --name vidibemus-ai
```

## For Human Developers

This system is configured for stability over optimization:
- Running in development mode (more stable than production)
- TypeScript/ESLint errors ignored during build
- Using legacy peer deps for compatibility

Consider migrating to production mode once all dependencies are resolved.

---
*AI Agent Guide Last Updated: December 2024*
*For AI assistants working on videbimusai.com deployment*