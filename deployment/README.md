# Vidibemus AI Deployment Guide

## Overview
Complete deployment setup for Vidibemus AI on Hostinger VPS with Cloudflare CDN.

## Directory Structure
```
deployment/
├── hostinger/          # VPS setup and deployment scripts
├── cloudflare/         # CDN and security configuration
├── config/             # Server configurations
├── scripts/            # Utility scripts
├── monitoring/         # Health monitoring tools
└── docker/            # Docker configurations
```

## Quick Start

### 1. Initial Server Setup
```bash
cd deployment/hostinger
sudo ./setup-vps.sh
```

### 2. Configure Environment
```bash
cp .env.production.template .env.production
# Edit .env.production with your actual values
```

### 3. Deploy Application
```bash
./deploy.sh
```

### 4. Setup Email Server
```bash
cd deployment/config
sudo ./email-setup.sh
```

### 5. Configure Monitoring
```bash
cd deployment/monitoring
./monitor.sh loop &
```

## Hostinger VPS Configuration

### Server Requirements
- Ubuntu 22.04 LTS
- 2 CPU cores minimum
- 4GB RAM minimum
- 40GB SSD storage
- Root access

### Services Installed
- Node.js 20.x
- PostgreSQL 15
- Redis Server
- Nginx
- PM2 Process Manager
- Postfix/Dovecot (Email)
- Certbot (SSL)

## Cloudflare Setup

### DNS Configuration
1. Point domain to VPS IP
2. Enable proxy (orange cloud)
3. Configure SSL/TLS to "Full (strict)"

### Security Settings
- Enable WAF
- Configure rate limiting rules
- Set up DDoS protection
- Enable Bot Fight Mode

## CI/CD Pipeline

### GitHub Actions
The deployment pipeline automatically:
1. Runs tests on push to main
2. Builds the application
3. Deploys to VPS via SSH
4. Purges Cloudflare cache
5. Sends notifications

### Required GitHub Secrets
```
HOST              # VPS IP address
USERNAME          # SSH username
SSH_KEY           # SSH private key
PORT              # SSH port (usually 22)
DATABASE_URL      # Production database URL
NEXTAUTH_SECRET   # NextAuth secret
NEXTAUTH_URL      # Production URL
CLOUDFLARE_ZONE   # Cloudflare zone ID
CLOUDFLARE_TOKEN  # Cloudflare API token
SLACK_WEBHOOK     # Slack notifications
```

## Email Configuration

### Unlimited Email Addresses
Create email accounts using:
```bash
cd deployment/scripts
sudo ./manage-emails.sh
```

### Email Settings for Clients
- **IMAP**: mail.vidibemus.ai (Port 993, SSL/TLS)
- **SMTP**: mail.vidibemus.ai (Port 587, STARTTLS)
- **Webmail**: Available at mail.vidibemus.ai

## Monitoring

### Health Checks
The monitoring script checks:
- Website availability
- API health
- SSL certificate expiry
- System resources (CPU, RAM, Disk)
- Service status
- Database connectivity
- Backup status

### Alerts
Configure alerts in `monitor.sh`:
- Email notifications
- Slack webhooks
- Custom webhooks

## Backup Strategy

### Automated Backups
Daily backups include:
- PostgreSQL database
- Application files
- Environment configurations
- Nginx settings
- Email configuration

### Backup Locations
- Local: `/var/backups/vidibemus/`
- Remote: S3 bucket (optional)
- Retention: 30 days

## Security Best Practices

### Server Hardening
1. Configure firewall (UFW)
2. Disable root SSH login
3. Use SSH keys only
4. Regular security updates
5. Fail2ban for brute force protection

### Application Security
1. Environment variables for secrets
2. HTTPS only
3. Rate limiting
4. CORS configuration
5. CSP headers

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
pm2 logs vidibemus-ai
pm2 restart vidibemus-ai
```

#### Database Connection Issues
```bash
sudo systemctl status postgresql
sudo -u postgres psql
```

#### SSL Certificate Issues
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

#### Email Delivery Issues
```bash
sudo postfix status
tail -f /var/log/mail.log
```

## Performance Optimization

### PM2 Cluster Mode
- Runs 4 instances by default
- Auto-restart on memory limit
- Load balancing across cores

### Nginx Caching
- Static file caching
- Gzip compression
- Browser caching headers

### Database Optimization
- Connection pooling
- Query optimization
- Regular VACUUM

## Maintenance

### Regular Tasks
- **Daily**: Check monitoring alerts
- **Weekly**: Review logs, update dependencies
- **Monthly**: Security updates, backup verification
- **Quarterly**: SSL renewal, performance review

### Update Procedure
```bash
cd /var/www/vidibemus
git pull origin main
npm ci
npx prisma migrate deploy
npm run build
pm2 restart vidibemus-ai
```

## Support

### Contact Information
- **UK**: +44 7442 852675 (Call or WhatsApp)
- **Ghana**: +233 248769377 (Call or WhatsApp)
- **Email**: support@videbimusai.com
- **Website**: https://vidibemus.ai

## License
Proprietary - Vidibemus AI © 2024