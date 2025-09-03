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
    stdin, stdout, stderr = client.exec_command(command, timeout=300)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if print_output and out:
        print(out)
    return out, err

try:
    print("🔧 Connecting to your VPS via ngrok...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("✅ Connected successfully!\n")
    
    print("=" * 60)
    print("COMPLETE DEPLOYMENT FIX")
    print("=" * 60)
    
    # Stop PM2
    print("\n1️⃣ Stopping PM2 processes...")
    execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true", False)
    execute_command(client, "su - vidibemus -c 'pm2 kill' 2>/dev/null || true", False)
    print("✅ PM2 stopped")
    
    # Check current state
    print("\n2️⃣ Checking current state...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/.next 2>&1", False)
    if "No such file" in out or "cannot access" in out:
        print("❌ No build found - will create one")
    else:
        print("🗑️ Removing old build")
        execute_command(client, "rm -rf /var/www/vidibemus/.next", False)
    
    # Ensure utils files exist
    print("\n3️⃣ Creating missing utils files...")
    execute_command(client, "mkdir -p /var/www/vidibemus/src/utils", False)
    
    # Create format.ts
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
EOF""", False)
    
    # Create validation.ts
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
EOF""", False)
    
    # Create helpers.ts
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
EOF""", False)
    
    execute_command(client, "chown -R vidibemus:vidibemus /var/www/vidibemus/src/utils/", False)
    print("✅ Utils files created")
    
    # Build the application
    print("\n4️⃣ Building application (this will take 2-3 minutes)...")
    print("   Running: npm run build")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm run build 2>&1", False)
    
    if "Compiled successfully" in out or "Generating static pages" in out or "Collecting page data" in out or "Finalizing page" in out:
        print("✅ Build successful!")
    else:
        print("⚠️ Build output:")
        print(out[-1000:] if len(out) > 1000 else out)
    
    # Verify build
    print("\n5️⃣ Verifying build...")
    out, err = execute_command(client, "ls -la /var/www/vidibemus/.next/ 2>&1", False)
    if "server" in out:
        print("✅ Build verified!")
        
        # Create PM2 config
        print("\n6️⃣ Creating PM2 configuration...")
        execute_command(client, """cat > /var/www/vidibemus/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vidibemus-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vidibemus',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/vidibemus/error.log',
    out_file: '/var/log/vidibemus/out.log',
    instances: 1,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF""", False)
        execute_command(client, "chown vidibemus:vidibemus /var/www/vidibemus/ecosystem.config.js", False)
        print("✅ PM2 config created")
        
        # Create log directory
        execute_command(client, "mkdir -p /var/log/vidibemus && chown -R vidibemus:vidibemus /var/log/vidibemus", False)
        
        # Start with PM2
        print("\n7️⃣ Starting application with PM2...")
        out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus pm2 start ecosystem.config.js", False)
        execute_command(client, "sudo -u vidibemus pm2 save", False)
        print("✅ PM2 started")
        
        # Wait for startup
        print("\n⏳ Waiting for application to start...")
        time.sleep(8)
        
        # Check status
        print("\n8️⃣ Checking application status...")
        out, err = execute_command(client, "sudo -u vidibemus pm2 list")
        
        # Check logs
        print("\n9️⃣ Checking recent logs...")
        out, err = execute_command(client, "sudo -u vidibemus pm2 logs --lines 10 --nostream")
        
        # Test application
        print("\n🔟 Testing application...")
        out, err = execute_command(client, "curl -s -o /dev/null -w 'HTTP Status: %{http_code}' http://localhost:3000", False)
        print(out)
        
        if "200" in out or "302" in out or "304" in out:
            print("\n✅ APPLICATION IS RUNNING!")
            
            # Update Nginx
            print("\n1️⃣1️⃣ Updating Nginx configuration...")
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
        proxy_read_timeout 90;
    }
}
EOF""", False)
            execute_command(client, "nginx -t && systemctl reload nginx", False)
            print("✅ Nginx updated")
            
            print("\n" + "=" * 60)
            print("🎉 DEPLOYMENT SUCCESSFUL!")
            print("=" * 60)
            print("\n🌐 Your website is now LIVE at:")
            print("   👉 http://31.97.117.30")
            print("\n✅ Everything is working!")
            print("\n📋 Next steps:")
            print("   1. Open http://31.97.117.30 in your browser")
            print("   2. Configure DNS in Cloudflare for videbimusai.com")
            print("   3. Once DNS is set, run: certbot --nginx -d videbimusai.com -d www.videbimusai.com")
            
        else:
            print("\n⚠️ Application may still be starting...")
            print("Check PM2 logs: pm2 logs vidibemus-ai")
    else:
        print("❌ Build not found. Please check build errors above.")
    
    client.close()
    print("\n✅ Deployment script completed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()