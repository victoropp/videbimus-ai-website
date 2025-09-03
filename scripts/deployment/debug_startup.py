#!/usr/bin/env python3
import paramiko
import sys

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
    if print_output and err:
        print(f"Error: {err}")
    return out, err

try:
    print("🔍 Connecting to debug startup issue...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("✅ Connected!\n")
    
    # Stop PM2
    print("1️⃣ Stopping PM2...")
    execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true", False)
    
    # Check if .next exists
    print("\n2️⃣ Checking if build exists...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/.next/", False)
    if "BUILD_ID" not in out:
        print("❌ Build not complete. Rebuilding...")
        
        # Rebuild
        print("\n3️⃣ Running build again...")
        out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm run build 2>&1")
        
    # Check BUILD_ID
    print("\n4️⃣ Checking BUILD_ID...")
    out, err = execute_command(client, "cat /var/www/vidibemus/.next/BUILD_ID 2>&1")
    
    # Try starting directly without PM2
    print("\n5️⃣ Testing direct start...")
    print("Running: npm start (will timeout after 10 seconds)")
    stdin, stdout, stderr = client.exec_command("cd /var/www/vidibemus && timeout 10 sudo -u vidibemus npm start 2>&1")
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out)
    
    # Create a simpler PM2 config
    print("\n6️⃣ Creating simplified PM2 config...")
    execute_command(client, """cat > /var/www/vidibemus/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF""", False)
    
    execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js", False)
    
    # Start with PM2
    print("\n7️⃣ Starting with PM2...")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus pm2 start ecosystem.config.js")
    
    # Wait and check
    import time
    time.sleep(5)
    
    print("\n8️⃣ Checking status...")
    out, err = execute_command(client, "sudo -u vidibemus pm2 list")
    
    print("\n9️⃣ Testing application...")
    out, err = execute_command(client, "curl -I http://localhost:3000 2>&1")
    
    if "200 OK" in out or "302" in out:
        print("\n✅ SUCCESS! Application is running!")
        print("🌐 Visit: http://31.97.117.30")
    else:
        print("\n🔍 Checking PM2 logs for errors...")
        out, err = execute_command(client, "sudo -u vidibemus pm2 logs --lines 30 --nostream")
    
    client.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()