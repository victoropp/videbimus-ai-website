#!/usr/bin/env python3
import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

hostname = '0.tcp.eu.ngrok.io'
port = 10886
username = 'root'
password = 'Advance@UK@2025'

def execute_command(client, command, print_output=True):
    stdin, stdout, stderr = client.exec_command(command)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if print_output and out:
        print(out)
    if print_output and err:
        print(f"Error: {err}")
    return out, err

try:
    print("Connecting to VPS for diagnosis...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("Connected!\n")
    
    print("=" * 50)
    print("DIAGNOSING ISSUES")
    print("=" * 50)
    
    # Check Node and NPM versions
    print("\n1. Checking Node.js and NPM versions:")
    execute_command(client, "node --version")
    execute_command(client, "npm --version")
    
    # Check if repository exists
    print("\n2. Checking repository:")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/package.json", False)
    if "No such file" in out or "No such file" in err:
        print("Repository missing! Cloning...")
        execute_command(client, "rm -rf /var/www/vidibemus/*")
        execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus git clone https://github.com/victoropp/videbimus-ai-website.git .")
    else:
        print("Repository exists")
    
    # Check package.json
    print("\n3. Checking package.json:")
    out, err = execute_command(client, "cat /var/www/vidibemus/package.json | grep '\"next\"'")
    
    # Clean install
    print("\n4. Performing clean installation:")
    print("Removing old node_modules...")
    execute_command(client, "rm -rf /var/www/vidibemus/node_modules /var/www/vidibemus/package-lock.json")
    
    print("Installing dependencies (this may take a few minutes)...")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm install", False)
    if "error" in err.lower():
        print(f"Installation errors: {err[:500]}")
    else:
        print("Dependencies installed successfully")
    
    # Verify Next.js installation
    print("\n5. Verifying Next.js installation:")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/node_modules/.bin/ | grep next")
    if "next" not in out:
        print("Next.js not found! Installing directly...")
        execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm install next@latest react@latest react-dom@latest")
    
    # Generate Prisma client
    print("\n6. Generating Prisma client:")
    execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npx prisma generate", False)
    
    # Build the application
    print("\n7. Building application:")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm run build", False)
    if "Compiled successfully" in out or "Route" in out:
        print("Build completed successfully!")
    else:
        print("Build output:", out[:500] if out else "No output")
        if err:
            print("Build errors:", err[:500])
    
    # Stop PM2
    print("\n8. Stopping PM2:")
    execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true", False)
    
    # Start directly with npm start first to test
    print("\n9. Testing direct start:")
    print("Starting application directly...")
    stdin, stdout, stderr = client.exec_command("cd /var/www/vidibemus && timeout 5 sudo -u vidibemus npm start")
    time.sleep(3)
    
    # Check if it's running
    out, err = execute_command(client, "curl -I http://localhost:3000 2>/dev/null | head -1", False)
    if "200" in out or "302" in out:
        print("SUCCESS! Application starts correctly!")
        
        # Now set up PM2 properly
        print("\n10. Setting up PM2:")
        
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
        
        execute_command(client, f"cat > /var/www/vidibemus/ecosystem.config.js << 'EOF'\n{pm2_config}\nEOF")
        execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js")
        
        # Start with PM2
        execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus pm2 start ecosystem.config.js")
        execute_command(client, "sudo -u vidibemus pm2 save")
        execute_command(client, "pm2 startup systemd -u vidibemus --hp /home/vidibemus")
        
        time.sleep(3)
        
        # Check final status
        print("\n11. Final PM2 Status:")
        execute_command(client, "sudo -u vidibemus pm2 list")
        
        # Test final endpoint
        print("\n12. Testing final endpoint:")
        out, err = execute_command(client, "curl -I http://localhost:3000")
        
    else:
        print("Application failed to start. Checking errors...")
        execute_command(client, "tail -20 /var/www/vidibemus/.next/server/app/page.js 2>/dev/null || echo 'Build files not found'")
    
    client.close()
    
    print("\n" + "=" * 50)
    print("DIAGNOSIS COMPLETE")
    print("=" * 50)
    print("\nYour website status:")
    print("URL: http://31.97.117.30")
    print("\nIf the site is not working, please share any error messages above.")
    
except Exception as e:
    print(f"Connection error: {e}")
    import traceback
    traceback.print_exc()