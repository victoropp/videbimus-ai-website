# 🔒 SSL Certificate Documentation

## Current SSL Configuration

### Certificate Provider
- **Provider**: Let's Encrypt
- **Type**: Free, automated SSL/TLS certificate
- **Validation**: Domain Validation (DV)
- **Encryption**: 2048-bit RSA

### Certificate Details
- **Common Name**: videbimusai.com
- **Alternative Names**: www.videbimusai.com
- **Issue Date**: August 31, 2025
- **Expiry Date**: November 29, 2025
- **Auto-renewal**: Enabled

### Certificate Locations
```
/etc/letsencrypt/live/videbimusai.com/
├── cert.pem       # Certificate file
├── chain.pem      # Certificate chain
├── fullchain.pem  # Certificate + chain (used by Nginx)
├── privkey.pem    # Private key (keep secure!)
└── README         # Certbot documentation
```

## What is Let's Encrypt?

Let's Encrypt is a free, automated, and open Certificate Authority (CA) that provides SSL/TLS certificates for HTTPS encryption. It's trusted by all major browsers and operating systems.

### Key Features:
- ✅ **Free**: No cost for certificates
- ✅ **Automated**: Automatic issuance and renewal
- ✅ **Secure**: Industry-standard encryption
- ✅ **Trusted**: Recognized by all browsers
- ✅ **Open**: Transparent and open-source

## How SSL Works on Your Site

### 1. Certificate Chain
```
Root CA (DST Root CA X3 / ISRG Root X1)
    ↓
Intermediate CA (Let's Encrypt R3)
    ↓
Your Certificate (videbimusai.com)
```

### 2. HTTPS Flow
1. User visits https://videbimusai.com
2. Server presents SSL certificate
3. Browser verifies certificate chain
4. Encrypted connection established
5. All data transmitted securely

### 3. Security Headers
```nginx
# Current security headers in Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## Certificate Management

### Manual Certificate Renewal
```bash
# Test renewal (dry run)
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal

# Renew specific domain
certbot certonly --nginx -d videbimusai.com -d www.videbimusai.com
```

### Automatic Renewal
The certificate automatically renews via systemd timer:

```bash
# Check timer status
systemctl status certbot.timer

# View renewal schedule
systemctl list-timers | grep certbot

# Manual timer trigger
systemctl start certbot.timer
```

### Renewal Process
1. Certbot runs twice daily (via systemd timer)
2. Checks if certificate expires within 30 days
3. If yes, requests new certificate
4. Updates certificate files
5. Reloads Nginx automatically

## Nginx SSL Configuration

### Current SSL Settings
```nginx
# SSL Protocols (secure versions only)
ssl_protocols TLSv1.2 TLSv1.3;

# Cipher suites (strong encryption only)
ssl_ciphers HIGH:!aNULL:!MD5;

# Prefer server cipher order
ssl_prefer_server_ciphers on;

# SSL session caching
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# OCSP stapling (certificate verification)
ssl_stapling on;
ssl_stapling_verify on;
```

## Verification Commands

### Check Certificate Details
```bash
# View certificate information
openssl x509 -in /etc/letsencrypt/live/videbimusai.com/cert.pem -text -noout

# Check expiry date
openssl x509 -in /etc/letsencrypt/live/videbimusai.com/cert.pem -noout -dates

# Verify certificate chain
openssl verify -CAfile /etc/letsencrypt/live/videbimusai.com/chain.pem \
    /etc/letsencrypt/live/videbimusai.com/cert.pem
```

### Test SSL Configuration
```bash
# Test from server
curl -I https://videbimusai.com

# Test SSL handshake
openssl s_client -connect videbimusai.com:443 -servername videbimusai.com

# Check SSL rating (external)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=videbimusai.com
```

## Troubleshooting SSL Issues

### Common Problems and Solutions

#### 1. Certificate Not Trusted
**Symptom**: Browser shows security warning
**Solution**:
```bash
# Ensure using Let's Encrypt certificate
ls -la /etc/letsencrypt/live/videbimusai.com/
# Restart Nginx
systemctl restart nginx
```

#### 2. Certificate Expired
**Symptom**: SSL_ERROR_EXPIRED_CERT_ALERT
**Solution**:
```bash
# Force renewal
certbot renew --force-renewal
systemctl reload nginx
```

#### 3. Mixed Content Warning
**Symptom**: Padlock with warning in browser
**Solution**:
- Ensure all resources use HTTPS
- Check for HTTP links in HTML/CSS/JS
- Update .env.local to use https:// URLs

#### 4. Renewal Failure
**Symptom**: Certificate doesn't auto-renew
**Solution**:
```bash
# Check timer
systemctl status certbot.timer
# Check logs
journalctl -u certbot
# Manual renewal
certbot renew
```

## Security Best Practices

### 1. Private Key Security
```bash
# Ensure correct permissions
chmod 600 /etc/letsencrypt/live/videbimusai.com/privkey.pem
chown root:root /etc/letsencrypt/live/videbimusai.com/privkey.pem
```

### 2. Backup Certificates
```bash
# Backup Let's Encrypt directory
tar -czf letsencrypt-backup.tar.gz /etc/letsencrypt/
```

### 3. Monitor Expiry
```bash
# Create monitoring script
cat > /usr/local/bin/check-ssl.sh << 'EOF'
#!/bin/bash
DAYS_LEFT=$((($(date -d "$(openssl x509 -in /etc/letsencrypt/live/videbimusai.com/cert.pem -noout -dates | grep notAfter | cut -d= -f2)" +%s) - $(date +%s)) / 86400))
if [ $DAYS_LEFT -lt 30 ]; then
    echo "SSL certificate expires in $DAYS_LEFT days!"
    # Send alert email or notification
fi
EOF
chmod +x /usr/local/bin/check-ssl.sh
```

## Migration to New Certificate

If you need to switch from Let's Encrypt to another provider:

### 1. Obtain New Certificate
- Purchase/obtain certificate from new provider
- Download certificate files

### 2. Install New Certificate
```bash
# Create directory for new cert
mkdir -p /etc/ssl/videbimusai/

# Copy new certificate files
cp new-cert.crt /etc/ssl/videbimusai/fullchain.pem
cp new-key.key /etc/ssl/videbimusai/privkey.pem

# Update Nginx configuration
nano /etc/nginx/sites-available/videbimusai
# Change paths to new certificate location

# Test and reload
nginx -t
systemctl reload nginx
```

### 3. Disable Let's Encrypt Renewal
```bash
systemctl stop certbot.timer
systemctl disable certbot.timer
```

## Encrypted Storage of SSL Information

### Encryption Method
For storing sensitive SSL information, use GPG encryption:

```bash
# Encrypt sensitive data
echo "Sensitive SSL data" | gpg --cipher-algo AES256 --symmetric > ssl-data.gpg

# Decrypt when needed
gpg --decrypt ssl-data.gpg
```

### What to Encrypt
- Private keys (if backing up)
- Certificate passwords
- API keys for certificate providers
- DNS API credentials

### Secure Storage Locations
- Local encrypted backup: `/root/ssl-backups/`
- Remote backup: Secure cloud storage
- Password manager: For certificate passwords

## SSL Monitoring and Alerts

### Setup Monitoring
```bash
# Add to crontab
crontab -e
# Add: 0 0 * * * /usr/local/bin/check-ssl.sh
```

### External Monitoring Services
- UptimeRobot: Monitor HTTPS availability
- SSL Labs: Regular SSL configuration checks
- Let's Encrypt Expiry Bot: Email notifications

## Recovery Procedures

### If Certificate is Lost
1. Revoke old certificate (if compromised)
2. Generate new certificate:
```bash
certbot certonly --nginx -d videbimusai.com -d www.videbimusai.com --force-renewal
```

### If Private Key is Compromised
1. Immediately revoke certificate:
```bash
certbot revoke --cert-path /etc/letsencrypt/live/videbimusai.com/cert.pem
```
2. Generate new certificate
3. Update all configurations
4. Investigate security breach

---
*SSL Configuration Last Updated: December 2024*
*Certificate Expires: November 29, 2025*
*Auto-renewal: ENABLED*