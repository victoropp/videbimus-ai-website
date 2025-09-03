#!/usr/bin/env python3
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

hostname = '0.tcp.eu.ngrok.io'
port = 10886
username = 'root'
password = 'Advance@UK@2025'

def execute_command(client, command):
    stdin, stdout, stderr = client.exec_command(command)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print(out)
    if err and "warning" not in err.lower():
        print(f"Error: {err}")
    return out, err

try:
    print("Connecting to fix dependency issues...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("Connected!\n")
    
    print("Fixing TypeScript dependency conflict...")
    
    # Update TypeScript to compatible version
    print("1. Updating TypeScript to version 5.7.2...")
    execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm uninstall typescript")
    execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm install typescript@5.7.2")
    
    # Clean install with legacy peer deps
    print("\n2. Installing all dependencies with --legacy-peer-deps...")
    execute_command(client, "cd /var/www/vidibemus && rm -rf node_modules package-lock.json")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm install --legacy-peer-deps")
    
    # Verify Next.js is installed
    print("\n3. Verifying Next.js installation...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/node_modules/next/")
    if "package.json" in out:
        print("Next.js is installed!")
    
    # Generate Prisma
    print("\n4. Generating Prisma client...")
    execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npx prisma generate")
    
    # Build the application
    print("\n5. Building application...")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm run build")
    
    # Check if build was successful
    out, err = execute_command(client, "ls -la /var/www/vidibemus/.next/")
    if "server" in out:
        print("Build successful!")
        
        # Stop PM2
        print("\n6. Stopping PM2...")
        execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true")
        
        # Create PM2 config
        print("\n7. Creating PM2 configuration...")
        pm2_config = """module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_restarts: 10,
    min_uptime: '10s'
  }]
};"""
        
        execute_command(client, f"echo '{pm2_config}' > /var/www/vidibemus/ecosystem.config.js")
        execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js")
        
        # Start with PM2
        print("\n8. Starting application with PM2...")
        execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus pm2 start ecosystem.config.js")
        execute_command(client, "sudo -u vidibemus pm2 save")
        
        # Check status
        print("\n9. Checking PM2 status...")
        import time
        time.sleep(5)
        execute_command(client, "sudo -u vidibemus pm2 list")
        
        # Test application
        print("\n10. Testing application...")
        out, err = execute_command(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")
        if "200" in out or "302" in out or "304" in out:
            print(f"\n✅ SUCCESS! Application is running (HTTP {out})")
            print("Your website is now accessible at: http://31.97.117.30")
        else:
            print(f"HTTP Response: {out}")
            print("\nChecking PM2 logs...")
            execute_command(client, "sudo -u vidibemus pm2 logs --lines 20 --nostream")
    else:
        print("Build failed. Check errors above.")
    
    client.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()