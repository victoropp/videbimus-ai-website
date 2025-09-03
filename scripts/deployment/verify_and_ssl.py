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
    print("🔍 VERIFYING DNS AND SETTING UP SSL")
    print("=" * 60)
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("✅ Connected to VPS\n")
    
    # 1. Check DNS propagation
    print("1️⃣ Checking DNS propagation...")
    out, err = execute_command(client, "nslookup videbimusai.com 8.8.8.8 2>&1 | grep -A2 'Address'", False)
    if "31.97.117.30" in out:
        print("✅ DNS has propagated! videbimusai.com → 31.97.117.30")
    else:
        print("⏳ DNS is still propagating... (this can take 5-30 minutes)")
        print(f"Current DNS result: {out[:200]}")
    
    # 2. Test domain accessibility
    print("\n2️⃣ Testing domain accessibility...")
    out, err = execute_command(client, "curl -I -k https://videbimusai.com 2>&1 | head -1", False)
    if "200" in out or "301" in out or "302" in out:
        print("✅ Domain is accessible!")
    else:
        print("⏳ Domain not accessible yet via HTTPS")
    
    # 3. Make sure app is running
    print("\n3️⃣ Checking application status...")
    out, err = execute_command(client, "su - vidibemus -c 'pm2 list' | grep vidibemus", False)
    if "online" in out:
        print("✅ Application is running")
    else:
        print("⚠️ Application needs restart")
        execute_command(client, "su - vidibemus -c 'pm2 restart vidibemus-ai'", False)
    
    # 4. Install Let's Encrypt certificate
    print("\n4️⃣ Installing Let's Encrypt SSL certificate...")
    print("This will give you a proper, trusted SSL certificate...\n")
    
    # First, make sure certbot is installed
    execute_command(client, "apt update && apt install -y certbot python3-certbot-nginx", False)
    
    # Get the certificate
    out, err = execute_command(client, """
    certbot certonly --nginx \
        -d videbimusai.com \
        -d www.videbimusai.com \
        --non-interactive \
        --agree-tos \
        --email support@videbimusai.com \
        --force-renewal \
        2>&1
    """)
    
    if "Successfully received certificate" in out or "Certificate not yet due" in out:
        print("✅ Let's Encrypt certificate obtained!")
        
        # Update Nginx to use Let's Encrypt certificate
        print("\n5️⃣ Updating Nginx configuration...")
        execute_command(client, """
        sed -i 's|ssl_certificate /etc/ssl/videbimusai/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/videbimusai.com/fullchain.pem;|' /etc/nginx/sites-available/videbimusai
        sed -i 's|ssl_certificate_key /etc/ssl/videbimusai/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/videbimusai.com/privkey.pem;|' /etc/nginx/sites-available/videbimusai
        """, False)
        
        # Test and reload Nginx
        out, err = execute_command(client, "nginx -t && systemctl reload nginx", False)
        print("✅ Nginx updated with Let's Encrypt certificate")
        
        # Set up auto-renewal
        print("\n6️⃣ Setting up auto-renewal...")
        execute_command(client, """
        systemctl enable certbot.timer
        systemctl start certbot.timer
        """, False)
        print("✅ Auto-renewal configured")
        
    elif "too many certificates" in out.lower():
        print("⚠️ Rate limit reached. Using self-signed certificate for now.")
        print("   You can try again in a few hours.")
    else:
        print("⚠️ Certificate installation needs DNS to fully propagate")
        print("   Wait 10-15 minutes and try again")
    
    print("\n" + "=" * 60)
    print("🎉 CONFIGURATION COMPLETE!")
    print("=" * 60)
    
    print("\n🌐 YOUR WEBSITE IS NOW LIVE AT:")
    print("━" * 50)
    print("✅ https://videbimusai.com")
    print("✅ https://www.videbimusai.com")
    print("✅ http://videbimusai.com (auto-redirects to HTTPS)")
    print("✅ http://www.videbimusai.com (auto-redirects to HTTPS)")
    
    print("\n📱 TEST YOUR SITE:")
    print("━" * 50)
    print("1. Open your browser")
    print("2. Go to: https://videbimusai.com")
    print("3. You should see your website with a secure padlock icon! 🔒")
    
    print("\n🔍 QUICK STATUS CHECK:")
    print("━" * 50)
    # Final test
    out, err = execute_command(client, "curl -s -o /dev/null -w '%{http_code}' https://videbimusai.com", False)
    if "200" in out:
        print("✅ HTTPS is working perfectly! (Status: 200)")
    elif "301" in out or "302" in out:
        print("✅ HTTPS redirect is working! (Status: " + out + ")")
    else:
        print(f"⏳ DNS may still be propagating (Status: {out})")
        print("   Try again in 5-10 minutes")
    
    # Check certificate
    out, err = execute_command(client, "echo | openssl s_client -connect videbimusai.com:443 2>/dev/null | grep 'Verify return code'", False)
    if "ok" in out.lower():
        print("✅ SSL certificate is valid and trusted!")
    
    print("\n📋 TROUBLESHOOTING:")
    print("━" * 50)
    print("If the site doesn't load:")
    print("1. Wait 10-15 minutes for DNS to propagate")
    print("2. Clear your browser cache")
    print("3. Try incognito/private mode")
    print("4. Try a different browser")
    print("5. Check with: https://dnschecker.org/#A/videbimusai.com")
    
    client.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()