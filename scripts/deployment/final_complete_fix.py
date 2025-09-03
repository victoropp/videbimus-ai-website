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
    return out, err

try:
    print("🔧 Connecting to VPS for final fix...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("✅ Connected!\n")
    
    print("=" * 60)
    print("COMPLETE FIX - STARTING FROM SCRATCH")
    print("=" * 60)
    
    # Stop everything first
    print("\n1️⃣ Stopping all PM2 processes...")
    execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true")
    execute_command(client, "su - vidibemus -c 'pm2 kill' 2>/dev/null || true")
    
    # Check if .next exists and remove it
    print("\n2️⃣ Cleaning old build files...")
    execute_command(client, "rm -rf /var/www/vidibemus/.next")
    execute_command(client, "rm -rf /var/www/vidibemus/node_modules/.cache")
    
    # Verify Next.js is installed
    print("\n3️⃣ Verifying Next.js installation...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/node_modules/next/package.json", False)
    if "No such file" in out or "No such file" in err:
        print("Next.js missing! Reinstalling...")
        execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm install next@latest --save")
    else:
        print("Next.js is installed ✓")
    
    # Create missing utils files if needed
    print("\n4️⃣ Ensuring utils files exist...")
    execute_command(client, "mkdir -p /var/www/vidibemus/src/utils")
    
    # Check if utils files exist, if not create them
    out, err = execute_command(client, "ls /var/www/vidibemus/src/utils/", False)
    if "format.ts" not in out:
        print("Creating format.ts...")
        execute_command(client, """cat > /var/www/vidibemus/src/utils/format.ts << 'EOF'
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};
EOF""")
    
    if "validation.ts" not in out:
        print("Creating validation.ts...")
        execute_command(client, """cat > /var/www/vidibemus/src/utils/validation.ts << 'EOF'
export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

export const isPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const isUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
EOF""")
    
    if "helpers.ts" not in out:
        print("Creating helpers.ts...")
        execute_command(client, """cat > /var/www/vidibemus/src/utils/helpers.ts << 'EOF'
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};
EOF""")
    
    execute_command(client, "chown -R vidibemus:vidibemus /var/www/vidibemus/src/utils/")
    print("Utils files ready ✓")
    
    # Build the application
    print("\n5️⃣ Building application (this will take 2-3 minutes)...")
    print("Running: npm run build")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm run build 2>&1", False)
    
    # Check build output
    if "Compiled successfully" in out or "Generating static pages" in out or "Collecting page data" in out:
        print("✅ Build successful!")
    elif "Build failed" in out or "error" in err.lower():
        print("❌ Build failed. Error details:")
        print(out[-1500:] if len(out) > 1500 else out)
        if err:
            print(err[-1500:] if len(err) > 1500 else err)
    
    # Verify build exists
    print("\n6️⃣ Verifying build files...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/.next/ 2>&1", False)
    if "server" in out and "static" in out:
        print("✅ Build files verified!")
        
        # Create a working PM2 config
        print("\n7️⃣ Creating PM2 configuration...")
        execute_command(client, """cat > /var/www/vidibemus/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/vidibemus/error.log',
    out_file: '/var/log/vidibemus/out.log',
    log_file: '/var/log/vidibemus/combined.log',
    time: true,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF""")
        execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js")
        
        # Create log directory
        execute_command(client, "mkdir -p /var/log/vidibemus && chown -R vidibemus:vidibemus /var/log/vidibemus")
        
        # Start with PM2
        print("\n8️⃣ Starting application with PM2...")
        out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus pm2 start ecosystem.config.js")
        execute_command(client, "sudo -u vidibemus pm2 save")
        
        # Wait for startup
        print("\n⏳ Waiting for application to start...")
        time.sleep(8)
        
        # Check status
        print("\n9️⃣ Checking application status...")
        out, err = execute_command(client, "sudo -u vidibemus pm2 list")
        
        # Test the application
        print("\n🔟 Testing application...")
        out, err = execute_command(client, "curl -I http://localhost:3000 2>&1", False)
        if "200 OK" in out or "302" in out or "304" in out:
            print("✅ APPLICATION IS RUNNING!")
            
            # Make sure Nginx is configured
            print("\n1️⃣1️⃣ Checking Nginx configuration...")
            execute_command(client, """cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
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
    }
}
EOF""")
            execute_command(client, "nginx -t && systemctl reload nginx")
            
            print("\n" + "=" * 60)
            print("🎉 DEPLOYMENT SUCCESSFUL!")
            print("=" * 60)
            print("\n🌐 Your website is now live at:")
            print("   👉 http://31.97.117.30")
            print("\n📋 Next steps:")
            print("   1. Visit http://31.97.117.30 in your browser")
            print("   2. Configure DNS in Cloudflare")
            print("   3. Add SSL certificate with certbot")
            
        else:
            print("⚠️ Application may still be starting. Checking logs...")
            out, err = execute_command(client, "sudo -u vidibemus pm2 logs --lines 20 --nostream")
            
    else:
        print("❌ Build files not found. Please check the build errors above.")
    
    client.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()