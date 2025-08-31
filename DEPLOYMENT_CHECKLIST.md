# 🚀 Deployment Checklist for Vidibemus AI

## ✅ Completed Tasks
- [x] Code pushed to GitHub repository
- [x] SSH keys generated for GitHub Actions
- [x] Secure passwords and tokens generated
- [x] Deployment documentation created
- [x] All secrets prepared in SECRETS_FOR_GITHUB.txt

## 📋 Immediate Next Steps

### 1. Add GitHub Secrets (5 minutes)
Go to: https://github.com/victoropp/videbimus-ai-website/settings/secrets/actions

**Essential Secrets to Add First:**
- [ ] HOST = [Your Hostinger VPS IP]
- [ ] USERNAME = root
- [ ] PORT = 22
- [ ] SSH_KEY = [Copy from SECRETS_FOR_GITHUB.txt]
- [ ] DATABASE_URL = postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
- [ ] NEXTAUTH_SECRET = CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
- [ ] NEXTAUTH_URL = https://vidibemus.ai

### 2. Hostinger VPS Setup (30 minutes)
**What you need:**
- Your VPS IP address from Hostinger
- Root password or SSH access

**Steps:**
1. [ ] SSH into your VPS: `ssh root@YOUR_VPS_IP`
2. [ ] Clone repository: `git clone https://github.com/victoropp/videbimus-ai-website.git /var/www/vidibemus`
3. [ ] Run setup script: `cd /var/www/vidibemus && chmod +x deployment/hostinger/setup-vps.sh && ./deployment/hostinger/setup-vps.sh`
4. [ ] Configure environment: `cp .env.production.template .env.production && nano .env.production`
5. [ ] Add GitHub Actions public key to VPS:
   ```bash
   echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDKPWWCfEf1yhKSnXjBS22/+BA+Rd8n1u3PVH3oe+Pxlvt2CKkVj9Ahm4cYQQPAQprnKeBVePvMESYQrR28THDy7HQBJ9ndVIqK30bn3RCR36b1E9Xihhvm3bH+e9ubQrLtw5EiYk0TJwwcJHob4VLRLlr/8e2cBNejGOofCKCZntzKQuf0074t2KMBuTq0luu+K5wDlqQFOchyV6roRtUbk0rGzxMJUMYVY0Ud5/LbTs9r8sqCA+i6BZxjUJ+qaBMABEK7LpEh8/dQq5XAqaiaje+l9HHPSn5lkG+S8Q9oqL2qOIW+BE839ujaeZ2xLyZoyNCAkCP73RcBpUgZwDImRuWhTBTuoXxpTbeoPuChFS2ffqvcKbpF7j9UIFgOmqL5z/Q6MpDNolT0MoE7x0klTOXFyT8slNvDF6Ksia6u6TTmG8g+ReODUXj56V7vUEHkJHvBrRxLyOJ+0ZimxgWroOCVxxtLtC8273uK2Rj/Yl+5iFkCbY4DLfNksVQ8lhCHK7+q93R9r67kAj9okF22lP/0iA3AsykJJLH/JeObuGkfyOtNkS5+OwPmkNMeZiwLk6WtdRURDXt1+Dd6e19365ELeVzMc8kIs+sCKOMXwGTcKY/2Q1lZC8WSK+luWYU3cnaMpzFLMAFQ0k3DvT7iGKeeHMIxQfcVYgzlo0YKYQ== github-actions@vidibemus.ai" >> ~/.ssh/authorized_keys
   ```

### 3. Database Setup (10 minutes)
On your VPS:
```bash
sudo -u postgres psql
CREATE USER vidibemus WITH PASSWORD 'fb671b96bdd3463085f9dfd645af44d4';
CREATE DATABASE vidibemus_ai OWNER vidibemus;
GRANT ALL PRIVILEGES ON DATABASE vidibemus_ai TO vidibemus;
\q
```

Then run migrations:
```bash
cd /var/www/vidibemus
npx prisma generate
npx prisma migrate deploy
```

### 4. Cloudflare Setup (15 minutes)
1. [ ] Add domain to Cloudflare
2. [ ] Update nameservers at your domain registrar
3. [ ] Configure DNS records:
   - A record: @ → YOUR_VPS_IP (Proxied)
   - A record: www → YOUR_VPS_IP (Proxied)
   - A record: mail → YOUR_VPS_IP (DNS only)
4. [ ] Set SSL/TLS to "Full (strict)"
5. [ ] Get Zone ID and API token for GitHub secrets

### 5. SSL Certificate (5 minutes)
On your VPS:
```bash
sudo certbot --nginx -d vidibemus.ai -d www.vidibemus.ai --non-interactive --agree-tos --email admin@vidibemus.ai
```

### 6. Deploy Application (5 minutes)
```bash
cd /var/www/vidibemus
npm ci --production=false
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root
```

### 7. Test Deployment
- [ ] Visit https://vidibemus.ai
- [ ] Check API health: https://vidibemus.ai/api/health
- [ ] Test AI chat functionality
- [ ] Verify SSL certificate (green padlock)

## 📝 Important Information

### Generated Passwords (SAVE THESE!)
- **Database Password**: fb671b96bdd3463085f9dfd645af44d4
- **Redis Password**: 1405675dc0d791fb76726d61c8959938
- **NEXTAUTH_SECRET**: CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
- **JWT_SECRET**: VjQDnqR6Y0r2fENSaa6t+aD8vh42OjdlQd4eFh7RJrY=

### Files Created
- `github_actions_key` - Private SSH key (for GitHub secrets)
- `github_actions_key.pub` - Public SSH key (for VPS)
- `SECRETS_FOR_GITHUB.txt` - All secrets ready to copy
- `GITHUB_SECRETS_SETUP.md` - Detailed secrets guide
- `HOSTINGER_DEPLOYMENT.md` - VPS setup instructions
- `CLOUDFLARE_SETUP.md` - CDN configuration

### Support Contacts
- UK: +44 7442 852675 (Call or WhatsApp)
- Ghana: +233 248769377 (Call or WhatsApp)
- Email: support@vidibemus.ai

## 🎯 Success Criteria
- [ ] Website accessible at https://vidibemus.ai
- [ ] SSL certificate active (green padlock)
- [ ] API health check returns 200 OK
- [ ] GitHub Actions can deploy automatically
- [ ] Email server configured and working
- [ ] Monitoring alerts configured

## ⏱️ Estimated Total Time: 60-90 minutes

Start with adding GitHub secrets, then proceed with VPS setup!