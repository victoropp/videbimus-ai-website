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
    stdin, stdout, stderr = client.exec_command(command, timeout=60)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if print_output and out:
        print(out)
    return out, err

try:
    print("🌐 SETTING UP DOMAIN: videbimusai.com")
    print("=" * 60)
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("✅ Connected to VPS\n")
    
    # 1. Update Nginx configuration for the domain
    print("1️⃣ Configuring Nginx for videbimusai.com...")
    execute_command(client, """cat > /etc/nginx/sites-available/videbimusai << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name videbimusai.com www.videbimusai.com;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_connect_timeout 90;
        proxy_send_timeout 90;
        proxy_read_timeout 90;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Redirect non-www to www
server {
    listen 80;
    listen [::]:80;
    server_name videbimusai.com;
    return 301 http://www.videbimusai.com$request_uri;
}
EOF""", False)
    
    # Enable the site
    execute_command(client, "ln -sf /etc/nginx/sites-available/videbimusai /etc/nginx/sites-enabled/", False)
    
    # Test Nginx configuration
    out, err = execute_command(client, "nginx -t 2>&1", False)
    if "successful" in out or "ok" in out:
        print("✅ Nginx configuration valid")
    else:
        print(f"Nginx test output: {out}")
    
    # Reload Nginx
    execute_command(client, "systemctl reload nginx", False)
    print("✅ Nginx reloaded\n")
    
    # 2. Install Certbot if not installed
    print("2️⃣ Checking Certbot installation...")
    out, err = execute_command(client, "which certbot", False)
    if not out.strip():
        print("Installing Certbot...")
        execute_command(client, "apt update && apt install -y certbot python3-certbot-nginx", False)
    print("✅ Certbot ready\n")
    
    # 3. Update hosts file for testing
    print("3️⃣ Updating hosts file for local testing...")
    execute_command(client, """
    grep -q "videbimusai.com" /etc/hosts || echo "127.0.0.1 videbimusai.com www.videbimusai.com" >> /etc/hosts
    """, False)
    print("✅ Hosts file updated\n")
    
    print("=" * 60)
    print("✅ DOMAIN CONFIGURATION COMPLETE!")
    print("=" * 60)
    
    print("\n📋 CLOUDFLARE DNS SETUP REQUIRED:")
    print("━" * 50)
    print("\n1. Log into Cloudflare: https://dash.cloudflare.com")
    print("2. Select your domain: videbimusai.com")
    print("3. Go to DNS settings")
    print("4. Add these DNS records:\n")
    
    print("   Type  | Name | Content        | Proxy Status")
    print("   ------|------|----------------|-------------")
    print("   A     | @    | 31.97.117.30   | Proxied (🟠)")
    print("   A     | www  | 31.97.117.30   | Proxied (🟠)")
    print("   CNAME | *    | videbimusai.com| DNS only (⚫)")
    
    print("\n5. Make sure Proxy is ENABLED (orange cloud) for DDoS protection")
    print("6. SSL/TLS settings: Set to 'Flexible' initially")
    
    print("\n⏰ DNS propagation takes 5-30 minutes")
    
    print("\n📋 AFTER DNS PROPAGATES:")
    print("━" * 50)
    print("\nRun this command on your VPS to get SSL certificate:")
    print("\n   certbot --nginx -d videbimusai.com -d www.videbimusai.com --non-interactive --agree-tos --email support@videbimusai.com")
    
    print("\n🔧 TEST YOUR DOMAIN:")
    print("━" * 50)
    print("Once DNS is set up, your website will be accessible at:")
    print("   ✅ http://videbimusai.com")
    print("   ✅ http://www.videbimusai.com")
    print("   ✅ https://videbimusai.com (after SSL setup)")
    print("   ✅ https://www.videbimusai.com (after SSL setup)")
    
    print("\n📊 CURRENT STATUS:")
    print("━" * 50)
    # Check if site is accessible
    out, err = execute_command(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000", False)
    print(f"   Local server: {'✅ Running' if '200' in out else '❌ Not responding'} (HTTP {out})")
    
    # Check PM2
    out, err = execute_command(client, "su - vidibemus -c 'pm2 list --no-color' | grep vidibemus-ai", False)
    if "online" in out:
        print(f"   PM2 status: ✅ Online")
    else:
        print(f"   PM2 status: ⚠️ Check status")
    
    # Check Nginx
    out, err = execute_command(client, "systemctl is-active nginx", False)
    print(f"   Nginx: {'✅ Active' if 'active' in out else '❌ Inactive'}")
    
    client.close()
    
    print("\n🎯 IMMEDIATE ACTION REQUIRED:")
    print("━" * 50)
    print("1. Go to Cloudflare and add the DNS records above")
    print("2. Wait 5-30 minutes for DNS to propagate")
    print("3. Test by visiting http://videbimusai.com")
    print("4. Once working, run the certbot command for SSL")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()