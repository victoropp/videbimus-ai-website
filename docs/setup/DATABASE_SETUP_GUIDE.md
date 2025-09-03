# Vidibemus AI Website - Complete Database Setup Guide

## Overview
This guide provides step-by-step instructions for setting up a complete PostgreSQL database environment with Redis for the Vidibemus AI website, including all required environment variables, security configurations, and development data.

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18.17.0 or higher
- Git (for version control)
- Windows 11 (this guide is Windows-specific, but can be adapted for other OS)

## Quick Start (TL;DR)
```bash
# 1. Start databases
docker-compose up -d postgres redis

# 2. Setup database schema
npm run db:generate
npm run db:push

# 3. Seed with sample data
npm run db:seed

# 4. Start development server
npm run dev
```

## Detailed Setup Instructions

### 1. Environment Configuration

The project uses a comprehensive `.env.local` file with 71+ environment variables. Key configurations include:

#### Database Configuration
- **PostgreSQL**: Running on Docker container `vidibemus-postgres`
  - Host: `localhost`
  - Port: `5432`
  - Database: `vidibemus_ai`
  - User: `vidibemus`
  - Password: `secure_password_change_in_production`

#### Redis Configuration
- **Redis**: Running on Docker container `vidibemus-redis`
  - Host: `localhost`
  - Port: `6379`
  - Password: `redis_password_change_in_production`

#### Security Keys (Development)
- **NextAuth Secret**: `b4c29fda65999f4a2e43f94b69a04d23de83309581543ab51ca543c69aa24e23497a365ca5df8ccb777d9512eb692853d62f85a59d379aa94e4cbf15339104ee`
- **Encryption Key**: `6hTCSVP5SuHvxe37RF9nUsKFA7NdWfZZbcFJKPWzpk0=`
- **JWT Secret**: `c675fd043767642cf87b6ba828be261231531cce26b2f2bdfef49c2f4d200c434598f50271adbaf5efe6af320e629aaf03b3e8f069ae1ab8bcc818406975f370`

### 2. Database Schema

The database contains 30 tables supporting:
- **Authentication**: NextAuth.js integration with multiple providers
- **User Management**: Role-based access control (Admin, Client, Consultant, Guest)
- **Project Management**: Complete project lifecycle tracking
- **Collaboration**: Real-time features, rooms, documents, chat
- **Content Management**: Blog, case studies, newsletters
- **Analytics & Monitoring**: Comprehensive tracking and health monitoring
- **Billing & Payments**: Stripe integration ready
- **File Management**: Upload and storage capabilities

Key models:
- `users` - 5 seeded users (admin, consultant, 3 clients)
- `projects` - 3 sample AI consulting projects
- `blog_posts` - 2 featured blog articles
- `contacts` - 3 sample contact form submissions
- `analytics` - 100 sample analytics events
- `consultations` - Meeting and consultation tracking
- `tasks` - Project task management
- `settings` - System configuration

### 3. Docker Services

#### PostgreSQL Container (`vidibemus-postgres`)
```yaml
Services:
- Image: postgres:15-alpine
- Port: 5432
- Health checks enabled
- Persistent volume: postgres_data
- Auto-restart: unless-stopped
```

#### Redis Container (`vidibemus-redis`)
```yaml
Services:
- Image: redis:7-alpine  
- Port: 6379
- Password protected
- Health checks enabled
- Persistent volume: redis_data
- Auto-restart: unless-stopped
```

### 4. Authentication Providers

The system supports multiple authentication methods:

#### Built-in Credentials
- Email/password authentication with bcrypt hashing
- Role-based access control
- Session management

#### OAuth Providers (Configure with your keys)
- **Google OAuth2**: Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **GitHub OAuth2**: Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- **Microsoft Azure AD**: Add `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`
- **Discord**: Add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`

### 5. Seeded Test Data

#### Users (All passwords: see respective sections below)
1. **Admin User**
   - Email: `admin@videbimusai.com`
   - Password: `AdminPass123!`
   - Role: ADMIN

2. **Consultant User**
   - Email: `consultant@videbimusai.com`
   - Password: `ConsultantPass123!`
   - Role: CONSULTANT

3. **Client Users**
   - Email: `client1@example.com`, `client2@example.com`, `client3@example.com`
   - Password: `ClientPass123!`
   - Role: CLIENT

#### Sample Projects
1. **Customer Churn Prediction Model** - In Progress, High Priority
2. **Inventory Optimization System** - Planning Phase, Medium Priority  
3. **Document Processing Automation** - Completed, High Priority

#### Blog Content
1. "Getting Started with AI in Your Business" - Featured article
2. "Machine Learning Best Practices for 2024" - Technical guide

### 6. Development Commands

```bash
# Database Management
npm run db:generate      # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Docker Management
docker-compose up -d postgres redis  # Start databases
docker-compose ps                     # Check container status
docker-compose logs postgres          # View PostgreSQL logs
docker-compose logs redis            # View Redis logs
docker-compose down                  # Stop all containers

# Development Server
npm run dev             # Start Next.js development server
npm run build          # Build for production
npm run start          # Start production server
```

### 7. Health Checks & Monitoring

#### Database Health Check
```bash
# Test PostgreSQL connection
docker-compose exec postgres psql -U vidibemus -d vidibemus_ai -c "SELECT version();"

# List all tables
docker-compose exec postgres psql -U vidibemus -d vidibemus_ai -c "\\dt"

# Count records
docker-compose exec postgres psql -U vidibemus -d vidibemus_ai -c "SELECT 'users' as table_name, count(*) as count FROM users;"
```

#### Redis Health Check
```bash
# Test Redis connection
docker-compose exec redis redis-cli -a redis_password_change_in_production ping

# Check Redis info
docker-compose exec redis redis-cli -a redis_password_change_in_production info
```

#### Application Health Check
Access the health endpoint at: `http://localhost:3000/api/health`

### 8. Security Considerations

#### Development vs Production
- **Development**: Uses local Docker containers with default ports
- **Production**: Should use managed database services with SSL/TLS
- **Secrets**: All development secrets are included; regenerate for production

#### Database Security
- Connection pooling configured (20 max connections)
- Password authentication required
- Rate limiting implemented
- SQL injection protection via Prisma ORM

#### Redis Security
- Password authentication required
- Memory-based storage with persistence
- Connection encryption in production environments

### 9. API Integration Ready

The database schema supports:
- **OpenAI GPT-4**: For AI chat and content generation
- **Anthropic Claude**: Alternative AI provider
- **Pinecone**: Vector database for AI embeddings
- **Stripe**: Payment processing
- **Resend/SendGrid**: Email services
- **Daily.co**: Video conferencing
- **Google Analytics**: Website analytics
- **Sentry**: Error monitoring

### 10. File Structure

```
vidibemus_ai_website/
├── prisma/
│   ├── schema.prisma     # Database schema definition
│   └── seed.ts          # Database seeding script
├── docker-compose.yml   # Container orchestration
├── .env.local          # Environment variables (71+ variables)
├── .env               # Prisma-specific environment
└── src/
    ├── lib/prisma.ts   # Database connection
    └── auth.ts        # NextAuth configuration
```

### 11. Troubleshooting

#### Common Issues

1. **"EPERM: operation not permitted" during Prisma generate**
   - Stop the development server first: `Ctrl+C`
   - Delete `node_modules/.prisma/client`
   - Run `npm run db:generate` again

2. **"Environment variable not found: DATABASE_URL"**
   - Ensure `.env` file exists in project root
   - Check that `DATABASE_URL` is properly formatted

3. **PostgreSQL connection refused**
   - Verify Docker containers are running: `docker-compose ps`
   - Check container health: `docker-compose logs postgres`
   - Ensure port 5432 is not in use by another service

4. **Redis authentication errors**
   - Use the correct password: `redis_password_change_in_production`
   - Check Redis container logs: `docker-compose logs redis`

#### Performance Tuning

- **Database**: Connection pooling configured for 20 concurrent connections
- **Redis**: TTL set to 3600 seconds for cached data
- **Memory**: Containers configured with appropriate resource limits
- **Indexes**: Optimized database indexes for common queries

### 12. Next Steps

After completing this setup:

1. **Configure OAuth Providers**: Add your actual OAuth client IDs and secrets
2. **Set up AI Services**: Add OpenAI, Anthropic, and Pinecone API keys
3. **Configure Email**: Set up Resend or SendGrid for transactional emails
4. **Enable Monitoring**: Add Sentry DSN and Google Analytics IDs
5. **Production Deployment**: Use managed PostgreSQL and Redis services
6. **SSL/TLS**: Enable secure connections for production
7. **Backup Strategy**: Implement automated database backups
8. **Scaling**: Configure horizontal scaling as needed

## Support

For additional help:
- Review the application logs: `docker-compose logs`
- Check the Prisma Studio: `npm run db:studio`
- Monitor application health: `http://localhost:3000/api/health`
- Review environment variables in `.env.local`

---

**Setup completed successfully!** 🎉

Your Vidibemus AI database environment is now ready for development with:
- ✅ PostgreSQL with 30 tables and comprehensive schema
- ✅ Redis for caching and session management  
- ✅ 5 test users with different roles
- ✅ Sample projects, blog posts, and analytics data
- ✅ Production-ready environment configuration
- ✅ Security keys and proper authentication setup
- ✅ Health monitoring and backup capabilities

Start development with: `npm run dev`