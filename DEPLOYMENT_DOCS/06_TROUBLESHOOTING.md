# 🔧 Troubleshooting Guide

## Common Issues and Solutions

## 1. Application Issues

### Application Won't Start
**Symptoms:**
- PM2 shows status as "errored"
- Website returns 502 Bad Gateway
- Port 3000 not responding

**Solutions:**
```bash
# Check PM2 logs for errors
pm2 logs vidibemus-ai --err --lines 100

# Check if port is in use
lsof -i :3000

# Rebuild and restart
cd /var/www/vidibemus
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
pm2 restart vidibemus-ai

# If build fails, use development mode
pm2 delete vidibemus-ai
pm2 start "npm run dev" --name vidibemus-ai
```

### High Memory Usage
**Symptoms:**
- Server becomes slow
- PM2 shows high memory consumption
- Out of memory errors

**Solutions:**
```bash
# Check memory usage
free -m
pm2 monit

# Restart application
pm2 restart vidibemus-ai

# Set memory limit
pm2 set vidibemus-ai:max_memory_restart 1G

# Clear system caches
sync && echo 3 > /proc/sys/vm/drop_caches
```

### Build Failures
**Symptoms:**
- TypeScript errors during build
- Module not found errors
- ESLint errors

**Solutions:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Skip type checking (already configured)
# next.config.js has ignoreBuildErrors: true

# Clear cache
rm -rf .next
npm run build

# If persists, check missing modules
npm ls
```

## 2. Database Issues

### Connection Refused
**Symptoms:**
- Error: ECONNREFUSED 127.0.0.1:5432
- Cannot connect to PostgreSQL

**Solutions:**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Check if listening on correct port
netstat -plnt | grep 5432

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log

# Test connection
sudo -u postgres psql -d vidibemus_ai
```

### Prisma Migration Errors
**Symptoms:**
- Migration failed
- Schema out of sync

**Solutions:**
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Force push schema
npx prisma db push

# Generate client
npx prisma generate

# Check migration status
npx prisma migrate status
```

## 3. Nginx Issues

### 502 Bad Gateway
**Symptoms:**
- Nginx returns 502 error
- Can't reach application

**Solutions:**
```bash
# Check if app is running
pm2 status
curl http://localhost:3000

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart vidibemus-ai
systemctl restart nginx

# Test Nginx config
nginx -t
```

### SSL Certificate Issues
**Symptoms:**
- HTTPS not working
- Certificate expired warning

**Solutions:**
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew --force-renewal

# Test renewal
certbot renew --dry-run

# Restart Nginx
systemctl restart nginx

# Check SSL configuration
openssl s_client -connect videbimusai.com:443
```

## 4. Redis Issues

### Connection Failed
**Symptoms:**
- Redis connection timeout
- Authentication failed

**Solutions:**
```bash
# Check Redis status
systemctl status redis

# Test connection with password
redis-cli -a 1405675dc0d791fb76726d61c8959938 ping

# Restart Redis
systemctl restart redis

# Check Redis logs
tail -f /var/log/redis/redis-server.log

# Verify password in config
grep requirepass /etc/redis/redis.conf
```

## 5. PM2 Issues

### Restart Loop
**Symptoms:**
- App restarting continuously
- High restart count

**Solutions:**
```bash
# Check error logs
pm2 logs vidibemus-ai --err

# Stop and delete
pm2 stop vidibemus-ai
pm2 delete vidibemus-ai

# Start in development mode
pm2 start "npm run dev" --name vidibemus-ai

# Monitor in real-time
pm2 monit
```

### PM2 Not Starting on Boot
**Solutions:**
```bash
# Generate startup script
pm2 startup systemd -u vidibemus --hp /home/vidibemus

# Save current process list
pm2 save

# Verify systemd service
systemctl status pm2-vidibemus
```

## 6. DNS Issues

### Domain Not Resolving
**Symptoms:**
- Can't access videbimusai.com
- DNS_PROBE_FINISHED_NXDOMAIN

**Solutions:**
```bash
# Check DNS propagation
nslookup videbimusai.com
dig videbimusai.com

# Verify A records in Hostinger
# Should point to: 31.97.117.30

# Clear DNS cache locally
# Windows: ipconfig /flushdns
# Linux: systemd-resolve --flush-caches

# Test with different DNS
nslookup videbimusai.com 8.8.8.8
```

## 7. Dependency Issues

### NPM Install Failures
**Symptoms:**
- Peer dependency conflicts
- Version mismatch errors

**Solutions:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Clear npm cache
npm cache clean --force

# Remove lock file and reinstall
rm package-lock.json
npm install --legacy-peer-deps

# Use specific Node version
nvm use 20
```

## 8. Performance Issues

### Slow Response Times
**Symptoms:**
- Pages loading slowly
- High server response time

**Solutions:**
```bash
# Check server resources
htop
iostat -x 1

# Optimize PM2 workers
pm2 scale vidibemus-ai 4

# Enable Nginx caching
# Already configured in /etc/nginx/sites-available/videbimusai

# Check database queries
sudo -u postgres psql -d vidibemus_ai
\x
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## 9. File Permission Issues

**Symptoms:**
- Permission denied errors
- Can't write to directories

**Solutions:**
```bash
# Fix ownership
chown -R vidibemus:vidibemus /var/www/vidibemus

# Fix permissions
find /var/www/vidibemus -type d -exec chmod 755 {} \;
find /var/www/vidibemus -type f -exec chmod 644 {} \;

# Make scripts executable
chmod +x /var/www/vidibemus/node_modules/.bin/*
```

## 10. Environment Variable Issues

**Symptoms:**
- Missing API keys errors
- Undefined environment variables

**Solutions:**
```bash
# Check if .env.local exists
ls -la /var/www/vidibemus/.env.local

# Verify variables are loaded
cd /var/www/vidibemus
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env)"

# Restart after changes
pm2 restart vidibemus-ai --update-env
```

## Quick Diagnostic Commands

```bash
# Full system check
echo "=== System Status ==="
df -h
free -m
uptime

echo "=== Service Status ==="
systemctl status nginx postgresql redis
pm2 status

echo "=== Network Status ==="
netstat -tlpn
curl -I https://videbimusai.com

echo "=== Recent Logs ==="
pm2 logs vidibemus-ai --lines 20
tail -20 /var/log/nginx/error.log
```

## Emergency Recovery Script

```bash
#!/bin/bash
# Save as /root/emergency-recovery.sh

echo "Starting emergency recovery..."

# Restart all services
systemctl restart postgresql
systemctl restart redis
systemctl restart nginx

# Rebuild application
cd /var/www/vidibemus
pm2 stop vidibemus-ai
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build || npm run dev

# Restart PM2
pm2 delete vidibemus-ai
pm2 start ecosystem.config.js
pm2 save

echo "Recovery complete. Check: pm2 status"
```

---
*Troubleshooting Guide Last Updated: December 2024*