# Vidibemus AI Deployment Guide

This guide covers the complete deployment process for the Vidibemus AI platform, including Docker setup, CI/CD configuration, and production deployment.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Git
- SSL certificates (for production)

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`

3. Generate required secrets:
   ```bash
   # NextAuth secret
   openssl rand -base64 32

   # Database password
   openssl rand -base64 24

   # Encryption key
   openssl rand -base64 32
   ```

## 🐳 Docker Deployment

### Development

```bash
# Start development environment
docker-compose --profile development up -d

# View logs
docker-compose logs -f app-dev

# Stop services
docker-compose --profile development down
```

### Production

```bash
# Start production environment
docker-compose --profile production up -d

# Start with monitoring
docker-compose --profile production --profile monitoring up -d

# View services
docker-compose ps
```

### Available Profiles

- `development`: Development environment with hot reload
- `production`: Production environment with optimizations
- `monitoring`: Prometheus and Grafana for monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

1. Add the following secrets to your GitHub repository:
   ```
   DATABASE_URL
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   SENTRY_DSN
   VERCEL_TOKEN
   ORG_ID
   PROJECT_ID
   SLACK_WEBHOOK_URL
   CODECOV_TOKEN
   SNYK_TOKEN
   ```

2. The pipeline will automatically:
   - Run tests on pull requests
   - Build and push Docker images
   - Deploy to staging on `develop` branch
   - Deploy to production on `main` branch
   - Run security scans
   - Send notifications

### Manual Deployment

Use the deployment script for manual deployments:

```bash
# Full deployment
./scripts/deployment/deploy.sh

# Individual operations
./scripts/deployment/deploy.sh backup
./scripts/deployment/deploy.sh health
./scripts/deployment/deploy.sh cleanup
```

## 🌐 Vercel Deployment

### Setup

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link project:
   ```bash
   vercel link
   ```

3. Deploy:
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### Environment Variables

Set these in your Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- All AI service API keys
- Sentry DSN
- Email service keys

## 🛡️ Security Configuration

### SSL/TLS Setup

1. Obtain SSL certificates (Let's Encrypt recommended):
   ```bash
   certbot certonly --nginx -d vidibemus.ai -d www.vidibemus.ai
   ```

2. Place certificates in `docker/nginx/ssl/`

3. Generate DH parameters:
   ```bash
   openssl dhparam -out docker/nginx/ssl/dhparam.pem 2048
   ```

### Security Headers

The application automatically sets security headers:
- Content Security Policy
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- And more...

### Rate Limiting

Configured rate limits:
- API endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Contact forms: 3 requests per hour

## 📊 Monitoring & Logging

### Health Checks

- Application health: `GET /api/health`
- Metrics endpoint: `GET /api/metrics`
- System monitoring: `./scripts/monitoring/system-check.sh`

### Log Analysis

```bash
# Run log analysis
./scripts/monitoring/log-analyzer.sh

# Specific analysis
./scripts/monitoring/log-analyzer.sh --errors
./scripts/monitoring/log-analyzer.sh --security
./scripts/monitoring/log-analyzer.sh --performance
```

### Sentry Integration

Error tracking and performance monitoring configured for:
- Client-side errors
- Server-side errors
- Performance monitoring
- Release tracking

### Grafana Dashboards

Access monitoring at `http://localhost:3001` with:
- System metrics
- Application performance
- Database performance
- Error tracking

## 🗄️ Database Management

### Backups

```bash
# Manual backup
./scripts/database/backup.sh

# Automated backups (set up cron job)
0 2 * * * /path/to/backup.sh
```

### Restore

```bash
# List available backups
./scripts/database/restore.sh --list

# Restore from backup
./scripts/database/restore.sh backup_file.sql.gz

# Restore from S3
./scripts/database/restore.sh --s3 database-backups/backup.sql.gz
```

### Migrations

```bash
# Run migrations
npm run db:migrate

# Or with Docker
docker-compose exec app npx prisma migrate deploy
```

## 🔧 Maintenance

### System Health Checks

```bash
# Full system check
./scripts/monitoring/system-check.sh

# Specific checks
./scripts/monitoring/system-check.sh --resources
./scripts/monitoring/system-check.sh --services
./scripts/monitoring/system-check.sh --database
```

### Log Rotation

Logs are automatically rotated with Docker's logging driver. Configure in `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./scripts/deployment/deploy.sh
```

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker-compose logs container-name
   ```

2. **Database connection issues**
   ```bash
   docker-compose exec postgres pg_isready -U vidibemus
   ```

3. **High memory usage**
   ```bash
   docker stats
   ```

4. **SSL certificate issues**
   ```bash
   ./scripts/monitoring/system-check.sh --ssl
   ```

### Emergency Procedures

1. **Application down**
   ```bash
   docker-compose restart app
   ./scripts/deployment/deploy.sh health
   ```

2. **Database issues**
   ```bash
   ./scripts/database/restore.sh --list
   ./scripts/database/restore.sh latest_backup.sql.gz
   ```

3. **Resource exhaustion**
   ```bash
   docker system prune -f
   ./scripts/monitoring/system-check.sh --resources
   ```

## 📈 Scaling

### Horizontal Scaling

1. Use a load balancer (Nginx, HAProxy)
2. Deploy multiple application instances
3. Use external Redis and PostgreSQL
4. Configure session affinity if needed

### Vertical Scaling

Update resource limits in `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

## 🎯 Performance Optimization

### Application Level

- Enable caching with Redis
- Optimize database queries
- Use CDN for static assets
- Implement code splitting

### Infrastructure Level

- Use SSD storage
- Optimize Docker images
- Configure connection pooling
- Enable compression

## 📞 Support

For deployment issues:

1. Check the health endpoints
2. Review application logs
3. Run system health checks
4. Check monitoring dashboards
5. Contact the development team

## 🔐 Security Checklist

- [ ] SSL certificates configured and valid
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database access restricted
- [ ] Backup encryption enabled
- [ ] Monitoring alerts configured
- [ ] Log analysis automated
- [ ] Access controls implemented
- [ ] Regular security updates scheduled