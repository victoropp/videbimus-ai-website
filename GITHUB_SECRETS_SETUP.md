# GitHub Secrets Configuration Guide

## Required GitHub Secrets for CI/CD Pipeline

Navigate to: **Settings → Secrets and variables → Actions** in your repository

### 1. VPS Connection Secrets

```yaml
HOST: Your_Hostinger_VPS_IP_Address
USERNAME: root_or_your_vps_username
SSH_KEY: Your_Private_SSH_Key (see instructions below)
PORT: 22
```

#### How to generate SSH Key:
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions@vidibemus.ai"
# Save as: github_actions_key (no passphrase)

# Copy the private key content
cat github_actions_key

# Add public key to VPS
ssh-copy-id -i github_actions_key.pub username@your_vps_ip
```

### 2. Database Secrets

```yaml
DATABASE_URL: postgresql://vidibemus:YOUR_PASSWORD@localhost:5432/vidibemus_ai
DIRECT_URL: postgresql://vidibemus:YOUR_PASSWORD@localhost:5432/vidibemus_ai
```

### 3. Authentication Secrets

```yaml
NEXTAUTH_SECRET: generate_32_char_random_string
NEXTAUTH_URL: https://vidibemus.ai
JWT_SECRET: generate_another_32_char_string
```

#### Generate secrets:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### 4. AI Provider API Keys

```yaml
OPENAI_API_KEY: sk-proj-xxxxxxxxxxxxx
ANTHROPIC_API_KEY: sk-ant-xxxxxxxxxxxxx
HUGGINGFACE_API_KEY: hf_xxxxxxxxxxxxx
GROQ_API_KEY: gsk_xxxxxxxxxxxxx
COHERE_API_KEY: xxxxxxxxxxxxx
TOGETHER_API_KEY: xxxxxxxxxxxxx
```

### 5. Pinecone Vector Database

```yaml
PINECONE_API_KEY: xxxxxxxxxxxxx
PINECONE_ENVIRONMENT: us-east-1-aws
PINECONE_INDEX_NAME: vidibemus-knowledge
```

### 6. Stripe Payment Processing

```yaml
STRIPE_SECRET_KEY: sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY: pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET: whsec_xxxxxxxxxxxxx
```

### 7. Redis Configuration

```yaml
REDIS_URL: redis://localhost:6379
REDIS_PASSWORD: your_redis_password
```

### 8. Email Configuration

```yaml
EMAIL_FROM: noreply@vidibemus.ai
EMAIL_SERVER_HOST: localhost
EMAIL_SERVER_PORT: 587
EMAIL_SERVER_USER: noreply@vidibemus.ai
EMAIL_SERVER_PASSWORD: your_email_password
```

### 9. Cloudflare Configuration

```yaml
CLOUDFLARE_ZONE: your_zone_id
CLOUDFLARE_TOKEN: your_api_token
```

#### Get Cloudflare credentials:
1. Log in to Cloudflare Dashboard
2. Select your domain
3. Find Zone ID on the right sidebar
4. Go to My Profile → API Tokens
5. Create token with Zone:Cache Purge permissions

### 10. Monitoring & Notifications

```yaml
SLACK_WEBHOOK: https://hooks.slack.com/services/xxxxx
SENTRY_DSN: https://xxxxx@sentry.io/xxxxx
```

## How to Add Secrets to GitHub

1. Go to your repository: https://github.com/victoropp/videbimus-ai-website
2. Click **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with:
   - Name: Exactly as shown above (e.g., `DATABASE_URL`)
   - Value: Your actual value
6. Click **Add secret**

## Priority Order for Setup

### Essential (Required for deployment):
1. HOST, USERNAME, SSH_KEY, PORT
2. DATABASE_URL, DIRECT_URL
3. NEXTAUTH_SECRET, NEXTAUTH_URL

### Important (Required for full functionality):
4. OPENAI_API_KEY (or at least one AI provider)
5. STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
6. REDIS_URL

### Optional (Can be added later):
7. Other AI provider keys
8. CLOUDFLARE_ZONE, CLOUDFLARE_TOKEN
9. SLACK_WEBHOOK
10. SENTRY_DSN

## Verify Secrets

After adding all secrets, trigger a test deployment:

```bash
# Push a small change to trigger workflow
git commit --allow-empty -m "Test CI/CD pipeline"
git push
```

Check Actions tab to see if the workflow runs successfully.

## Security Notes

- Never commit actual secrets to the repository
- Rotate secrets regularly
- Use different secrets for production vs development
- Limit secret access to necessary workflows only
- Enable secret scanning in repository settings