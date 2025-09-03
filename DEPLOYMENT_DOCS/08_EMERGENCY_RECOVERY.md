# 🚨 Emergency Recovery Procedures

## EMERGENCY CONTACTS
- **Server IP**: 31.97.117.30
- **Root Password**: Advance@UK@2025
- **Hostinger Support**: https://hpanel.hostinger.com
- **Domain**: videbimusai.com

## Quick Recovery Commands

### 🔴 CRITICAL: Site is Down
```bash
# 1. SSH into server
ssh root@31.97.117.30

# 2. Quick restart all services
systemctl restart nginx postgresql redis
su - vidibemus
cd /var/www/vidibemus
pm2 restart vidibemus-ai

# 3. Check if site is up
curl -I https://videbimusai.com
```

## Disaster Recovery Scenarios

### Scenario 1: Complete Application Failure

**Symptoms**: Website completely unreachable, PM2 shows errors

**Recovery Steps**:
```bash
# 1. Connect as root
ssh root@31.97.117.30

# 2. Switch to app user
su - vidibemus
cd /var/www/vidibemus

# 3. Stop everything
pm2 delete all

# 4. Clean rebuild
rm -rf .next node_modules package-lock.json

# 5. Reinstall dependencies
npm install --legacy-peer-deps

# 6. Try development mode first (more stable)
pm2 start "npm run dev" --name vidibemus-ai

# 7. If stable, try production
pm2 stop vidibemus-ai
npm run build
pm2 start ecosystem.config.js

# 8. Save PM2 configuration
pm2 save
pm2 startup systemd -u vidibemus --hp /home/vidibemus
```

### Scenario 2: Database Corruption

**Symptoms**: Application runs but data errors, connection failures

**Recovery Steps**:
```bash
# 1. Stop application
pm2 stop vidibemus-ai

# 2. Backup current database (even if corrupted)
pg_dump -U vidibemus vidibemus_ai > corrupted_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Try to repair
sudo -u postgres psql -d vidibemus_ai
REINDEX DATABASE vidibemus_ai;
VACUUM FULL ANALYZE;
\q

# 4. If repair fails, restore from backup
# Find latest backup
ls -la /var/backups/vidibemus/

# Restore
sudo -u postgres psql -c "DROP DATABASE vidibemus_ai;"
sudo -u postgres psql -c "CREATE DATABASE vidibemus_ai OWNER vidibemus;"
sudo -u postgres psql vidibemus_ai < /var/backups/vidibemus/latest_backup.sql

# 5. Run migrations
cd /var/www/vidibemus
npx prisma migrate deploy
npx prisma generate

# 6. Restart application
pm2 restart vidibemus-ai
```

### Scenario 3: SSL Certificate Emergency

**Symptoms**: Browser shows certificate error, HTTPS not working

**Recovery Steps**:
```bash
# 1. Check certificate status
certbot certificates

# 2. Force renewal
certbot renew --force-renewal

# 3. If renewal fails, get new certificate
certbot certonly --nginx -d videbimusai.com -d www.videbimusai.com --force-renewal

# 4. Restart Nginx
systemctl restart nginx

# 5. Test SSL
openssl s_client -connect videbimusai.com:443 -servername videbimusai.com
```

### Scenario 4: Server Overload

**Symptoms**: Very slow response, high CPU/memory usage

**Recovery Steps**:
```bash
# 1. Check what's consuming resources
htop
ps aux --sort=-%cpu | head -10
ps aux --sort=-%mem | head -10

# 2. Kill resource-heavy processes
killall -9 node  # WARNING: This will stop the app

# 3. Clear system resources
sync && echo 3 > /proc/sys/vm/drop_caches

# 4. Restart services systematically
systemctl restart postgresql
systemctl restart redis
systemctl restart nginx

# 5. Start application with limited resources
cd /var/www/vidibemus
pm2 start ecosystem.config.js --max-memory-restart 1G

# 6. Scale down if needed
pm2 scale vidibemus-ai 1
```

### Scenario 5: Hacked/Compromised

**Symptoms**: Unexpected content, suspicious files, unauthorized access

**Recovery Steps**:
```bash
# 1. IMMEDIATELY: Block all traffic except SSH
ufw default deny incoming
ufw allow 22/tcp
ufw --force enable

# 2. Backup evidence
tar -czf /root/compromised_$(date +%Y%m%d).tar.gz /var/www/vidibemus

# 3. Check for unauthorized users
cat /etc/passwd
last -n 50

# 4. Change all passwords
passwd root  # Set new root password

# 5. Clean reinstall from GitHub
cd /var/www
rm -rf vidibemus
git clone https://github.com/victoropp/videbimus-ai-website.git vidibemus
chown -R vidibemus:vidibemus vidibemus

# 6. Restore clean environment file
cd vidibemus
# Create new .env.local with FRESH secrets
cat > .env.local << 'EOF'
# Generate NEW secrets!
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://videbimusai.com
# ... (regenerate all secrets)
EOF

# 7. Rebuild and restart
npm install --legacy-peer-deps
npm run build
pm2 restart vidibemus-ai

# 8. Re-enable firewall rules
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

# 9. Install security updates
apt update && apt upgrade -y
```

### Scenario 6: Disk Full

**Symptoms**: Can't write files, application errors, "No space left on device"

**Recovery Steps**:
```bash
# 1. Check disk usage
df -h
du -sh /* | sort -rh | head -20

# 2. Clear PM2 logs
pm2 flush

# 3. Clear system logs
journalctl --vacuum-size=100M
> /var/log/nginx/access.log
> /var/log/nginx/error.log

# 4. Remove old node_modules
cd /var/www/vidibemus
rm -rf node_modules/.cache

# 5. Clean npm cache
npm cache clean --force

# 6. Remove old backups
rm -rf /var/backups/vidibemus/old_*

# 7. Find large files
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null

# 8. Restart application
pm2 restart vidibemus-ai
```

## Automated Recovery Script

Create this script at `/root/emergency-recovery.sh`:

```bash
#!/bin/bash

echo "==================================="
echo "VIDEBIMUS AI EMERGENCY RECOVERY"
echo "==================================="
echo "Starting at: $(date)"

# Function to check service
check_service() {
    if systemctl is-active --quiet $1; then
        echo "✅ $1 is running"
    else
        echo "❌ $1 is down, starting..."
        systemctl start $1
    fi
}

# 1. Check basic services
echo ""
echo "Checking services..."
check_service postgresql
check_service redis
check_service nginx

# 2. Check application
echo ""
echo "Checking application..."
su - vidibemus -c "cd /var/www/vidibemus && pm2 status"

# 3. Try to fix if app is down
if ! su - vidibemus -c "pm2 status | grep -q online"; then
    echo "Application is down, attempting recovery..."
    
    su - vidibemus << 'EOSU'
    cd /var/www/vidibemus
    pm2 delete all
    
    # Try development mode (more stable)
    pm2 start "npm run dev" --name vidibemus-ai
    pm2 save
EOSU
fi

# 4. Check website
echo ""
echo "Testing website..."
if curl -s -o /dev/null -w "%{http_code}" https://videbimusai.com | grep -q "200\|301\|302"; then
    echo "✅ Website is responding"
else
    echo "❌ Website is not responding properly"
fi

# 5. Check disk space
echo ""
echo "Disk usage:"
df -h | grep -E "^/dev"

# 6. Check memory
echo ""
echo "Memory usage:"
free -h

echo ""
echo "==================================="
echo "Recovery attempt completed at: $(date)"
echo "==================================="
```

Make it executable:
```bash
chmod +x /root/emergency-recovery.sh
```

## Recovery Verification Checklist

After any recovery procedure, verify:

- [ ] Website loads: `curl -I https://videbimusai.com`
- [ ] SSL works: Check for padlock in browser
- [ ] Database connected: Check application logs
- [ ] PM2 running: `pm2 status`
- [ ] Nginx running: `systemctl status nginx`
- [ ] PostgreSQL running: `systemctl status postgresql`
- [ ] Redis running: `systemctl status redis`
- [ ] Disk space OK: `df -h` (should have >10% free)
- [ ] Memory OK: `free -m` (should have some free)
- [ ] Logs clean: `pm2 logs vidibemus-ai --lines 20`

## Backup Restoration

### From Local Backup
```bash
# Database
sudo -u postgres psql vidibemus_ai < /var/backups/vidibemus/database_backup.sql

# Application files
cd /var/www/vidibemus
tar -xzf /var/backups/vidibemus/app_backup.tar.gz

# Environment file
cp /var/backups/vidibemus/.env.local.backup .env.local

# Restart
pm2 restart vidibemus-ai
```

### From GitHub (Clean State)
```bash
cd /var/www
rm -rf vidibemus
git clone https://github.com/victoropp/videbimus-ai-website.git vidibemus
cd vidibemus
chown -R vidibemus:vidibemus .

# Restore environment file
# Copy .env.local from backup or recreate

npm install --legacy-peer-deps
npm run build
pm2 restart vidibemus-ai
```

## Prevention Measures

### Daily Health Check
```bash
# Add to crontab
0 */6 * * * /root/emergency-recovery.sh > /var/log/health-check.log 2>&1
```

### Monitoring Setup
```bash
# Install monitoring
apt install -y monit

# Configure monit
cat > /etc/monit/conf.d/vidibemus << 'EOF'
check process nginx with pidfile /var/run/nginx.pid
    start program = "/bin/systemctl start nginx"
    stop program = "/bin/systemctl stop nginx"
    if failed host videbimusai.com port 443 protocol https then restart

check process postgresql with pidfile /var/run/postgresql/15-main.pid
    start program = "/bin/systemctl start postgresql"
    stop program = "/bin/systemctl stop postgresql"
    
check process pm2 matching "PM2"
    start program = "/bin/su - vidibemus -c 'pm2 resurrect'"
    stop program = "/bin/su - vidibemus -c 'pm2 kill'"
EOF

systemctl restart monit
```

## When All Else Fails

If absolutely nothing works:

1. **Contact Hostinger Support**
   - Login to https://hpanel.hostinger.com
   - Open support ticket
   - Mention VPS: srv985923.hstgr.cloud

2. **Restore from Hostinger Backup**
   - Hostinger may have VPS snapshots
   - Request restoration to last known good state

3. **Fresh VPS Setup**
   - As last resort, provision new VPS
   - Follow deployment guide from scratch
   - Restore data from backups

## Important Notes

- **Always backup before recovery attempts**
- **Document what caused the emergency**
- **Test recovery procedures during low traffic**
- **Keep this guide updated with new scenarios**
- **Save successful recovery commands for future use**

---
*Emergency Recovery Guide Last Updated: December 2024*
*Keep this document readily accessible*