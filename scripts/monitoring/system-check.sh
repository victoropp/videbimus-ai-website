#!/bin/bash

# System Health Check Script for Vidibemus AI
# Monitors system resources, services, and application health

set -e

# Configuration
HEALTH_URL="http://localhost:3000/api/health"
METRICS_URL="http://localhost:3000/api/metrics"
LOG_FILE="/var/log/vidibemus/system-check.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=80
ALERT_THRESHOLD_DISK=85

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

error() {
    local message="[ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"
}

success() {
    local message="[SUCCESS] $1"
    echo -e "${GREEN}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"
}

warning() {
    local message="[WARNING] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    if [ "${CPU_USAGE%.*}" -gt $ALERT_THRESHOLD_CPU ]; then
        warning "High CPU usage: ${CPU_USAGE}%"
    else
        success "CPU usage: ${CPU_USAGE}%"
    fi
    
    # Memory usage
    MEMORY_INFO=$(free | grep Mem)
    TOTAL_MEM=$(echo $MEMORY_INFO | awk '{print $2}')
    USED_MEM=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_USAGE=$((USED_MEM * 100 / TOTAL_MEM))
    
    if [ $MEMORY_USAGE -gt $ALERT_THRESHOLD_MEMORY ]; then
        warning "High memory usage: ${MEMORY_USAGE}%"
    else
        success "Memory usage: ${MEMORY_USAGE}%"
    fi
    
    # Disk usage
    DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
    if [ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ]; then
        warning "High disk usage: ${DISK_USAGE}%"
    else
        success "Disk usage: ${DISK_USAGE}%"
    fi
}

# Check Docker services
check_docker_services() {
    log "Checking Docker services..."
    
    SERVICES=("vidibemus-app" "vidibemus-postgres" "vidibemus-redis" "vidibemus-nginx")
    
    for service in "${SERVICES[@]}"; do
        if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
            success "Service $service is running"
        else
            error "Service $service is not running"
        fi
    done
}

# Check application health
check_application_health() {
    log "Checking application health..."
    
    # Check health endpoint
    if curl -sf "$HEALTH_URL" > /dev/null; then
        success "Health endpoint is responding"
    else
        error "Health endpoint is not responding"
    fi
    
    # Check specific health details
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
    if echo "$HEALTH_RESPONSE" | jq -e '.status == "healthy"' > /dev/null; then
        success "Application is healthy"
    else
        warning "Application health check failed"
        echo "$HEALTH_RESPONSE" | jq '.error' 2>/dev/null || echo "Unknown error"
    fi
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    if docker exec vidibemus-postgres pg_isready -U vidibemus -d vidibemus_ai > /dev/null; then
        success "Database is accessible"
        
        # Check database performance
        DB_CONNECTIONS=$(docker exec vidibemus-postgres psql -U vidibemus -d vidibemus_ai -t -c "SELECT count(*) FROM pg_stat_activity;" | xargs)
        log "Active database connections: $DB_CONNECTIONS"
        
        if [ "$DB_CONNECTIONS" -gt 50 ]; then
            warning "High number of database connections: $DB_CONNECTIONS"
        fi
    else
        error "Database is not accessible"
    fi
}

# Check Redis connectivity
check_redis() {
    log "Checking Redis connectivity..."
    
    if docker exec vidibemus-redis redis-cli ping | grep -q "PONG"; then
        success "Redis is accessible"
        
        # Check Redis memory usage
        REDIS_MEMORY=$(docker exec vidibemus-redis redis-cli info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
        log "Redis memory usage: $REDIS_MEMORY"
    else
        error "Redis is not accessible"
    fi
}

# Check SSL certificate expiration
check_ssl_certificate() {
    log "Checking SSL certificate..."
    
    if [ -f "/etc/nginx/ssl/fullchain.pem" ]; then
        CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/nginx/ssl/fullchain.pem | cut -d= -f2)
        CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (CERT_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
            warning "SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        else
            success "SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        fi
    else
        warning "SSL certificate file not found"
    fi
}

# Check log files for errors
check_logs() {
    log "Checking application logs for errors..."
    
    # Check for recent errors in application logs
    if docker logs vidibemus-app --tail 100 2>&1 | grep -i error | tail -5; then
        warning "Recent errors found in application logs"
    else
        success "No recent errors in application logs"
    fi
    
    # Check for recent errors in nginx logs
    if [ -f "/var/log/nginx/error.log" ]; then
        RECENT_NGINX_ERRORS=$(tail -n 100 /var/log/nginx/error.log | grep "$(date '+%Y/%m/%d %H')" | wc -l)
        if [ $RECENT_NGINX_ERRORS -gt 0 ]; then
            warning "Found $RECENT_NGINX_ERRORS recent nginx errors"
        else
            success "No recent nginx errors"
        fi
    fi
}

# Check network connectivity
check_network() {
    log "Checking network connectivity..."
    
    # Check external connectivity
    if ping -c 1 google.com > /dev/null 2>&1; then
        success "External network connectivity OK"
    else
        error "External network connectivity failed"
    fi
    
    # Check port availability
    PORTS=(80 443 3000 5432 6379)
    for port in "${PORTS[@]}"; do
        if netstat -tuln | grep ":$port " > /dev/null; then
            success "Port $port is listening"
        else
            warning "Port $port is not listening"
        fi
    done
}

# Send alerts if issues found
send_alerts() {
    local alert_message=$1
    
    # Send Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 System Alert: $alert_message\"}" \
        "$SLACK_WEBHOOK_URL"
    fi
    
    # Send Discord notification
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"content\":\"🚨 System Alert: $alert_message\"}" \
        "$DISCORD_WEBHOOK_URL"
    fi
    
    # Send email notification
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$alert_message" | mail -s "Vidibemus AI System Alert" "$ALERT_EMAIL"
    fi
}

# Generate system report
generate_report() {
    log "Generating system report..."
    
    REPORT_FILE="/tmp/system-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Vidibemus AI System Report ==="
        echo "Generated: $(date)"
        echo ""
        echo "=== System Information ==="
        uname -a
        echo ""
        echo "=== System Uptime ==="
        uptime
        echo ""
        echo "=== Memory Usage ==="
        free -h
        echo ""
        echo "=== Disk Usage ==="
        df -h
        echo ""
        echo "=== Docker Services ==="
        docker ps
        echo ""
        echo "=== Recent Application Logs ==="
        docker logs vidibemus-app --tail 20
        echo ""
        echo "=== Network Statistics ==="
        netstat -i
    } > "$REPORT_FILE"
    
    log "System report generated: $REPORT_FILE"
}

# Main check function
main() {
    log "Starting system health check..."
    
    ISSUES_FOUND=false
    
    check_system_resources
    check_docker_services
    check_application_health
    check_database
    check_redis
    check_ssl_certificate
    check_logs
    check_network
    
    if [ "$ISSUES_FOUND" = true ]; then
        warning "System health check completed with issues"
        send_alerts "System health check found issues. Please review the logs."
    else
        success "System health check completed successfully"
    fi
    
    # Generate report if requested
    if [ "${1:-}" = "--report" ]; then
        generate_report
    fi
}

# Handle different modes
case "${1:-}" in
    "--resources")
        check_system_resources
        ;;
    "--services")
        check_docker_services
        ;;
    "--health")
        check_application_health
        ;;
    "--database")
        check_database
        ;;
    "--redis")
        check_redis
        ;;
    "--ssl")
        check_ssl_certificate
        ;;
    "--logs")
        check_logs
        ;;
    "--network")
        check_network
        ;;
    "--report")
        generate_report
        ;;
    *)
        main "$@"
        ;;
esac