# 🔧 Maintenance Guide

## Daily Maintenance Tasks

### 1. Check Application Status
```bash
# SSH into server
ssh root@31.97.117.30

# Check PM2 status
pm2 status

# Check recent logs
pm2 logs vidibemus-ai --lines 50

# Check system resources
htop
df -h
```

### 2. Monitor Key Metrics
- CPU usage: Should be < 80%
- Memory usage: Should be < 90%
- Disk space: Should have > 10% free
- Response time: Should be < 2 seconds

## Weekly Maintenance Tasks

### 1. Update System Packages
```bash
# Update package lists
apt update

# Upgrade packages (carefully)
apt upgrade -y

# Remove unused packages
apt autoremove -y
```

### 2. Check SSL Certificate
```bash
# Check expiry date
certbot certificates

# Test renewal
certbot renew --dry-run
```

### 3. Database Maintenance
```bash
# Connect to PostgreSQL
sudo -u postgres psql -d vidibemus_ai

# Check database size
SELECT pg_database_size('vidibemus_ai');

# Vacuum and analyze
VACUUM ANALYZE;

# Exit
\q
```

### 4. Clear Old Logs
```bash
# Rotate PM2 logs
pm2 flush

# Clear old system logs
journalctl --vacuum-time=7d

# Clear Nginx logs if too large
> /var/log/nginx/access.log
> /var/log/nginx/error.log
```

## Monthly Maintenance Tasks

### 1. Full Backup
```bash
# Create backup directory
mkdir -p /var/backups/vidibemus/$(date +%Y%m%d)
cd /var/backups/vidibemus/$(date +%Y%m%d)

# Backup database
pg_dump -U vidibemus vidibemus_ai > database.sql

# Backup application files
tar -czf app_files.tar.gz /var/www/vidibemus/.env.local \
    /var/www/vidibemus/public/uploads \
    /var/www/vidibemus/ecosystem.config.js

# Backup Nginx config
cp /etc/nginx/sites-available/videbimusai nginx_config

# Create archive
tar -czf backup_$(date +%Y%m%d).tar.gz *
```

### 2. Security Updates
```bash
# Check for security updates
apt list --upgradable | grep -i security

# Apply security updates
apt upgrade -y

# Check for Node.js updates
npm audit
npm update
```

### 3. Performance Review
```bash
# Check PM2 metrics
pm2 monit

# Analyze Nginx access logs
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# Check database slow queries
sudo -u postgres psql -d vidibemus_ai -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Application Updates

### 1. Update from GitHub
```bash
# Switch to app user
su - vidibemus
cd /var/www/vidibemus

# Backup current version
cp -r .next .next.backup

# Pull latest changes
git pull origin master

# Install new dependencies
npm install --legacy-peer-deps

# Rebuild application
npm run build

# Restart PM2
pm2 restart vidibemus-ai

# If issues, rollback
# rm -rf .next && mv .next.backup .next
# pm2 restart vidibemus-ai
```

### 2. Database Migrations
```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Environment Variables Update
```bash
# Edit environment file
nano /var/www/vidibemus/.env.local

# Restart application
pm2 restart vidibemus-ai
```

## Monitoring Setup

### 1. PM2 Monitoring
```bash
# Install PM2 web dashboard
pm2 install pm2-webshell

# Access at http://your-server:8080
```

### 2. System Monitoring
```bash
# Install monitoring tools
apt install -y netdata

# Access at http://your-server:19999
```

### 3. Log Monitoring
```bash
# Install log viewer
npm install -g bunyan

# View formatted logs
pm2 logs vidibemus-ai --raw | bunyan
```

## Performance Optimization

### 1. PM2 Optimization
```bash
# Adjust worker count based on CPU cores
pm2 scale vidibemus-ai 4  # For 4 CPU cores

# Set memory limit
pm2 set vidibemus-ai:max_memory_restart 1G
```

### 2. Database Optimization
```sql
-- Add indexes for slow queries
CREATE INDEX idx_user_email ON users(email);

-- Update statistics
ANALYZE;

-- Configure connection pooling in .env
-- DATABASE_URL=postgresql://...?connection_limit=20
```

### 3. Nginx Optimization
```nginx
# Edit /etc/nginx/sites-available/videbimusai

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

## Troubleshooting Common Issues

### Application Won't Start
```bash
# Check logs
pm2 logs vidibemus-ai --err

# Check port availability
netstat -tulpn | grep 3000

# Rebuild application
cd /var/www/vidibemus
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
pm2 restart vidibemus-ai
```

### High Memory Usage
```bash
# Check memory consumers
ps aux --sort=-%mem | head

# Restart application
pm2 restart vidibemus-ai

# Clear caches
sync && echo 3 > /proc/sys/vm/drop_caches
```

### Database Connection Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Restart PostgreSQL
systemctl restart postgresql
```

### SSL Certificate Issues
```bash
# Renew certificate manually
certbot renew --force-renewal

# Restart Nginx
systemctl restart nginx
```

## Emergency Procedures

### 1. Application Crash
```bash
# Immediate restart
pm2 restart vidibemus-ai

# If persists, start in dev mode
pm2 delete vidibemus-ai
cd /var/www/vidibemus
pm2 start "npm run dev" --name vidibemus-ai
```

### 2. Server Overload
```bash
# Kill resource-heavy processes
killall -9 node

# Restart services
systemctl restart nginx
systemctl restart postgresql
pm2 restart all
```

### 3. Disk Full
```bash
# Find large files
du -sh /* | sort -rh | head -20

# Clear logs
pm2 flush
> /var/log/nginx/access.log
journalctl --vacuum-size=100M

# Remove old backups
rm -rf /var/backups/vidibemus/old_backups
```

## Backup Restoration

### 1. Restore Database
```bash
# Stop application
pm2 stop vidibemus-ai

# Restore database
sudo -u postgres psql vidibemus_ai < backup.sql

# Start application
pm2 start vidibemus-ai
```

### 2. Restore Application Files
```bash
# Extract backup
tar -xzf backup.tar.gz

# Restore files
cp .env.local /var/www/vidibemus/
cp -r uploads /var/www/vidibemus/public/

# Set permissions
chown -R vidibemus:vidibemus /var/www/vidibemus

# Restart
pm2 restart vidibemus-ai
```

## Scaling Procedures

### Vertical Scaling (Upgrade VPS)
1. Take full backup
2. Upgrade VPS in Hostinger panel
3. Adjust PM2 workers: `pm2 scale vidibemus-ai 8`
4. Increase PostgreSQL connections
5. Adjust Nginx worker_processes

### Horizontal Scaling (Multiple Servers)
1. Set up load balancer
2. Configure shared database
3. Set up Redis for session sharing
4. Configure shared file storage
5. Update DNS to point to load balancer

---
*Maintenance Schedule Last Updated: December 2024*