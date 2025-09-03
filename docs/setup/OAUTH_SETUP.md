# OAuth Configuration Guide for Videbimus AI

## Quick Setup for Production Authentication

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure OAuth consent screen:
   - Application name: Videbimus AI
   - Support email: your-email@domain.com
   - Authorized domains: videbimus.ai (or your domain)
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Videbimus AI Web Client
   - Authorized JavaScript origins:
     - http://localhost:3000 (for development)
     - http://localhost:3003 (current dev port)
     - https://videbimus.ai (production)
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
     - http://localhost:3003/api/auth/callback/google
     - https://videbimus.ai/api/auth/callback/google
7. Copy the Client ID and Client Secret

### 2. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: Videbimus AI
   - Homepage URL: https://videbimus.ai
   - Authorization callback URL: 
     - For dev: http://localhost:3003/api/auth/callback/github
     - For production: https://videbimus.ai/api/auth/callback/github
4. Copy the Client ID and Client Secret

### 3. Update Environment Variables

Replace the placeholder values in `.env.local`:

```env
# Google OAuth (REQUIRED - Replace with your real credentials)
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-google-client-secret

# GitHub OAuth (REQUIRED - Replace with your real credentials)
GITHUB_CLIENT_ID=your-actual-github-client-id
GITHUB_CLIENT_SECRET=your-actual-github-client-secret

# NextAuth Configuration (IMPORTANT - Update for production)
NEXTAUTH_URL=http://localhost:3003  # Change to https://videbimus.ai in production
NEXTAUTH_SECRET=b4c29fda65999f4a2e43f94b69a04d23de83309581543ab51ca543c69aa24e23497a365ca5df8ccb777d9512eb692853d62f85a59d379aa94e4cbf15339104ee
```

### 4. Optional: Microsoft/Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. New registration:
   - Name: Videbimus AI
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: Web - http://localhost:3003/api/auth/callback/azure-ad
4. Copy Application (client) ID
5. Go to Certificates & secrets → New client secret
6. Copy the secret value

### 5. Optional: Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application → Name: Videbimus AI
3. OAuth2 → Add Redirect:
   - http://localhost:3003/api/auth/callback/discord
   - https://videbimus.ai/api/auth/callback/discord
4. Copy Client ID and Client Secret

## Quick Test Credentials (Development Only)

For immediate testing without OAuth setup, use the credentials authentication:

- **Consultant**: consultant@test.com / consultant123
- **Client**: client@test.com / client123

## Production Checklist

- [ ] Set up Google OAuth with real credentials
- [ ] Set up GitHub OAuth with real credentials  
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Generate new NEXTAUTH_SECRET for production
- [ ] Set NODE_ENV=production
- [ ] Update authorized domains and redirect URIs
- [ ] Test all authentication methods
- [ ] Remove test users from production database

## Security Notes

1. **NEVER commit real OAuth credentials to git**
2. **Always use HTTPS in production**
3. **Rotate NEXTAUTH_SECRET regularly**
4. **Keep OAuth apps updated with current redirect URIs**
5. **Monitor OAuth app usage for suspicious activity**

## Support

For OAuth issues, check:
- Google: https://console.cloud.google.com/apis/credentials
- GitHub: https://github.com/settings/developers
- NextAuth Docs: https://next-auth.js.org/providers