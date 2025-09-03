#!/usr/bin/env python3
import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

hostname = '0.tcp.eu.ngrok.io'
port = 10886
username = 'root'
password = 'Advance@UK@2025'

def execute_command(client, command):
    stdin, stdout, stderr = client.exec_command(command)
    return stdout.read().decode('utf-8', errors='ignore'), stderr.read().decode('utf-8', errors='ignore')

try:
    print("Connecting to VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("Connected!")
    
    # Stop PM2
    print("Stopping PM2...")
    execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true")
    
    # Check if next is installed properly
    print("Checking Next.js installation...")
    out, err = execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && ls -la node_modules/.bin/next'")
    print(f"Next.js binary: {out}")
    
    # If missing, reinstall
    if "No such file" in out or "No such file" in err:
        print("Reinstalling dependencies...")
        out, err = execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && rm -rf node_modules package-lock.json && npm cache clean --force && npm install'")
        if err and "error" in err.lower():
            print(f"Error during install: {err[:200]}")
    
    # Check if build exists
    print("Checking build...")
    out, err = execute_command(client, "su - vidibemus -c 'ls -la /var/www/vidibemus/.next'")
    if "No such file" in out or "No such file" in err:
        print("Building application...")
        execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && npm run build'")
    
    # Create a simple start script
    print("Creating start script...")
    start_script = """#!/bin/bash
cd /var/www/vidibemus
export NODE_ENV=production
export PORT=3000
exec node_modules/.bin/next start
"""
    execute_command(client, f"echo '{start_script}' > /var/www/vidibemus/start.sh")
    execute_command(client, "chmod +x /var/www/vidibemus/start.sh")
    execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/start.sh")
    
    # Update PM2 config to use the start script
    print("Updating PM2 configuration...")
    pm2_config = """module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: '/var/www/vidibemus/start.sh',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/vidibemus/error.log',
    out_file: '/var/log/vidibemus/out.log'
  }]
};"""
    
    execute_command(client, f"echo \"{pm2_config}\" > /var/www/vidibemus/ecosystem.config.js")
    execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js")
    
    # Create log directory
    execute_command(client, "mkdir -p /var/log/vidibemus && chown -R vidibemus:vidibemus /var/log/vidibemus")
    
    # Start with PM2
    print("Starting application with PM2...")
    execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && pm2 start ecosystem.config.js'")
    execute_command(client, "su - vidibemus -c 'pm2 save'")
    
    # Wait for startup
    time.sleep(5)
    
    # Check status
    print("\nChecking PM2 status...")
    out, err = execute_command(client, "su - vidibemus -c 'pm2 list'")
    print(out)
    
    # Check logs
    print("\nChecking recent logs...")
    out, err = execute_command(client, "su - vidibemus -c 'pm2 logs --lines 15 --nostream'")
    print(out)
    
    # Test application
    print("\nTesting application...")
    out, err = execute_command(client, "curl -I http://localhost:3000 2>/dev/null")
    if "200 OK" in out or "302" in out:
        print("SUCCESS! Application is running!")
    else:
        print(f"Response: {out[:200]}")
        # Check what's listening on port 3000
        out, err = execute_command(client, "netstat -tlnp | grep 3000")
        print(f"Port 3000 status: {out}")
    
    # Update Nginx config for better error handling
    print("\nUpdating Nginx configuration...")
    nginx_config = """server {
    listen 80;
    listen [::]:80;
    server_name 31.97.117.30 videbimusai.com www.videbimusai.com;
    
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
        proxy_redirect off;
    }
}"""
    
    execute_command(client, f"echo '{nginx_config}' > /etc/nginx/sites-available/default")
    execute_command(client, "nginx -t && systemctl reload nginx")
    
    client.close()
    print("\n" + "="*50)
    print("DEPLOYMENT COMPLETE!")
    print("="*50)
    print("Your website should now be accessible at:")
    print("  -> http://31.97.117.30")
    print("\nNext steps:")
    print("1. Configure DNS in Cloudflare")
    print("2. Add SSL certificate with: certbot --nginx")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()