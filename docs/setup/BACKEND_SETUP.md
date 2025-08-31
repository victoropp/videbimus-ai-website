# Vidibemus AI Backend Setup Guide

This guide will help you set up the complete backend infrastructure for the Vidibemus AI website.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis server (optional, for caching)
- Git

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment example file:

```bash
cp .env.example .env
```

Configure your `.env` file with the following required variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vidibemus_ai_db?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@vidibemus.ai"

# Application Settings
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@vidibemus.ai"
```

### 3. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Push database schema:
```bash
npm run db:push
```

Seed the database with sample data:
```bash
npm run db:seed
```

### 4. OAuth Setup (Optional)

For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

For GitHub OAuth:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Add the credentials to your `.env` file:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 5. Email Service Setup

#### Using Resend (Recommended)

1. Sign up at [Resend](https://resend.com/)
2. Get your API key
3. Add to `.env`:
```env
RESEND_API_KEY="re_your_api_key_here"
```

#### Alternative: Using SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get your API key
3. Add to `.env`:
```env
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
```

### 6. Start Development Server

```bash
npm run dev
```

Your backend will be available at `http://localhost:3000`

## Database Schema Overview

The backend includes the following main entities:

### User Management
- **Users**: Authentication and user profiles
- **Accounts**: OAuth provider accounts
- **Sessions**: User sessions

### Business Logic
- **Projects**: Client projects and AI implementations
- **Tasks**: Project tasks and milestones
- **Consultations**: Scheduled meetings and consultations
- **Contacts**: Contact form submissions
- **Newsletter**: Email subscriptions

### Content Management
- **BlogPosts**: Blog articles and case studies
- **Categories**: Blog post categories

### System
- **Analytics**: User behavior tracking
- **Settings**: Application configuration
- **RateLimit**: API rate limiting data
- **Files**: Uploaded documents and images

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out
- `GET /api/auth/session` - Get current session

### tRPC API Routes
All business logic is handled through tRPC at `/api/trpc`:

#### Auth Router
- `auth.register` - User registration
- `auth.getProfile` - Get user profile
- `auth.updateProfile` - Update user profile
- `auth.changePassword` - Change password

#### Contact Router
- `contact.create` - Submit contact form
- `contact.getAll` - Get all contacts (admin)
- `contact.getById` - Get contact by ID (admin)
- `contact.update` - Update contact status (admin)

#### Newsletter Router
- `newsletter.subscribe` - Subscribe to newsletter
- `newsletter.unsubscribe` - Unsubscribe from newsletter
- `newsletter.getAll` - Get all subscriptions (admin)

#### Projects Router
- `projects.create` - Create new project
- `projects.getAll` - Get user projects
- `projects.getById` - Get project details
- `projects.update` - Update project
- `projects.createTask` - Create project task
- `projects.updateTask` - Update task

### File Upload
- `POST /api/upload` - Upload files
- `GET /api/upload` - List uploaded files
- `DELETE /api/upload` - Delete files

### Analytics
- `POST /api/analytics` - Track events
- `GET /api/analytics` - Get analytics data (admin)

## Default Users (After Seeding)

### Admin User
- **Email**: admin@vidibemus.ai (or your ADMIN_EMAIL)
- **Password**: AdminPass123!
- **Role**: Admin
- **Access**: Full system access

### Consultant User
- **Email**: consultant@vidibemus.ai
- **Password**: ConsultantPass123!
- **Role**: Consultant
- **Access**: Project management, consultations

### Demo Clients
- **Email**: client1@example.com, client2@example.com, client3@example.com
- **Password**: ClientPass123!
- **Role**: Client
- **Access**: Own projects and consultations

## Security Features

### Authentication
- NextAuth.js v5 with multiple providers
- JWT tokens with secure sessions
- Role-based access control (RBAC)
- Password hashing with bcryptjs

### API Security
- Rate limiting per endpoint
- CSRF protection
- Input validation with Zod
- SQL injection prevention with Prisma
- File upload validation

### Data Protection
- Encryption for sensitive data
- Secure headers (CSP, HSTS, etc.)
- Origin validation
- Request fingerprinting

## Rate Limits

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Contact Form**: 3 requests per hour
- **Newsletter**: 5 requests per hour

## File Upload

- **Max Size**: 10MB (configurable)
- **Allowed Types**: Images, PDFs, Documents
- **Storage**: Local filesystem (`/public/uploads`)
- **Security**: Filename sanitization, type validation

## Email Templates

Pre-built email templates for:
- Contact form notifications
- Newsletter welcome emails
- Password reset emails
- Project update notifications

## Analytics

Built-in analytics tracking:
- Page views
- User actions
- Device/browser information
- Geographic data
- Custom events

## Monitoring and Logging

- Request logging
- Error tracking
- Security event logging
- Rate limit monitoring

## Database Migrations

Create new migration:
```bash
npm run db:migrate
```

Reset database:
```bash
npx prisma migrate reset
```

View database:
```bash
npm run db:studio
```

## Production Deployment

### Environment Variables
Set all production environment variables:
- Use strong secrets for NEXTAUTH_SECRET
- Configure production database URL
- Set proper CORS origins
- Configure email service API keys

### Database
- Use managed PostgreSQL service (AWS RDS, Neon, etc.)
- Enable connection pooling
- Set up automated backups
- Configure SSL connections

### Security
- Enable HTTPS
- Set secure cookie settings
- Configure proper CORS policies
- Set up monitoring and alerting

### Performance
- Enable Redis for caching
- Configure CDN for file uploads
- Set up database read replicas
- Enable compression

## Troubleshooting

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npm run db:generate

# Check database connection
npx prisma db pull
```

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify OAuth credentials
- Check callback URLs
- Review session configuration

### Email Issues
- Verify API keys
- Check sender domain configuration
- Test with development mode
- Review email service logs

### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Review allowed file types
- Check disk space

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment configuration
3. Check application logs
4. Verify all dependencies are installed

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation