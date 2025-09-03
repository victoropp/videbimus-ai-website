#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys
import time

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

hostname = '0.tcp.eu.ngrok.io'
port = 10886
username = 'root'
password = 'Advance@UK@2025'

def execute_command(client, command):
    stdin, stdout, stderr = client.exec_command(command)
    return stdout.read().decode('utf-8', errors='ignore'), stderr.read().decode('utf-8', errors='ignore')

try:
    print(f"Connecting to {hostname}:{port}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("Connected successfully!")
    
    # Check current PM2 status
    print("\nChecking current status...")
    out, err = execute_command(client, "su - vidibemus -c 'pm2 list'")
    print(out)
    
    # Stop PM2 processes
    print("Stopping PM2 processes...")
    execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && pm2 delete all' 2>/dev/null || true")
    
    # Check if repo exists
    print("Checking repository...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/package.json")
    if "No such file" in err:
        print("Repository missing, cloning...")
        execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus git clone https://github.com/victoropp/videbimus-ai-website.git .")
    
    # Create environment file
    print("Creating environment file...")
    env_content = """NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://31.97.117.30
NEXTAUTH_URL=http://31.97.117.30
NEXTAUTH_SECRET=CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
DATABASE_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
REDIS_URL=redis://:1405675dc0d791fb76726d61c8959938@localhost:6379
JWT_SECRET=3d8f72a9b4c5e6f1827394a0b5c6d7e8
ENCRYPTION_KEY=f47ac10b58cc4372a5670e02b2c3d479"""
    
    execute_command(client, f"echo '{env_content}' > /var/www/vidibemus/.env.local")
    execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/.env.local")
    
    # Install dependencies
    print("Installing dependencies...")
    out, err = execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && npm install'")
    if err and "error" in err.lower():
        print(f"NPM Install Error: {err[:500]}")
    
    # Generate Prisma
    print("Setting up database...")
    execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && npx prisma generate'")
    execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && npx prisma db push --skip-seed'")
    
    # Build application
    print("Building application...")
    out, err = execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && npm run build'")
    if err and "error" in err.lower():
        print(f"Build Error: {err[:500]}")
    
    # Create PM2 config
    print("Creating PM2 configuration...")
    pm2_config = """module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};"""
    
    execute_command(client, f"echo \"{pm2_config}\" > /var/www/vidibemus/ecosystem.config.js")
    execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js")
    
    # Start application
    print("Starting application...")
    execute_command(client, "su - vidibemus -c 'cd /var/www/vidibemus && pm2 start ecosystem.config.js'")
    execute_command(client, "su - vidibemus -c 'pm2 save'")
    
    # Check status
    print("\nChecking PM2 status...")
    out, err = execute_command(client, "su - vidibemus -c 'pm2 status'")
    print(out)
    
    # Check logs
    print("\nChecking logs...")
    out, err = execute_command(client, "su - vidibemus -c 'pm2 logs --lines 10 --nostream'")
    print(out)
    
    # Test application
    print("\nTesting application...")
    time.sleep(3)
    out, err = execute_command(client, "curl -I http://localhost:3000 2>/dev/null | head -n 1")
    print(f"Response: {out}")
    
    # Restart nginx
    print("Restarting nginx...")
    execute_command(client, "systemctl restart nginx")
    
    client.close()
    print("\nDeployment fix complete!")
    print("Your website should be accessible at: http://31.97.117.30")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()