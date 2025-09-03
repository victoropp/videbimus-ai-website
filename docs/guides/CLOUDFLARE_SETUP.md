# Cloudflare Configuration Guide for Vidibemus AI

## Step 1: Add Your Domain to Cloudflare

1. Sign up/Login at https://cloudflare.com
2. Click **Add a Site**
3. Enter: `vidibemus.ai`
4. Select a plan (Free plan is sufficient to start)
5. Cloudflare will scan existing DNS records

## Step 2: Update DNS Records

### Required DNS Records:

```
Type | Name | Content              | Proxy Status | TTL
-----|------|---------------------|--------------|-----
A    | @    | YOUR_VPS_IP         | Proxied ☁️    | Auto
A    | www  | YOUR_VPS_IP         | Proxied ☁️    | Auto
A    | mail | YOUR_VPS_IP         | DNS only 🔘  | Auto
MX   | @    | mail.vidibemus.ai   | DNS only     | Auto (Priority: 10)
TXT  | @    | v=spf1 ip4:YOUR_VPS_IP -all | DNS only | Auto
```

### Email-related Records:

```
# SPF Record
TXT  | @         | "v=spf1 ip4:YOUR_VPS_IP include:_spf.google.com ~all"

# DKIM Record (get from email setup)
TXT  | mail._domainkey | "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"

# DMARC Record
TXT  | _dmarc    | "v=DMARC1; p=quarantine; rua=mailto:admin@videbimusai.com"
```

## Step 3: Update Nameservers

1. Go to your domain registrar (where you bought the domain)
2. Update nameservers to Cloudflare's:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
3. Wait for propagation (5 minutes to 24 hours)

## Step 4: Configure SSL/TLS

1. Navigate to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### Edge Certificates:
- Cloudflare provides free Universal SSL
- Coverage: `vidibemus.ai` and `*.vidibemus.ai`
- Auto-renews

## Step 5: Speed Optimization

### Caching
1. Go to **Caching** → **Configuration**
2. Set **Caching Level**: Standard
3. Set **Browser Cache TTL**: 4 hours
4. Enable **Always Online**

### Auto Minify
1. Go to **Speed** → **Optimization**
2. Enable Auto Minify for:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### Brotli Compression
1. Enable Brotli compression
2. This reduces file sizes by up to 20%

## Step 6: Security Settings

### Firewall Rules
1. Go to **Security** → **WAF**
2. Create custom rules:

```javascript
// Block countries (if needed)
(ip.geoip.country in {"CN" "RU" "KP"})
Action: Block

// Rate limiting
(http.request.uri.path contains "/api/")
Action: Challenge (Rate: 100 requests/minute)

// Block bad bots
(cf.client.bot) and not (cf.verified_bot)
Action: Block
```

### DDoS Protection
1. Go to **Security** → **DDoS**
2. Sensitivity Level: High
3. Enable **I'm Under Attack Mode** if needed

### Bot Management
1. Enable **Bot Fight Mode**
2. Configure **Super Bot Fight Mode** (if available)

## Step 7: Page Rules (3 free)

### Rule 1: API Caching
```
URL: vidibemus.ai/api/*
Settings:
- Cache Level: Bypass
- Security Level: High
```

### Rule 2: Static Assets
```
URL: vidibemus.ai/static/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

### Rule 3: Admin Protection
```
URL: vidibemus.ai/admin/*
Settings:
- Security Level: High
- Cache Level: Bypass
- Disable Apps
```

## Step 8: Performance Settings

### Polish
1. Go to **Speed** → **Optimization** → **Polish**
2. Enable WebP conversion
3. Set to Lossy compression

### Mirage
1. Enable Mirage for mobile image optimization

### Rocket Loader
1. Enable Rocket Loader for JavaScript optimization

## Step 9: Analytics & Monitoring

### Web Analytics
1. Go to **Analytics** → **Web Analytics**
2. Add the tracking script to your site (automatic with proxy)

### Real User Monitoring
1. Enable RUM for performance insights

## Step 10: API Configuration

### Get Zone ID
1. Go to Overview page
2. Find Zone ID in right sidebar
3. Copy for GitHub Secrets

### Create API Token
1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use template: **Edit zone DNS**
4. Permissions needed:
   - Zone:Cache Purge:Edit
   - Zone:DNS:Edit
   - Zone:Page Rules:Edit
5. Zone Resources: Include → Specific zone → vidibemus.ai

## Step 11: Advanced Configuration

### Workers (Optional)
Create edge functions for:
- A/B testing
- Authentication at edge
- Custom routing

### Stream (Optional)
For video content delivery

### Images (Optional)
For image optimization and resizing

## Step 12: Monitoring & Alerts

### Set Up Notifications
1. Go to **Notifications**
2. Configure alerts for:
   - DDoS attacks
   - Origin errors
   - SSL certificate issues
   - Weekly analytics

## Verification Checklist

- [ ] DNS propagation complete (check with: `nslookup vidibemus.ai`)
- [ ] SSL certificate active (green padlock in browser)
- [ ] Website loads with Cloudflare (check headers)
- [ ] Email records configured (MX, SPF, DKIM, DMARC)
- [ ] Caching working (check CF-Cache-Status header)
- [ ] Security rules active
- [ ] Analytics tracking

## Testing Commands

```bash
# Check DNS
dig vidibemus.ai
nslookup vidibemus.ai

# Check Cloudflare headers
curl -I https://vidibemus.ai

# Check SSL
openssl s_client -connect vidibemus.ai:443 -servername vidibemus.ai

# Test caching
curl -I https://vidibemus.ai/static/image.png
# Look for: CF-Cache-Status: HIT
```

## Troubleshooting

### Site not loading
1. Check DNS propagation
2. Verify nameservers updated
3. Check SSL/TLS setting (should be Full strict)

### Too many redirects
1. Set SSL/TLS to Full (strict)
2. Disable **Always Use HTTPS** temporarily
3. Check origin server SSL

### 521 Error
1. Origin server is down
2. Check Hostinger VPS status
3. Whitelist Cloudflare IPs on server

### 522 Error
1. Connection timeout
2. Check firewall rules
3. Increase timeout settings

## Cloudflare IPs to Whitelist

Add these to your server firewall:
```
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
104.16.0.0/13
104.24.0.0/14
108.162.192.0/18
131.0.72.0/22
141.101.64.0/18
162.158.0.0/15
172.64.0.0/13
173.245.48.0/20
188.114.96.0/20
190.93.240.0/20
197.234.240.0/22
198.41.128.0/17
```

## Support

- Cloudflare Support: https://support.cloudflare.com
- Vidibemus AI Support: support@videbimusai.com
- UK: +44 7442 852675
- Ghana: +233 248769377