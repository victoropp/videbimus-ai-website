#!/bin/bash

# Vidibemus AI DevOps Setup Script
# This script sets up the complete DevOps infrastructure

set -e

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

# Check if running on Windows/WSL
check_platform() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        warning "Running on Windows. Some features may not work as expected."
        warning "Consider using WSL2 for better Docker support."
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker Desktop."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed."
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        warning "Node.js is not installed. This is required for development."
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ $MAJOR_VERSION -lt 18 ]; then
            warning "Node.js version is $NODE_VERSION. Version 18+ is recommended."
        fi
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error "Git is not installed."
    fi
    
    success "Prerequisites check completed"
}

# Make scripts executable
setup_permissions() {
    log "Setting up script permissions..."
    
    # Make all shell scripts executable
    find scripts/ -name "*.sh" -exec chmod +x {} \;
    
    success "Script permissions configured"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    # Log directories
    mkdir -p logs/{app,nginx,postgres,redis}
    mkdir -p backups/database
    mkdir -p tmp/uploads
    mkdir -p data/{postgres,redis,grafana,prometheus}
    
    # SSL directory (for production)
    mkdir -p docker/nginx/ssl
    
    success "Directories created"
}

# Set up environment file
setup_environment() {
    if [ ! -f .env ]; then
        log "Setting up environment file..."
        cp .env.example .env
        success "Environment file created. Please edit .env with your configuration."
    else
        log "Environment file already exists"
    fi
}

# Initialize Git hooks (if in a git repository)
setup_git_hooks() {
    if [ -d ".git" ]; then
        log "Setting up Git hooks..."
        
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run linting and type checking before commit
npm run lint
npm run type-check
EOF
        chmod +x .git/hooks/pre-commit
        
        success "Git hooks configured"
    else
        log "Not in a Git repository, skipping Git hooks setup"
    fi
}

# Install dependencies
install_dependencies() {
    if [ -f "package.json" ]; then
        log "Installing Node.js dependencies..."
        npm install
        success "Dependencies installed"
    else
        warning "package.json not found, skipping dependency installation"
    fi
}

# Generate Prisma client
setup_database() {
    log "Setting up database schema..."
    
    if command -v npx &> /dev/null; then
        npx prisma generate
        success "Prisma client generated"
    else
        warning "npx not available, skipping Prisma setup"
    fi
}

# Test Docker setup
test_docker_setup() {
    log "Testing Docker setup..."
    
    # Test if Docker daemon is running
    if docker info &> /dev/null; then
        success "Docker daemon is running"
    else
        error "Docker daemon is not running. Please start Docker Desktop."
    fi
    
    # Test Docker Compose
    if docker-compose --version &> /dev/null; then
        success "Docker Compose is working"
    else
        error "Docker Compose is not working properly"
    fi
}

# Create systemd services (Linux only)
setup_systemd_services() {
    if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v systemctl &> /dev/null; then
        log "Setting up systemd services..."
        
        # Create systemd service for the application
        cat > /tmp/vidibemus-ai.service << EOF
[Unit]
Description=Vidibemus AI Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose --profile production up -d
ExecStop=/usr/bin/docker-compose --profile production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
        
        if [ "$EUID" -eq 0 ]; then
            mv /tmp/vidibemus-ai.service /etc/systemd/system/
            systemctl daemon-reload
            success "Systemd service created. Enable with: systemctl enable vidibemus-ai"
        else
            warning "Run as root to install systemd service, or manually copy /tmp/vidibemus-ai.service to /etc/systemd/system/"
        fi
    else
        log "Systemd not available, skipping service setup"
    fi
}

# Set up monitoring cron jobs
setup_cron_jobs() {
    log "Setting up monitoring cron jobs..."
    
    # Create crontab entries (Linux/macOS)
    if command -v crontab &> /dev/null; then
        # Backup cron jobs
        cat > /tmp/vidibemus-cron << EOF
# Vidibemus AI Monitoring and Maintenance
# Database backup (daily at 2 AM)
0 2 * * * $(pwd)/scripts/database/backup.sh

# System health check (every 15 minutes)
*/15 * * * * $(pwd)/scripts/monitoring/system-check.sh

# Log analysis (daily at 1 AM)
0 1 * * * $(pwd)/scripts/monitoring/log-analyzer.sh

# Weekly log cleanup (Sundays at 3 AM)
0 3 * * 0 find $(pwd)/logs -name "*.log" -mtime +7 -delete
EOF
        
        success "Cron jobs template created at /tmp/vidibemus-cron"
        success "Install with: crontab /tmp/vidibemus-cron"
    else
        warning "Crontab not available, skipping cron job setup"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "=== SETUP COMPLETE ==="
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Edit .env file with your configuration:"
    echo "   - Database credentials"
    echo "   - API keys"
    echo "   - Security secrets"
    echo ""
    echo "2. Start the development environment:"
    echo "   docker-compose --profile development up -d"
    echo ""
    echo "3. Access the application:"
    echo "   - App: http://localhost:3000"
    echo "   - Health check: http://localhost:3000/api/health"
    echo ""
    echo "4. For production deployment:"
    echo "   docker-compose --profile production up -d"
    echo ""
    echo "5. Enable monitoring:"
    echo "   docker-compose --profile monitoring up -d"
    echo "   - Prometheus: http://localhost:9090"
    echo "   - Grafana: http://localhost:3001"
    echo ""
    echo "6. Install cron jobs for automated monitoring:"
    echo "   crontab /tmp/vidibemus-cron"
    echo ""
    echo "📚 Documentation:"
    echo "   - Deployment guide: ./DEPLOYMENT.md"
    echo "   - Architecture docs: ./docs/architecture/"
    echo ""
    echo "🛠️ Useful commands:"
    echo "   - Deploy: ./scripts/deployment/deploy.sh"
    echo "   - Backup: ./scripts/database/backup.sh"
    echo "   - System check: ./scripts/monitoring/system-check.sh"
    echo "   - Log analysis: ./scripts/monitoring/log-analyzer.sh"
    echo ""
}

# Main setup function
main() {
    echo ""
    echo "🚀 Vidibemus AI DevOps Setup"
    echo "============================"
    echo ""
    
    check_platform
    check_prerequisites
    setup_permissions
    create_directories
    setup_environment
    setup_git_hooks
    install_dependencies
    setup_database
    test_docker_setup
    setup_systemd_services
    setup_cron_jobs
    
    success "🎉 Setup completed successfully!"
    show_next_steps
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Vidibemus AI DevOps Setup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h      Show this help message"
        echo "  --check         Check prerequisites only"
        echo "  --permissions   Set up script permissions only"
        echo "  --env           Set up environment file only"
        echo "  --docker        Test Docker setup only"
        echo ""
        exit 0
        ;;
    "--check")
        check_prerequisites
        ;;
    "--permissions")
        setup_permissions
        ;;
    "--env")
        setup_environment
        ;;
    "--docker")
        test_docker_setup
        ;;
    *)
        main
        ;;
esac