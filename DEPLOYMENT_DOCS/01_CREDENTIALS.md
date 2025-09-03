# 🔐 Credentials and Access Information

⚠️ **SECURITY WARNING**: This file contains sensitive information. Keep it secure and never commit to public repositories.

## 1. Hostinger Account
- **URL**: https://hpanel.hostinger.com
- **Username**: [Your Hostinger email]
- **VPS Name**: srv985923.hstgr.cloud
- **Plan**: KVM VPS

## 2. VPS Server Access

### Root Access
```bash
ssh root@31.97.117.30
```
- **IP Address**: 31.97.117.30
- **Port**: 22
- **Username**: root
- **Password**: Advance@UK@2025
- **Hostname**: srv985923.hstgr.cloud

### Application User
```bash
su - vidibemus
```
- **Username**: vidibemus
- **Home Directory**: /home/vidibemus
- **App Directory**: /var/www/vidibemus

## 3. Database Credentials

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: vidibemus_ai
- **Username**: vidibemus
- **Password**: fb671b96bdd3463085f9dfd645af44d4
- **Connection String**: 
```
postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
```

### Redis
- **Host**: localhost
- **Port**: 6379
- **Password**: 1405675dc0d791fb76726d61c8959938
- **Connection String**:
```
redis://:1405675dc0d791fb76726d61c8959938@localhost:6379
```

## 4. Application Secrets

### NextAuth
- **NEXTAUTH_SECRET**: CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
- **NEXTAUTH_URL**: https://videbimusai.com

### Security Keys
- **JWT_SECRET**: 3d8f72a9b4c5e6f1827394a0b5c6d7e8
- **ENCRYPTION_KEY**: f47ac10b58cc4372a5670e02b2c3d479

## 5. GitHub Repository
- **URL**: https://github.com/victoropp/videbimus-ai-website
- **Branch**: master
- **Username**: victoropp

## 6. SSH Keys

### GitHub Actions Deploy Key (Private)
Location: `github_actions_key`
```
-----BEGIN OPENSSH PRIVATE KEY-----
[Stored separately - do not paste in public docs]
-----END OPENSSH PRIVATE KEY-----
```

### GitHub Actions Deploy Key (Public)
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDK1YCgJkQkNbPOJ/pco+QgmQa1Ii4KKeAC7oeaIiMW8G5xVHrUraFQCwNqVQpDqdTwWdCsEoWZVWQxDKJFx9pJB+99IGb6X0KnwqnKLBzQlckDGwGjXLxGZVb5R3q6Ku5kRZJGeLhYyHdQb6i3OXZFpcsGFKsIrXl9SDqvdvjnSN2PYLlplxHOqVmDZ9W6UR6PwSBenGaWlGjQhPRVz9Ae5UWrPiHgPgaep0dWkRGbV/WlBP5GJOyDoSBL6XQAfvXHJoGNu1G2Av2+L+0AiG8kTBmxG3EJOuVC3S5DBiQTxUNZ3aaWx+zE49oA8VpMOe7z2zb5zKnXJvKmIrFu+4WLpjHKD5VYtPlLVk+IjOMwTmDWmQIz+fWIWxNFmhMBJWfkW72R3N8VnoomAzg3T5wFR/X9P5Yg7+xO5Fj1cqoVVn5SIPk7PxBRNzS1+lPH8yeXsWhiU8/raKVAfBT6voWgkn/qy5vqUTJCdz7r+vaxSQFFBOoTSgRnRZQa3VgHzQz2lXzQcdaFtRbEVMM7WXqDJZSCBYXOk1NMAJswc3DGGp3aP0VxL5H0HvLJ49E/ztJSDy9+M+lxXdkCJNTzpoU5V0bSQbxtupFY8uy6j3nweB6TCkd8P4L4TbEgOJGcONWQN8l1jPovpQi2/bB6YAy3dcH4xt8LQvKXoJDhBEeM4Q== github-actions@videbimusai.com
```

## 7. Domain Information
- **Domain**: videbimusai.com
- **Registrar**: Hostinger
- **DNS Manager**: Hostinger
- **SSL Email**: support@videbimusai.com

## 8. API Keys (To Be Added)

### OpenAI
- **API Key**: [TO BE ADDED]

### Anthropic
- **API Key**: [TO BE ADDED]

### Stripe
- **Public Key**: [TO BE ADDED]
- **Secret Key**: [TO BE ADDED]
- **Webhook Secret**: [TO BE ADDED]

### Other AI Providers
- **Hugging Face API Key**: [TO BE ADDED]
- **Groq API Key**: [TO BE ADDED]
- **Cohere API Key**: [TO BE ADDED]
- **Together API Key**: [TO BE ADDED]

### Pinecone (Vector Database)
- **API Key**: [TO BE ADDED]
- **Environment**: [TO BE ADDED]
- **Index Name**: [TO BE ADDED]

## 9. PM2 Process Manager
- **App Name**: vidibemus-ai
- **Config File**: /var/www/vidibemus/ecosystem.config.js
- **Logs Directory**: /var/log/vidibemus/

## 10. File Locations
- **Application**: /var/www/vidibemus
- **Environment File**: /var/www/vidibemus/.env.local
- **Nginx Config**: /etc/nginx/sites-available/videbimusai
- **SSL Certificates**: /etc/letsencrypt/live/videbimusai.com/
- **PM2 Config**: /var/www/vidibemus/ecosystem.config.js

---
⚠️ **REMINDER**: Store this file securely and never share publicly!