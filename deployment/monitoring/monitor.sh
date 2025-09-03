#!/bin/bash

# Monitoring Script for Vidibemus AI
# Checks system health and sends alerts

# Configuration
DOMAIN="vidibemus.ai"
ALERT_EMAIL="admin@videbimusai.com"
SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL"
LOG_FILE="/var/log/vidibemus/monitor.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Function to send alert
send_alert() {
    local SEVERITY=$1
    local MESSAGE=$2
    
    # Log the alert
    log_message "ALERT [$SEVERITY]: $MESSAGE"
    
    # Send email alert
    echo "$MESSAGE" | mail -s "[$SEVERITY] Vidibemus AI Alert" $ALERT_EMAIL
    
    # Send Slack alert if webhook is configured
    if [ "$SLACK_WEBHOOK" != "YOUR_SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"[$SEVERITY] $MESSAGE\"}" \
            $SLACK_WEBHOOK
    fi
}

# Check website availability
check_website() {
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
    
    if [ $HTTP_STATUS -eq 200 ]; then
        echo -e "${GREEN}✓ Website is up (HTTP $HTTP_STATUS)${NC}"
        log_message "Website check: OK"
    else
        echo -e "${RED}✗ Website is down (HTTP $HTTP_STATUS)${NC}"
        send_alert "CRITICAL" "Website is down! HTTP status: $HTTP_STATUS"
    fi
}

# Check API health
check_api() {
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health)
    
    if [ $API_STATUS -eq 200 ]; then
        echo -e "${GREEN}✓ API is healthy${NC}"
        log_message "API check: OK"
    else
        echo -e "${RED}✗ API is unhealthy (HTTP $API_STATUS)${NC}"
        send_alert "CRITICAL" "API is unhealthy! HTTP status: $API_STATUS"
    fi
}

# Check SSL certificate expiry
check_ssl() {
    EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 7 ]; then
        echo -e "${RED}✗ SSL certificate expires in $DAYS_LEFT days${NC}"
        send_alert "WARNING" "SSL certificate expires in $DAYS_LEFT days"
    elif [ $DAYS_LEFT -lt 30 ]; then
        echo -e "${YELLOW}⚠ SSL certificate expires in $DAYS_LEFT days${NC}"
        log_message "SSL certificate expires in $DAYS_LEFT days"
    else
        echo -e "${GREEN}✓ SSL certificate valid for $DAYS_LEFT days${NC}"
        log_message "SSL check: OK ($DAYS_LEFT days remaining)"
    fi
}

# Check disk usage
check_disk() {
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $DISK_USAGE -gt 90 ]; then
        echo -e "${RED}✗ Disk usage critical: ${DISK_USAGE}%${NC}"
        send_alert "CRITICAL" "Disk usage is at ${DISK_USAGE}%"
    elif [ $DISK_USAGE -gt 80 ]; then
        echo -e "${YELLOW}⚠ Disk usage high: ${DISK_USAGE}%${NC}"
        send_alert "WARNING" "Disk usage is at ${DISK_USAGE}%"
    else
        echo -e "${GREEN}✓ Disk usage: ${DISK_USAGE}%${NC}"
        log_message "Disk usage: ${DISK_USAGE}%"
    fi
}

# Check memory usage
check_memory() {
    MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    
    if [ $MEMORY_USAGE -gt 90 ]; then
        echo -e "${RED}✗ Memory usage critical: ${MEMORY_USAGE}%${NC}"
        send_alert "CRITICAL" "Memory usage is at ${MEMORY_USAGE}%"
    elif [ $MEMORY_USAGE -gt 80 ]; then
        echo -e "${YELLOW}⚠ Memory usage high: ${MEMORY_USAGE}%${NC}"
        send_alert "WARNING" "Memory usage is at ${MEMORY_USAGE}%"
    else
        echo -e "${GREEN}✓ Memory usage: ${MEMORY_USAGE}%${NC}"
        log_message "Memory usage: ${MEMORY_USAGE}%"
    fi
}

# Check CPU usage
check_cpu() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')
    
    if [ $CPU_USAGE -gt 90 ]; then
        echo -e "${RED}✗ CPU usage critical: ${CPU_USAGE}%${NC}"
        send_alert "CRITICAL" "CPU usage is at ${CPU_USAGE}%"
    elif [ $CPU_USAGE -gt 80 ]; then
        echo -e "${YELLOW}⚠ CPU usage high: ${CPU_USAGE}%${NC}"
        log_message "CPU usage high: ${CPU_USAGE}%"
    else
        echo -e "${GREEN}✓ CPU usage: ${CPU_USAGE}%${NC}"
        log_message "CPU usage: ${CPU_USAGE}%"
    fi
}

# Check services
check_services() {
    SERVICES=("nginx" "postgresql" "redis-server" "pm2" "postfix" "dovecot")
    
    for SERVICE in "${SERVICES[@]}"; do
        if systemctl is-active --quiet $SERVICE; then
            echo -e "${GREEN}✓ $SERVICE is running${NC}"
            log_message "$SERVICE: running"
        else
            echo -e "${RED}✗ $SERVICE is not running${NC}"
            send_alert "CRITICAL" "$SERVICE is not running!"
            
            # Attempt to restart the service
            systemctl restart $SERVICE
            sleep 5
            
            if systemctl is-active --quiet $SERVICE; then
                send_alert "INFO" "$SERVICE was restarted successfully"
            else
                send_alert "CRITICAL" "Failed to restart $SERVICE"
            fi
        fi
    done
}

# Check PM2 processes
check_pm2() {
    PM2_STATUS=$(su - vidibemus -c "pm2 list" | grep "vidibemus-ai")
    
    if echo "$PM2_STATUS" | grep -q "online"; then
        echo -e "${GREEN}✓ PM2 application is online${NC}"
        log_message "PM2 application: online"
    else
        echo -e "${RED}✗ PM2 application is not online${NC}"
        send_alert "CRITICAL" "PM2 application is not online!"
        
        # Attempt to restart
        su - vidibemus -c "cd /var/www/vidibemus && pm2 restart vidibemus-ai"
    fi
}

# Check database connectivity
check_database() {
    if PGPASSWORD=$DB_PASSWORD psql -h localhost -U vidibemus -d vidibemus_ai -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is accessible${NC}"
        log_message "Database: accessible"
    else
        echo -e "${RED}✗ Database is not accessible${NC}"
        send_alert "CRITICAL" "Database is not accessible!"
    fi
}

# Check Redis
check_redis() {
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is responding${NC}"
        log_message "Redis: responding"
    else
        echo -e "${RED}✗ Redis is not responding${NC}"
        send_alert "CRITICAL" "Redis is not responding!"
    fi
}

# Check backup status
check_backups() {
    BACKUP_DIR="/var/backups/vidibemus"
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.sql.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo -e "${RED}✗ No backups found${NC}"
        send_alert "WARNING" "No database backups found!"
    else
        BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 3600 ))
        
        if [ $BACKUP_AGE -gt 48 ]; then
            echo -e "${YELLOW}⚠ Latest backup is $BACKUP_AGE hours old${NC}"
            send_alert "WARNING" "Latest backup is $BACKUP_AGE hours old"
        else
            echo -e "${GREEN}✓ Latest backup is $BACKUP_AGE hours old${NC}"
            log_message "Backup check: OK ($BACKUP_AGE hours old)"
        fi
    fi
}

# Main monitoring function
run_monitoring() {
    echo "======================================"
    echo "Vidibemus AI System Health Check"
    echo "Time: $(date)"
    echo "======================================"
    
    check_website
    check_api
    check_ssl
    check_disk
    check_memory
    check_cpu
    check_services
    check_pm2
    check_database
    check_redis
    check_backups
    
    echo "======================================"
    log_message "Health check completed"
}

# Run based on command line argument
case "$1" in
    once)
        run_monitoring
        ;;
    loop)
        while true; do
            run_monitoring
            sleep 300  # Check every 5 minutes
        done
        ;;
    *)
        echo "Usage: $0 {once|loop}"
        echo "  once - Run health check once"
        echo "  loop - Run health check continuously"
        exit 1
        ;;
esac