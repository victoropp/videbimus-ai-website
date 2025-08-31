# Cloudflare Configuration for Vidibemus AI

## 1. DNS Settings

### A Records
```
Type: A
Name: @
IPv4 address: YOUR_HOSTINGER_VPS_IP
Proxy status: Proxied (Orange cloud ON)

Type: A  
Name: www
IPv4 address: YOUR_HOSTINGER_VPS_IP
Proxy status: Proxied (Orange cloud ON)
```

### MX Records (for email)
```
Type: MX
Name: @
Mail server: mail.vidibemus.ai
Priority: 10

Type: A
Name: mail
IPv4 address: YOUR_HOSTINGER_VPS_IP
Proxy status: DNS only (Grey cloud)
```

### TXT Records
```
Type: TXT
Name: @
Content: "v=spf1 ip4:YOUR_HOSTINGER_VPS_IP include:_spf.google.com ~all"

Type: TXT
Name: _dmarc
Content: "v=DMARC1; p=quarantine; rua=mailto:admin@vidibemus.ai"
```

## 2. SSL/TLS Settings

- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: ON
- **Automatic HTTPS Rewrites**: ON
- **Minimum TLS Version**: 1.2

## 3. Security Settings

### Firewall Rules
Create these rules in order:

1. **Block Bad Bots**
   - Expression: `(cf.client.bot) and not (cf.verified_bot)`
   - Action: Block

2. **Challenge Suspicious Countries** (optional)
   - Expression: `(ip.geoip.country in {"CN" "RU" "KP"})`
   - Action: Managed Challenge

3. **Rate Limiting for API**
   - Expression: `(http.request.uri.path contains "/api/")`
   - Action: Rate limiting (100 requests per minute)

### Security Level
- Set to: Medium

### Bot Fight Mode
- Enable: ON

## 4. Performance Settings

### Caching
- **Caching Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Always Online**: ON

### Optimization
- **Auto Minify**: 
  - JavaScript: ON
  - CSS: ON
  - HTML: ON
- **Brotli**: ON
- **Rocket Loader**: OFF (can interfere with Next.js)
- **Mirage**: ON (for images)
- **Polish**: Lossy (for images)

## 5. Page Rules

### Rule 1: Cache Everything for Static Assets
- URL: `*vidibemus.ai/_next/static/*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year

### Rule 2: Bypass Cache for API
- URL: `*vidibemus.ai/api/*`
- Settings:
  - Cache Level: Bypass
  - Disable Performance

### Rule 3: Cache HTML Pages
- URL: `*vidibemus.ai/*`
- Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 1 hour

## 6. Workers (Optional)

Create a Worker for additional security:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Block requests without proper headers
  if (!request.headers.get('User-Agent')) {
    return new Response('Forbidden', { status: 403 })
  }

  // Add security headers
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN')
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('X-XSS-Protection', '1; mode=block')
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

## 7. Analytics & Monitoring

- Enable **Web Analytics** (free)
- Set up **Email Alerts** for:
  - DDoS attacks
  - Origin errors
  - SSL certificate expiration

## 8. API Configuration

For API protection, create these settings:

### Rate Limiting Rules
```
Path: /api/ai/chat
Rate: 10 requests per minute per IP

Path: /api/auth/*
Rate: 5 requests per minute per IP
```

### Custom Error Pages
Upload custom 404, 500, and maintenance pages.

## Important Notes

1. **Free Plan Limitations**:
   - 3 Page Rules
   - No Image Resizing
   - Limited DDoS protection

2. **Pro Plan Benefits** ($20/month):
   - 20 Page Rules
   - Image Resizing
   - WAF (Web Application Firewall)
   - Better DDoS protection

3. **DNS Propagation**:
   - Changes can take up to 48 hours to propagate globally
   - Use https://dnschecker.org to verify

## Setup Commands

After DNS is configured, run on your VPS:

```bash
# Test DNS resolution
dig vidibemus.ai
dig www.vidibemus.ai

# Verify Cloudflare is active
curl -I https://vidibemus.ai | grep "cf-ray"
```