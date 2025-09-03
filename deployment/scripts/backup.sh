#!/bin/bash

# Backup Script for Vidibemus AI
# Backs up database, files, and configurations

set -e

# Configuration
BACKUP_DIR="/var/backups/vidibemus"
APP_DIR="/var/www/vidibemus"
DB_NAME="vidibemus_ai"
DB_USER="vidibemus"
DB_PASS="CHANGE_THIS_PASSWORD"
RETENTION_DAYS=30
S3_BUCKET="s3://vidibemus-backups"  # Optional: for S3 backups
ALERT_EMAIL="admin@videbimusai.com"

# Create backup directory
mkdir -p $BACKUP_DIR

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting backup process..."

# 1. Backup PostgreSQL database
echo "📦 Backing up PostgreSQL database..."
PGPASSWORD=$DB_PASS pg_dump -h localhost -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

# 2. Backup application files
echo "📁 Backing up application files..."
tar -czf "$BACKUP_DIR/app_${TIMESTAMP}.tar.gz" \
    --exclude="$APP_DIR/node_modules" \
    --exclude="$APP_DIR/.next" \
    --exclude="$APP_DIR/.git" \
    --exclude="$APP_DIR/logs" \
    $APP_DIR

# 3. Backup environment files
echo "🔐 Backing up environment files..."
tar -czf "$BACKUP_DIR/env_${TIMESTAMP}.tar.gz" \
    $APP_DIR/.env.local \
    $APP_DIR/.env.production \
    2>/dev/null || echo "No environment files found"

# 4. Backup Nginx configuration
echo "🌐 Backing up Nginx configuration..."
tar -czf "$BACKUP_DIR/nginx_${TIMESTAMP}.tar.gz" \
    /etc/nginx/sites-available/vidibemus.ai \
    /etc/nginx/nginx.conf

# 5. Backup email configuration
echo "📧 Backing up email configuration..."
tar -czf "$BACKUP_DIR/email_${TIMESTAMP}.tar.gz" \
    /etc/postfix/main.cf \
    /etc/postfix/master.cf \
    /etc/dovecot/dovecot.conf \
    2>/dev/null || echo "Email config backup skipped"

# 6. Backup PM2 configuration
echo "⚙️ Backing up PM2 configuration..."
su - vidibemus -c "pm2 save"
tar -czf "$BACKUP_DIR/pm2_${TIMESTAMP}.tar.gz" \
    /home/vidibemus/.pm2/dump.pm2

# 7. Create a master backup file
echo "📦 Creating master backup archive..."
tar -czf "$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz" \
    "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz" \
    "$BACKUP_DIR/app_${TIMESTAMP}.tar.gz" \
    "$BACKUP_DIR/env_${TIMESTAMP}.tar.gz" \
    "$BACKUP_DIR/nginx_${TIMESTAMP}.tar.gz" \
    "$BACKUP_DIR/email_${TIMESTAMP}.tar.gz" \
    "$BACKUP_DIR/pm2_${TIMESTAMP}.tar.gz"

# 8. Upload to S3 (optional)
if command -v aws &> /dev/null && [ "$S3_BUCKET" != "s3://vidibemus-backups" ]; then
    echo "☁️ Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz" $S3_BUCKET/
fi

# 9. Clean up old backups
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 10. Send backup report
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz" | cut -f1)
echo "✅ Backup completed successfully!"
echo "   File: full_backup_${TIMESTAMP}.tar.gz"
echo "   Size: $BACKUP_SIZE"
echo "   Location: $BACKUP_DIR"

# Send email notification
echo "Backup completed successfully
File: full_backup_${TIMESTAMP}.tar.gz
Size: $BACKUP_SIZE
Location: $BACKUP_DIR
Retention: $RETENTION_DAYS days" | mail -s "Backup Success - Vidibemus AI" $ALERT_EMAIL

# Verify backup integrity
echo "🔍 Verifying backup integrity..."
tar -tzf "$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backup integrity verified"
else
    echo "❌ Backup integrity check failed!"
    echo "Backup integrity check failed for full_backup_${TIMESTAMP}.tar.gz" | mail -s "CRITICAL: Backup Integrity Failed" $ALERT_EMAIL
    exit 1
fi

# Log backup
echo "[$(date)] Backup completed: full_backup_${TIMESTAMP}.tar.gz ($BACKUP_SIZE)" >> /var/log/vidibemus/backup.log