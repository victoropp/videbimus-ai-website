# Videbimus AI - Client Consultation Suite

## 🚀 Project Overview

**Videbimus AI** is a comprehensive AI and Data Science consulting platform featuring a fully-functional Client Consultation Suite with real-time video conferencing, collaborative whiteboarding, document sharing, and chat capabilities.

### 🎯 Key Features

- **Video Conferencing**: Powered by Jitsi Meet (no API key required)
- **Collaborative Whiteboard**: Real-time drawing with Fabric.js
- **Document Management**: Upload, share, and manage consultation documents
- **Real-time Chat**: Persistent messaging with file attachments
- **Authentication**: OAuth (Google, GitHub) + credentials
- **Role-based Access**: Client, Consultant, Admin roles
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📋 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up database
docker run --name vidibemus-postgres -e POSTGRES_PASSWORD=secure_password -p 5432:5432 -d postgres:15

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# 4. Run migrations
npx prisma migrate dev

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
videbimus-ai/
├── docs/                    # Comprehensive documentation
│   ├── architecture/       # System design docs
│   ├── api/               # API documentation
│   ├── deployment/        # Setup guides
│   ├── guides/            # User guides
│   └── troubleshooting/   # Common issues
├── src/
│   ├── app/               # Next.js 15 app router
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   └── styles/           # Global styles
├── prisma/               # Database schema
├── public/              # Static assets
└── tests/              # Test files
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Video**: Jitsi Meet (iframe)
- **Canvas**: Fabric.js 5.3.0
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5.22.0
- **Auth**: NextAuth.js v5
- **Validation**: Zod

### Infrastructure
- **Container**: Docker
- **Deployment**: Vercel/AWS ready
- **CDN**: Cloudflare ready
- **Monitoring**: Sentry ready

## 🔐 Authentication Setup

### Test Credentials (Development)

```
Consultant Account:
Email: consultant@test.com
Password: consultant123

Client Account:
Email: client@test.com
Password: client123
```

### OAuth Configuration

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed OAuth setup instructions.

## 📚 Documentation

### For Developers
- [Architecture Overview](./docs/architecture/overview.md)
- [API Documentation](./docs/api/consultation-rooms.md)
- [Local Setup Guide](./docs/deployment/local-setup.md)
- [Troubleshooting](./docs/troubleshooting/common-errors.md)

### For Users
- [User Guide](./docs/guides/user-guide.md)
- [Getting Started](./docs/guides/user-guide.md#getting-started)

### For Administrators
- [Production Deployment](./docs/deployment/production.md)
- [Admin Guide](./docs/guides/admin-guide.md)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Test API endpoints
node test-api.js

# Test consultation workflow
node test-consultation-workflow.js
```

## 📦 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your domain (https://yourdomain.com)
- `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)

## 🎯 5-Day Implementation Summary

This project was implemented in 5 days:

### Day 1: Foundation
- Fixed Fabric.js v6 compatibility issues (downgraded to v5.3.0)
- Integrated Jitsi Meet for video conferencing
- Set up basic project structure

### Day 2-3: Backend Development
- Created PostgreSQL database schema (8 tables)
- Built REST APIs for consultation rooms
- Implemented authentication system
- Created message, document, and whiteboard APIs

### Day 4: Frontend Integration
- Connected frontend to real backend APIs
- Removed all mock data
- Fixed authentication flow
- Implemented real-time features

### Day 5: Testing & Documentation
- Created test users and data
- Fixed production authentication
- Comprehensive documentation
- End-to-end testing

## 🐛 Known Issues & Solutions

### Common Issues

1. **401 Authentication Errors**
   - Solution: Clear cookies and re-authenticate
   - Check NEXTAUTH_URL matches current URL

2. **Database Connection Failed**
   - Solution: Ensure Docker is running
   - Verify DATABASE_URL in .env.local

3. **Port Already in Use**
   - Solution: Change port or kill existing process
   - Use `PORT=3001 npm run dev`

See [Troubleshooting Guide](./docs/troubleshooting/common-errors.md) for more.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

- **Documentation**: [/docs](./docs)
- **Issues**: GitHub Issues
- **Email**: support@videbimus.ai
- **Website**: [videbimus.ai](https://videbimus.ai)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Jitsi team for free video conferencing
- Fabric.js for canvas functionality
- shadcn for beautiful UI components

---

**Built with ❤️ by Videbimus AI Team**

*Transforming Business with AI & Data Science*