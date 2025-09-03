# 📁 Videbimus AI Website - Project Structure

## Overview
This document outlines the organized structure of the Videbimus AI website project after cleanup and reorganization.

## Directory Structure

```
videbimus_ai_website/
│
├── 📂 src/                        # Source code (main application)
│   ├── app/                       # Next.js app directory
│   │   ├── (auth)/               # Authentication pages
│   │   ├── (main)/               # Main application pages
│   │   ├── admin/                # Admin dashboard
│   │   ├── api/                  # API routes
│   │   └── ...                   # Other app routes
│   │
│   ├── components/                # React components
│   │   ├── ui/                   # UI components
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components
│   │   └── sections/             # Page sections
│   │
│   ├── lib/                       # Core libraries
│   │   ├── ai/                   # AI integrations
│   │   ├── api/                  # API utilities
│   │   ├── auth/                 # Authentication
│   │   ├── db/                   # Database utilities
│   │   └── utils/                # Utility functions
│   │
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript definitions
│   ├── config/                    # App configuration
│   ├── constants/                 # Constants
│   ├── auth.ts                   # Auth configuration
│   └── middleware.ts             # Next.js middleware
│
├── 📂 public/                     # Static assets
│   ├── images/                   # Images
│   ├── icons/                    # Icons
│   └── fonts/                    # Fonts
│
├── 📂 prisma/                     # Database schema
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Database migrations
│
├── 📂 docs/                       # Documentation
│   ├── deployment/               # Deployment documentation
│   │   ├── 00_README_MASTER.md
│   │   ├── 01_CREDENTIALS.md
│   │   ├── 02_INFRASTRUCTURE.md
│   │   ├── 03_DEPLOYMENT_GUIDE.md
│   │   ├── 04_SSL_CERTIFICATE.md
│   │   ├── 05_MAINTENANCE.md
│   │   ├── 06_TROUBLESHOOTING.md
│   │   ├── 07_AI_AGENT_GUIDE.md
│   │   └── 08_EMERGENCY_RECOVERY.md
│   │
│   ├── guides/                   # User guides
│   │   ├── README.md
│   │   ├── CONTRIBUTING.md
│   │   └── ...
│   │
│   ├── prompts/                  # AI prompts
│   │   ├── ABOUT_US_AI_PROMPT.txt
│   │   ├── AI_REPLICATION_PROMPT.txt
│   │   ├── BUSINESS_BRAND_PROMPT.txt
│   │   └── BUSINESS_BRAND_PROMPT_V2.txt
│   │
│   └── architecture/             # Architecture docs
│       └── technical-architecture.md
│
├── 📂 scripts/                    # Scripts
│   ├── deployment/               # Deployment scripts
│   │   ├── complete_deployment.py
│   │   ├── setup_domain.py
│   │   ├── setup_ssl_https.py
│   │   ├── deploy_now.sh
│   │   ├── DEPLOY_TO_VPS.sh
│   │   └── ...
│   │
│   └── utilities/                # Utility scripts
│
├── 📂 config/                     # Configuration files
│   ├── secrets/                  # Sensitive files (gitignored)
│   │   ├── github_actions_key
│   │   ├── github_actions_key.pub
│   │   ├── ngrok_recovery_codes.txt
│   │   ├── ssh_config.txt
│   │   └── SECRETS_FOR_GITHUB.txt
│   │
│   └── nginx/                    # Nginx configs
│
├── 📂 deployment/                 # Deployment configurations
│   ├── hostinger/               # Hostinger specific
│   ├── cloudflare/              # Cloudflare configs
│   ├── docker/                  # Docker configs
│   └── ci-cd/                   # CI/CD pipelines
│
├── 📂 docker/                     # Docker setup
│   ├── nginx/                   # Nginx Docker config
│   ├── grafana/                 # Monitoring
│   └── prometheus/              # Metrics
│
├── 🔧 Configuration Files (Root)
│   ├── .env.example              # Environment template
│   ├── .env.local                # Local environment (gitignored)
│   ├── .gitignore                # Git ignore rules
│   ├── .eslintrc.json            # ESLint config
│   ├── next.config.js            # Next.js config
│   ├── package.json              # Dependencies
│   ├── tailwind.config.ts        # Tailwind CSS
│   ├── tsconfig.json             # TypeScript config
│   ├── docker-compose.yml        # Docker compose
│   ├── Dockerfile                # Production Docker
│   └── ecosystem.config.js       # PM2 config
│
├── 📂 .github/                    # GitHub Actions
│   └── workflows/                # CI/CD workflows
│
├── 📂 .next/                      # Build output (gitignored)
├── 📂 node_modules/               # Dependencies (gitignored)
└── 📂 .git/                       # Git repository

```

## Key Directories Explained

### `/src` - Source Code
The main application code. All TypeScript/JavaScript source files are here.

### `/docs` - Documentation
- **deployment/**: Production deployment guides and credentials
- **guides/**: Development and contribution guides
- **prompts/**: AI agent prompts for replication

### `/scripts` - Automation Scripts
- **deployment/**: Scripts for deploying to VPS
- **utilities/**: Helper scripts for development

### `/config` - Configuration
- **secrets/**: Sensitive files (SSH keys, passwords) - gitignored
- **nginx/**: Web server configurations

### `/deployment` - Infrastructure as Code
Templates and configurations for different hosting platforms.

## Important Files

### Root Configuration
- `.env.local` - Environment variables (never commit!)
- `next.config.js` - Next.js configuration
- `ecosystem.config.js` - PM2 process manager config
- `package.json` - Project dependencies

### Documentation
- `docs/deployment/01_CREDENTIALS.md` - All passwords and access info
- `docs/deployment/03_DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `docs/deployment/07_AI_AGENT_GUIDE.md` - Guide for AI assistants

## Security Notes

### Gitignored Sensitive Files
- `/config/secrets/` - All sensitive files
- `.env.local` - Environment variables
- `*.key`, `*.pem` - Private keys
- SSH keys and recovery codes

### Protected Information
Never commit:
- Database passwords
- API keys
- SSH private keys
- SSL certificates
- Authentication secrets

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

3. **Deploy to VPS**
   ```bash
   cd scripts/deployment
   ./deploy_now.sh
   ```

## Quick Access

- **VPS Access**: `ssh root@31.97.117.30`
- **Website**: https://videbimusai.com
- **GitHub**: https://github.com/victoropp/videbimus-ai-website
- **Documentation**: `/docs/deployment/00_README_MASTER.md`

## Maintenance

- Logs: Check PM2 logs on server
- Backups: Automated daily backups
- SSL: Auto-renewal via Let's Encrypt
- Monitoring: PM2 dashboard

---
*Project structure organized and documented: December 2024*