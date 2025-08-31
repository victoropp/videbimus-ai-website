#!/bin/bash

# Database Backup Script for Vidibemus AI
# Creates automated backups with rotation and compression

set -e

# Configuration
BACKUP_DIR="/backups/database"
DB_CONTAINER="vidibemus-postgres"
DB_NAME="vidibemus_ai"
DB_USER="vidibemus"
RETENTION_DAYS=30
S3_BUCKET=${S3_BACKUP_BUCKET:-""}
ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY:-""}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Check if database container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    error "Database container '$DB_CONTAINER' is not running"
fi

log "Starting database backup..."

# Create database dump
if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --clean --no-owner --no-privileges > "$BACKUP_FILE"; then
    success "Database dump created: $BACKUP_FILE"
else
    error "Failed to create database dump"
fi

# Compress the backup
log "Compressing backup file..."
if gzip "$BACKUP_FILE"; then
    success "Backup compressed: $COMPRESSED_FILE"
    BACKUP_FILE="$COMPRESSED_FILE"
else
    error "Failed to compress backup file"
fi

# Encrypt backup if encryption key is provided
if [ -n "$ENCRYPTION_KEY" ]; then
    log "Encrypting backup file..."
    ENCRYPTED_FILE="${BACKUP_FILE}.enc"
    if openssl enc -aes-256-cbc -salt -in "$BACKUP_FILE" -out "$ENCRYPTED_FILE" -k "$ENCRYPTION_KEY"; then
        rm "$BACKUP_FILE"
        BACKUP_FILE="$ENCRYPTED_FILE"
        success "Backup encrypted: $BACKUP_FILE"
    else
        error "Failed to encrypt backup file"
    fi
fi

# Get file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
success "Backup created successfully: $BACKUP_FILE (Size: $BACKUP_SIZE)"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    log "Uploading backup to S3..."
    if command -v aws >/dev/null 2>&1; then
        S3_KEY="database-backups/$(basename "$BACKUP_FILE")"
        if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/$S3_KEY"; then
            success "Backup uploaded to S3: s3://$S3_BUCKET/$S3_KEY"
        else
            warning "Failed to upload backup to S3"
        fi
    else
        warning "AWS CLI not installed, skipping S3 upload"
    fi
fi

# Clean up old backups (local)
log "Cleaning up old local backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql*" -mtime +$RETENTION_DAYS -delete
CLEANED=$(find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.sql*" -mtime +$RETENTION_DAYS | wc -l)
success "Cleaned up $CLEANED old backup files"

# Clean up old S3 backups if configured
if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
    log "Cleaning up old S3 backups..."
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
    aws s3api list-objects-v2 --bucket "$S3_BUCKET" --prefix "database-backups/" --query "Contents[?LastModified<='$CUTOFF_DATE'].Key" --output text | \
    while read key; do
        if [ -n "$key" ]; then
            aws s3 rm "s3://$S3_BUCKET/$key"
            log "Deleted old S3 backup: $key"
        fi
    done
fi

# Create backup metadata
cat > "${BACKUP_FILE}.meta" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "database": "$DB_NAME",
  "size": "$BACKUP_SIZE",
  "compressed": true,
  "encrypted": $([ -n "$ENCRYPTION_KEY" ] && echo true || echo false),
  "location": "$BACKUP_FILE",
  "s3_location": $([ -n "$S3_BUCKET" ] && echo "\"s3://$S3_BUCKET/$S3_KEY\"" || echo null)
}
EOF

# Send notification if webhook is configured
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"📦 Database backup completed successfully\\nSize: $BACKUP_SIZE\\nLocation: $BACKUP_FILE\"}" \
    "$SLACK_WEBHOOK_URL" || warning "Failed to send Slack notification"
fi

success "Database backup process completed successfully!"

# Print backup information
echo ""
echo "=== Backup Summary ==="
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"
echo "File: $BACKUP_FILE"
echo "Size: $BACKUP_SIZE"
echo "Encrypted: $([ -n "$ENCRYPTION_KEY" ] && echo "Yes" || echo "No")"
echo "S3 Upload: $([ -n "$S3_BUCKET" ] && echo "Yes" || echo "No")"
echo "======================"