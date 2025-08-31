#!/bin/bash

# Vidibemus AI Deployment Script
# This script handles the deployment of the Vidibemus AI application

set -e  # Exit on any error

# Configuration
PROJECT_NAME="vidibemus-ai"
DOCKER_IMAGE="ghcr.io/vidibemus/${PROJECT_NAME}"
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Check for required commands
check_requirements() {
    log "Checking requirements..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    
    success "All requirements met"
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    mkdir -p $BACKUP_DIR
    BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T postgres pg_dump -U vidibemus vidibemus_ai > $BACKUP_FILE
    
    if [ -f "$BACKUP_FILE" ]; then
        success "Database backup created: $BACKUP_FILE"
        
        # Keep only last 7 days of backups
        find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
    else
        error "Database backup failed"
    fi
}

# Pull latest code
update_code() {
    log "Updating code from repository..."
    
    git fetch origin
    git checkout main
    git pull origin main
    
    success "Code updated successfully"
}

# Build and deploy
deploy_application() {
    log "Building and deploying application..."
    
    # Pull the latest image
    docker-compose pull
    
    # Build the application
    docker-compose build --no-cache
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose run --rm app npx prisma migrate deploy
    
    # Start services with zero downtime
    log "Starting services..."
    docker-compose up -d --force-recreate
    
    success "Application deployed successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    MAX_ATTEMPTS=30
    ATTEMPT=1
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        if curl -sf http://localhost:3000/api/health > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $ATTEMPT/$MAX_ATTEMPTS failed, retrying in 10 seconds..."
        sleep 10
        ATTEMPT=$((ATTEMPT + 1))
    done
    
    error "Health check failed after $MAX_ATTEMPTS attempts"
}

# Cleanup old containers and images
cleanup() {
    log "Cleaning up old containers and images..."
    
    # Remove old containers
    docker container prune -f
    
    # Remove old images (keep last 3)
    docker images "$DOCKER_IMAGE" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}\t{{.ID}}" | \
    tail -n +2 | sort -k2 -r | tail -n +4 | awk '{print $3}' | xargs -r docker rmi
    
    success "Cleanup completed"
}

# Send deployment notification
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Deployment $status: $message\"}" \
        "$SLACK_WEBHOOK_URL"
    fi
    
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"content\":\"🚀 Deployment $status: $message\"}" \
        "$DISCORD_WEBHOOK_URL"
    fi
}

# Main deployment function
main() {
    log "Starting deployment of $PROJECT_NAME..."
    
    check_requirements
    
    # Create backup before deployment
    if docker-compose ps | grep -q postgres; then
        backup_database
    else
        warning "Database container not running, skipping backup"
    fi
    
    update_code
    deploy_application
    health_check
    cleanup
    
    success "Deployment completed successfully!"
    send_notification "SUCCESS" "Application deployed and health check passed"
}

# Handle script arguments
case "${1:-}" in
    "backup")
        backup_database
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    "update")
        update_code
        ;;
    *)
        main
        ;;
esac