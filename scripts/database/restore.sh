#!/bin/bash

# Database Restore Script for Vidibemus AI
# Restores database from backup files

set -e

# Configuration
BACKUP_DIR="/backups/database"
DB_CONTAINER="vidibemus-postgres"
DB_NAME="vidibemus_ai"
DB_USER="vidibemus"
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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] <backup_file>"
    echo ""
    echo "Options:"
    echo "  -l, --list          List available backup files"
    echo "  -f, --force         Force restore without confirmation"
    echo "  -s, --s3 <key>      Restore from S3 backup"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 vidibemus_ai_backup_20231201_120000.sql.gz"
    echo "  $0 --s3 database-backups/vidibemus_ai_backup_20231201_120000.sql.gz"
    echo "  $0 --list"
    exit 1
}

# List available backups
list_backups() {
    log "Available local backups:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/*.sql* 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' | column -t || echo "No backup files found"
    else
        echo "Backup directory does not exist"
    fi
    
    # List S3 backups if configured
    if [ -n "$S3_BACKUP_BUCKET" ] && command -v aws >/dev/null 2>&1; then
        echo ""
        log "Available S3 backups:"
        aws s3 ls "s3://$S3_BACKUP_BUCKET/database-backups/" --human-readable || warning "Failed to list S3 backups"
    fi
    exit 0
}

# Download backup from S3
download_from_s3() {
    local s3_key=$1
    local local_file="$BACKUP_DIR/$(basename "$s3_key")"
    
    if [ -z "$S3_BACKUP_BUCKET" ]; then
        error "S3_BACKUP_BUCKET environment variable not set"
    fi
    
    log "Downloading backup from S3..."
    if aws s3 cp "s3://$S3_BACKUP_BUCKET/$s3_key" "$local_file"; then
        success "Downloaded backup from S3: $local_file"
        echo "$local_file"
    else
        error "Failed to download backup from S3"
    fi
}

# Decrypt backup if needed
decrypt_backup() {
    local encrypted_file=$1
    
    if [[ "$encrypted_file" == *.enc ]]; then
        if [ -z "$ENCRYPTION_KEY" ]; then
            error "Backup is encrypted but BACKUP_ENCRYPTION_KEY not provided"
        fi
        
        log "Decrypting backup file..."
        local decrypted_file="${encrypted_file%.enc}"
        
        if openssl enc -aes-256-cbc -d -salt -in "$encrypted_file" -out "$decrypted_file" -k "$ENCRYPTION_KEY"; then
            success "Backup decrypted: $decrypted_file"
            echo "$decrypted_file"
        else
            error "Failed to decrypt backup file"
        fi
    else
        echo "$encrypted_file"
    fi
}

# Decompress backup if needed
decompress_backup() {
    local compressed_file=$1
    
    if [[ "$compressed_file" == *.gz ]]; then
        log "Decompressing backup file..."
        local decompressed_file="${compressed_file%.gz}"
        
        if gunzip -c "$compressed_file" > "$decompressed_file"; then
            success "Backup decompressed: $decompressed_file"
            echo "$decompressed_file"
        else
            error "Failed to decompress backup file"
        fi
    else
        echo "$compressed_file"
    fi
}

# Create database backup before restore
create_pre_restore_backup() {
    log "Creating pre-restore backup..."
    local pre_backup_file="$BACKUP_DIR/${DB_NAME}_pre_restore_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$pre_backup_file"; then
        gzip "$pre_backup_file"
        success "Pre-restore backup created: ${pre_backup_file}.gz"
    else
        warning "Failed to create pre-restore backup"
    fi
}

# Restore database
restore_database() {
    local backup_file=$1
    
    # Check if database container is running
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        error "Database container '$DB_CONTAINER' is not running"
    fi
    
    # Verify backup file exists
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
    fi
    
    # Create pre-restore backup
    create_pre_restore_backup
    
    log "Restoring database from: $backup_file"
    
    # Stop application to prevent connections during restore
    if docker ps | grep -q "vidibemus-app"; then
        log "Stopping application container..."
        docker stop vidibemus-app || warning "Failed to stop application container"
    fi
    
    # Drop existing connections
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true
    
    # Restore database
    if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$backup_file"; then
        success "Database restore completed successfully"
    else
        error "Database restore failed"
    fi
    
    # Restart application
    if docker ps -a | grep -q "vidibemus-app"; then
        log "Starting application container..."
        docker start vidibemus-app || warning "Failed to start application container"
    fi
    
    # Verify restore
    log "Verifying database restore..."
    if docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM \"User\";" > /dev/null; then
        success "Database verification passed"
    else
        warning "Database verification failed"
    fi
}

# Parse command line arguments
FORCE_RESTORE=false
BACKUP_FILE=""
S3_KEY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--list)
            list_backups
            ;;
        -f|--force)
            FORCE_RESTORE=true
            shift
            ;;
        -s|--s3)
            S3_KEY="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            if [ -z "$BACKUP_FILE" ] && [ -z "$S3_KEY" ]; then
                BACKUP_FILE="$1"
            fi
            shift
            ;;
    esac
done

# Main restore process
if [ -n "$S3_KEY" ]; then
    BACKUP_FILE=$(download_from_s3 "$S3_KEY")
elif [ -n "$BACKUP_FILE" ]; then
    # If filename provided without path, look in backup directory
    if [[ "$BACKUP_FILE" != /* ]]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi
else
    error "No backup file specified. Use --help for usage information."
fi

# Process the backup file (decrypt/decompress)
PROCESSED_FILE="$BACKUP_FILE"
PROCESSED_FILE=$(decrypt_backup "$PROCESSED_FILE")
PROCESSED_FILE=$(decompress_backup "$PROCESSED_FILE")

# Get backup information
BACKUP_SIZE=$(du -h "$PROCESSED_FILE" | cut -f1)

# Confirmation prompt (unless --force used)
if [ "$FORCE_RESTORE" != true ]; then
    echo ""
    echo "=== RESTORE CONFIRMATION ==="
    echo "Database: $DB_NAME"
    echo "Backup File: $BACKUP_FILE"
    echo "Processed File: $PROCESSED_FILE"
    echo "Size: $BACKUP_SIZE"
    echo ""
    warning "This will OVERWRITE the current database!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Restore cancelled"
        exit 0
    fi
fi

# Perform restore
restore_database "$PROCESSED_FILE"

# Cleanup temporary files
if [ "$PROCESSED_FILE" != "$BACKUP_FILE" ]; then
    rm -f "$PROCESSED_FILE"
    log "Cleaned up temporary files"
fi

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🔄 Database restore completed\\nSource: $(basename "$BACKUP_FILE")\\nSize: $BACKUP_SIZE\"}" \
    "$SLACK_WEBHOOK_URL" || warning "Failed to send Slack notification"
fi

success "Database restore process completed successfully!"