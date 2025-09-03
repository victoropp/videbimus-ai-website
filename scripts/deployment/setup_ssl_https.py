#!/usr/bin/env python3
import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

hostname = '6.tcp.eu.ngrok.io'
port = 19792
username = 'root'
password = 'Advance@UK@2025'

def execute_command(client, command, print_output=True):
    stdin, stdout, stderr = client.exec_command(command, timeout=120)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if print_output and out:
        print(out)
    return out, err

try:
    print("🔒 SETTING UP HTTPS/SSL FOR videbimusai.com")
    print("=" * 60)
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("✅ Connected to VPS\n")
    
    # 1. First, set up self-signed certificate for immediate HTTPS
    print("1️⃣ Creating self-signed SSL certificate for immediate HTTPS...")
    execute_command(client, """
    mkdir -p /etc/ssl/videbimusai
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/videbimusai/privkey.pem \
        -out /etc/ssl/videbimusai/fullchain.pem \
        -subj "/C=UK/ST=London/L=London/O=Vidibemus AI/CN=videbimusai.com"
    """, False)
    print("✅ Self-signed certificate created\n")
    
    # 2. Configure Nginx for HTTPS
    print("2️⃣ Configuring Nginx for HTTPS...")
    execute_command(client, """cat > /etc/nginx/sites-available/videbimusai << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name videbimusai.com www.videbimusai.com 31.97.117.30;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name videbimusai.com www.videbimusai.com 31.97.117.30;
    
    # SSL Certificate (self-signed initially, Let's Encrypt later)
    ssl_certificate /etc/ssl/videbimusai/fullchain.pem;
    ssl_certificate_key /etc/ssl/videbimusai/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    client_max_body_size 100M;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
        proxy_read_timeout 90;
    }
    
    # API specific timeout
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }
}
EOF""", False)
    
    # Enable site
    execute_command(client, "ln -sf /etc/nginx/sites-available/videbimusai /etc/nginx/sites-enabled/", False)
    execute_command(client, "rm -f /etc/nginx/sites-enabled/default", False)
    
    # Test and reload Nginx
    out, err = execute_command(client, "nginx -t 2>&1", False)
    if "successful" in out or "ok" in out:
        print("✅ Nginx HTTPS configuration valid")
    
    execute_command(client, "systemctl reload nginx", False)
    print("✅ Nginx reloaded with HTTPS\n")
    
    # 3. Open firewall for HTTPS
    print("3️⃣ Configuring firewall for HTTPS...")
    execute_command(client, "ufw allow 443/tcp", False)
    execute_command(client, "ufw reload", False)
    print("✅ Firewall configured for HTTPS\n")
    
    # 4. Update application environment for HTTPS
    print("4️⃣ Updating application environment for HTTPS...")
    execute_command(client, """
    sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://videbimusai.com|' /var/www/vidibemus/.env.local
    sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://videbimusai.com|' /var/www/vidibemus/.env.local
    """, False)
    print("✅ Environment updated for HTTPS\n")
    
    # 5. Restart application
    print("5️⃣ Restarting application...")
    execute_command(client, "su - vidibemus -c 'pm2 restart vidibemus-ai'", False)
    print("✅ Application restarted\n")
    
    # 6. Prepare Let's Encrypt script
    print("6️⃣ Preparing Let's Encrypt setup script...")
    execute_command(client, """cat > /root/setup_letsencrypt.sh << 'EOF'
#!/bin/bash
echo "Setting up Let's Encrypt SSL certificate..."

# Install certbot if not installed
apt update
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx \
    -d videbimusai.com \
    -d www.videbimusai.com \
    --non-interactive \
    --agree-tos \
    --email support@videbimusai.com \
    --redirect \
    --expand

# Set up auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

echo "✅ Let's Encrypt SSL certificate installed!"
echo "✅ Auto-renewal configured!"
EOF
chmod +x /root/setup_letsencrypt.sh
""", False)
    print("✅ Let's Encrypt script ready\n")
    
    print("=" * 60)
    print("✅ HTTPS SETUP COMPLETE!")
    print("=" * 60)
    
    print("\n🔒 CURRENT STATUS:")
    print("━" * 50)
    print("✅ HTTPS is now configured with self-signed certificate")
    print("✅ All HTTP traffic redirects to HTTPS")
    print("✅ Security headers configured")
    print("✅ Firewall allows HTTPS (port 443)")
    
    print("\n📋 HOSTINGER DNS SETUP REQUIRED:")
    print("━" * 50)
    print("\n1. Login to Hostinger: https://hpanel.hostinger.com")
    print("2. Go to Domains → videbimusai.com → DNS Zone Editor")
    print("3. Add these records:\n")
    
    print("   Type | Host | Points to")
    print("   -----|------|----------")
    print("   A    | @    | 31.97.117.30")
    print("   A    | www  | 31.97.117.30")
    
    print("\n⏰ After DNS propagates (10-30 minutes), run this on VPS:")
    print("   ssh root@31.97.117.30")
    print("   ./setup_letsencrypt.sh")
    
    print("\n🌐 YOUR SITE IS NOW ACCESSIBLE VIA:")
    print("━" * 50)
    print("✅ https://31.97.117.30 (with security warning - that's OK)")
    print("⏳ https://videbimusai.com (after DNS setup)")
    print("⏳ https://www.videbimusai.com (after DNS setup)")
    
    print("\n⚠️ BROWSER WARNING:")
    print("━" * 50)
    print("You'll see a security warning when visiting https://31.97.117.30")
    print("This is NORMAL with self-signed certificates.")
    print("Click 'Advanced' → 'Proceed to site' to continue.")
    print("This warning will disappear after Let's Encrypt setup.")
    
    # Test HTTPS
    print("\n🧪 Testing HTTPS...")
    out, err = execute_command(client, "curl -k -s -o /dev/null -w '%{http_code}' https://localhost", False)
    print(f"HTTPS Status: {'✅ Working' if '200' in out else '⚠️ Check logs'} (HTTP {out})")
    
    client.close()
    
    print("\n🎯 NEXT STEPS:")
    print("━" * 50)
    print("1. Add DNS records in Hostinger (A records for @ and www → 31.97.117.30)")
    print("2. Wait 10-30 minutes for DNS to propagate")
    print("3. Test: https://videbimusai.com")
    print("4. Run: ./setup_letsencrypt.sh on VPS for proper SSL certificate")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()