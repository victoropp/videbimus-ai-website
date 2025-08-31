#!/bin/bash

# Log Analyzer Script for Vidibemus AI
# Analyzes application logs for patterns, errors, and performance issues

set -e

# Configuration
LOG_DIR="/var/log/vidibemus"
REPORT_DIR="/tmp/log-analysis"
RETENTION_DAYS=30

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
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Create directories
mkdir -p "$LOG_DIR" "$REPORT_DIR"

# Analyze Docker container logs
analyze_container_logs() {
    log "Analyzing container logs..."
    
    local containers=("vidibemus-app" "vidibemus-postgres" "vidibemus-redis" "vidibemus-nginx")
    local report_file="$REPORT_DIR/container-logs-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Container Log Analysis ==="
        echo "Generated: $(date)"
        echo ""
        
        for container in "${containers[@]}"; do
            if docker ps --filter "name=$container" | grep -q "$container"; then
                echo "=== $container ===" 
                echo "Last 100 lines:"
                docker logs "$container" --tail 100 2>&1 | tail -20
                echo ""
                
                echo "Error count (last 1000 lines):"
                docker logs "$container" --tail 1000 2>&1 | grep -ci "error" || echo "0"
                echo ""
                
                echo "Warning count (last 1000 lines):"
                docker logs "$container" --tail 1000 2>&1 | grep -ci "warning" || echo "0"
                echo ""
                
                echo "Recent errors:"
                docker logs "$container" --tail 1000 2>&1 | grep -i "error" | tail -5
                echo ""
            else
                echo "=== $container ==="
                echo "Container not running"
                echo ""
            fi
        done
    } > "$report_file"
    
    success "Container log analysis saved to: $report_file"
}

# Analyze application performance
analyze_performance() {
    log "Analyzing application performance..."
    
    local report_file="$REPORT_DIR/performance-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Performance Analysis ==="
        echo "Generated: $(date)"
        echo ""
        
        # Response time analysis
        echo "=== Response Time Analysis ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -E "GET|POST|PUT|DELETE" | \
        grep -E "[0-9]+ms" | \
        tail -20
        echo ""
        
        # Memory usage trends
        echo "=== Memory Usage ==="
        docker stats vidibemus-app --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"
        echo ""
        
        # Database query performance
        echo "=== Database Query Performance ==="
        docker exec vidibemus-postgres psql -U vidibemus -d vidibemus_ai -c "
        SELECT query, calls, total_time, mean_time, stddev_time 
        FROM pg_stat_statements 
        ORDER BY total_time DESC 
        LIMIT 10;
        " 2>/dev/null || echo "pg_stat_statements extension not available"
        echo ""
        
        # Redis performance
        echo "=== Redis Performance ==="
        docker exec vidibemus-redis redis-cli info stats | grep -E "instantaneous_ops_per_sec|used_memory_human|connected_clients"
        echo ""
    } > "$report_file"
    
    success "Performance analysis saved to: $report_file"
}

# Analyze security events
analyze_security() {
    log "Analyzing security events..."
    
    local report_file="$REPORT_DIR/security-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Security Event Analysis ==="
        echo "Generated: $(date)"
        echo ""
        
        # Failed login attempts
        echo "=== Failed Login Attempts ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -i "failed.*login\|authentication.*failed\|invalid.*credentials" | \
        tail -10
        echo ""
        
        # Rate limiting events
        echo "=== Rate Limiting Events ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -i "rate.*limit\|too.*many.*requests" | \
        tail -10
        echo ""
        
        # Suspicious activity
        echo "=== Suspicious Activity ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -i "suspicious\|blocked\|forbidden" | \
        tail -10
        echo ""
        
        # NGINX security events
        echo "=== NGINX Security Events ==="
        if [ -f "/var/log/nginx/error.log" ]; then
            grep -i "blocked\|denied\|forbidden" /var/log/nginx/error.log | tail -10
        else
            echo "NGINX error log not available"
        fi
        echo ""
    } > "$report_file"
    
    success "Security analysis saved to: $report_file"
}

# Analyze error patterns
analyze_errors() {
    log "Analyzing error patterns..."
    
    local report_file="$REPORT_DIR/errors-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Error Pattern Analysis ==="
        echo "Generated: $(date)"
        echo ""
        
        # Most common errors
        echo "=== Most Common Errors ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -i "error" | \
        cut -d' ' -f4- | \
        sort | uniq -c | sort -rn | head -10
        echo ""
        
        # Database errors
        echo "=== Database Errors ==="
        docker logs vidibemus-postgres --tail 1000 2>&1 | \
        grep -i "error\|fatal" | tail -10
        echo ""
        
        # Application crashes
        echo "=== Application Crashes ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -i "crash\|exit\|killed\|segmentation" | tail -10
        echo ""
        
        # Node.js errors
        echo "=== Node.js Errors ==="
        docker logs vidibemus-app --tail 1000 2>&1 | \
        grep -E "UnhandledPromiseRejectionWarning|DeprecationWarning|MaxListenersExceededWarning" | \
        tail -10
        echo ""
    } > "$report_file"
    
    success "Error analysis saved to: $report_file"
}

# Generate summary report
generate_summary() {
    log "Generating summary report..."
    
    local summary_file="$REPORT_DIR/summary-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Log Analysis Summary ==="
        echo "Generated: $(date)"
        echo "Analysis Period: Last 24 hours"
        echo ""
        
        # Overall statistics
        echo "=== Overall Statistics ==="
        echo "Total application log entries: $(docker logs vidibemus-app --since=24h 2>&1 | wc -l)"
        echo "Total errors: $(docker logs vidibemus-app --since=24h 2>&1 | grep -ci "error" || echo "0")"
        echo "Total warnings: $(docker logs vidibemus-app --since=24h 2>&1 | grep -ci "warning" || echo "0")"
        echo ""
        
        # Service availability
        echo "=== Service Availability ==="
        for container in vidibemus-app vidibemus-postgres vidibemus-redis; do
            if docker ps --filter "name=$container" | grep -q "$container"; then
                echo "$container: UP"
            else
                echo "$container: DOWN"
            fi
        done
        echo ""
        
        # Top errors
        echo "=== Top 5 Errors ==="
        docker logs vidibemus-app --since=24h 2>&1 | \
        grep -i "error" | \
        head -50 | \
        cut -d' ' -f4- | \
        sort | uniq -c | sort -rn | head -5
        echo ""
        
        # Performance indicators
        echo "=== Performance Indicators ==="
        echo "Average response time: $(docker logs vidibemus-app --since=24h 2>&1 | \
                                    grep -E "[0-9]+ms" | \
                                    sed 's/.*\([0-9]\+\)ms.*/\1/' | \
                                    awk '{sum+=$1; n++} END {if(n>0) print sum/n "ms"; else print "N/A"}')"
        
        echo "Memory usage: $(docker stats vidibemus-app --no-stream --format "{{.MemPerc}}")"
        echo "CPU usage: $(docker stats vidibemus-app --no-stream --format "{{.CPUPerc}}")"
        echo ""
        
        # Recommendations
        echo "=== Recommendations ==="
        local error_count=$(docker logs vidibemus-app --since=24h 2>&1 | grep -ci "error" || echo "0")
        if [ "$error_count" -gt 10 ]; then
            echo "- High error count detected ($error_count). Review error logs for patterns."
        fi
        
        local memory_usage=$(docker stats vidibemus-app --no-stream --format "{{.MemPerc}}" | sed 's/%//')
        if [ "${memory_usage%.*}" -gt 80 ]; then
            echo "- High memory usage detected (${memory_usage}%). Consider optimization."
        fi
        
        if ! docker ps --filter "name=vidibemus-app" | grep -q "vidibemus-app"; then
            echo "- Application container is not running. Immediate attention required."
        fi
        
        echo "- Review detailed analysis reports in $REPORT_DIR"
    } > "$summary_file"
    
    success "Summary report saved to: $summary_file"
    
    # Display summary on console
    cat "$summary_file"
}

# Clean old reports
cleanup_old_reports() {
    log "Cleaning up old reports..."
    
    find "$REPORT_DIR" -name "*.txt" -mtime +$RETENTION_DAYS -delete
    
    local remaining=$(find "$REPORT_DIR" -name "*.txt" | wc -l)
    success "Cleanup completed. $remaining reports remaining."
}

# Send report via email/webhook
send_report() {
    local report_file=$1
    
    if [ -n "$ALERT_EMAIL" ] && [ -f "$report_file" ]; then
        cat "$report_file" | mail -s "Vidibemus AI Log Analysis Report" "$ALERT_EMAIL"
        log "Report sent to $ALERT_EMAIL"
    fi
    
    if [ -n "$SLACK_WEBHOOK_URL" ] && [ -f "$report_file" ]; then
        # Send summary to Slack (first 20 lines)
        local summary=$(head -20 "$report_file" | sed 's/"/\\"/g' | tr '\n' '\\n')
        curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"📊 Log Analysis Report:\\n\\n$summary\\n\\nFull report available on server\"}" \
        "$SLACK_WEBHOOK_URL"
        log "Summary sent to Slack"
    fi
}

# Main analysis function
main() {
    log "Starting log analysis..."
    
    analyze_container_logs
    analyze_performance
    analyze_security  
    analyze_errors
    generate_summary
    cleanup_old_reports
    
    # Send the summary report
    local latest_summary=$(find "$REPORT_DIR" -name "summary-*.txt" -type f -exec ls -t {} + | head -1)
    if [ -n "$latest_summary" ]; then
        send_report "$latest_summary"
    fi
    
    success "Log analysis completed. Reports available in: $REPORT_DIR"
}

# Handle command line arguments
case "${1:-}" in
    "--containers")
        analyze_container_logs
        ;;
    "--performance")
        analyze_performance
        ;;
    "--security")
        analyze_security
        ;;
    "--errors")
        analyze_errors
        ;;
    "--summary")
        generate_summary
        ;;
    "--cleanup")
        cleanup_old_reports
        ;;
    *)
        main
        ;;
esac