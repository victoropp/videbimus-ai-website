# Setup Documentation

## Quick Start Guides

- [AI Setup Guide](AI_SETUP_GUIDE.md) - Configure AI providers and models
- [Backend Setup](BACKEND_SETUP.md) - Set up the backend infrastructure
- [Database Setup](DATABASE_SETUP_GUIDE.md) - PostgreSQL and Prisma configuration
- [Hugging Face Token Setup](HUGGINGFACE_TOKEN_SETUP.md) - Configure HF authentication
- [Detailed HF Token Guide](HF_TOKEN_DETAILED_GUIDE.md) - In-depth token configuration
- [Working HF Models](WORKING_HF_MODELS.md) - List of tested and working models

## Prerequisites

Before starting, ensure you have:
- Node.js 20+
- PostgreSQL 15+
- Redis Server
- Valid API keys for AI providers

## Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure required variables:
- Database connection string
- AI provider API keys
- Redis connection
- Authentication secrets

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

## Development Server

```bash
npm run dev
```

Access the application at http://localhost:3000