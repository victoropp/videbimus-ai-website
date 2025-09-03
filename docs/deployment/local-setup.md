# Local Development Setup Guide

## 📋 Prerequisites

- **Node.js**: v18.17+ or v20+
- **npm**: v9+ (comes with Node.js)
- **Docker Desktop**: For PostgreSQL database
- **Git**: For version control
- **Code Editor**: VS Code recommended

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/videbimus-ai.git
cd videbimus-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start PostgreSQL with Docker
docker run --name vidibemus-postgres \
  -e POSTGRES_USER=vidibemus \
  -e POSTGRES_PASSWORD=secure_password_change_in_production \
  -e POSTGRES_DB=vidibemus_ai \
  -p 5432:5432 \
  -d postgres:15

# 5. Run database migrations
npx prisma migrate dev

# 6. Create test users (development only)
curl http://localhost:3000/api/auth/test-setup

# 7. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
videbimus-ai/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── collaboration/   # Consultation suite
│   │   └── (marketing)/     # Public pages
│   ├── components/          # React components
│   │   ├── collaboration/   # Video, chat, whiteboard
│   │   ├── layout/          # Header, footer
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utilities and configs
│   └── styles/              # Global styles
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.local` with these variables:

```env
# Database (Required)
DATABASE_URL="postgresql://vidibemus:secure_password@localhost:5432/vidibemus_ai"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-secret"

# Features (Optional)
ENABLE_COLLABORATION=true
ENABLE_AI_CHAT=true
DEBUG_MODE=true
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate encryption keys
openssl rand -base64 32
```

## 🗄️ Database Setup

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name vidibemus-postgres \
  -e POSTGRES_USER=vidibemus \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=vidibemus_ai \
  -p 5432:5432 \
  -v vidibemus_data:/var/lib/postgresql/data \
  -d postgres:15

# Verify connection
docker exec -it vidibemus-postgres psql -U vidibemus -d vidibemus_ai
```

### Option 2: Local PostgreSQL

1. Install PostgreSQL 15+
2. Create database and user:
```sql
CREATE USER vidibemus WITH PASSWORD 'secure_password';
CREATE DATABASE vidibemus_ai OWNER vidibemus;
GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;
```

### Database Migrations

```bash
# Create migration from schema changes
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

## 🧪 Test Data Setup

### Create Test Users

```bash
# Run test setup endpoint
curl http://localhost:3000/api/auth/test-setup
```

This creates:
- **Consultant**: consultant@test.com / consultant123
- **Client**: client@test.com / client123
- **Demo Room**: test-room-001

### Manual Database Seeding

```bash
# Run seed script
npx prisma db seed
```

## 🏃 Running the Application

### Development Mode

```bash
# Start with hot reload
npm run dev

# Start on specific port
PORT=3001 npm run dev

# Start with debug logging
DEBUG=* npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle size
npm run analyze
```

## 🔍 Common Development Tasks

### Clear Cache

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Prisma cache
npx prisma generate
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Database Tasks

```bash
# View database schema
npx prisma studio

# Generate Prisma client
npx prisma generate

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## 🐛 Debugging

### Enable Debug Mode

```env
# In .env.local
DEBUG_MODE=true
NEXTAUTH_DEBUG=true
PRISMA_LOG=query,info,warn,error
```

### Chrome DevTools

1. Start with inspect flag:
```bash
NODE_OPTIONS='--inspect' npm run dev
```

2. Open chrome://inspect
3. Click "inspect" under Remote Target

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## 🔒 Security Best Practices

### Local Development Security

1. **Never commit `.env.local`**
2. **Use strong passwords even locally**
3. **Keep Docker containers updated**
4. **Don't expose database ports publicly**
5. **Use HTTPS with ngrok for testing webhooks**

### Secure Local HTTPS

```bash
# Install mkcert
npm install -g mkcert

# Create local certificates
mkcert -install
mkcert localhost

# Update package.json
"scripts": {
  "dev:https": "next dev --experimental-https"
}
```

## 📊 Performance Monitoring

### Enable Metrics

```bash
# Start with performance monitoring
ANALYZE=true npm run dev
```

### Browser Performance

1. Open Chrome DevTools
2. Go to Performance tab
3. Record while using the app
4. Analyze bottlenecks

## 🎯 IDE Setup

### VS Code Extensions

Required:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

Recommended:
- GitLens
- Error Lens
- Auto Rename Tag
- ES7+ React snippets

### VS Code Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 [PID]  # Mac/Linux
taskkill /PID [PID] /F  # Windows
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart container
docker restart vidibemus-postgres

# Check logs
docker logs vidibemus-postgres
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com)