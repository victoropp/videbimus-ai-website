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
    return out, err

try:
    print("Connecting to fix build errors...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    print("Connected!\n")
    
    # Fix the missing utils files
    print("1. Creating missing utils files...")
    
    # Create utils directory if it doesn't exist
    execute_command(client, "mkdir -p /var/www/vidibemus/src/utils")
    
    # Create format.ts
    format_content = """export const formatDate = (date: Date): string => {
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
"""
    execute_command(client, f"cat > /var/www/vidibemus/src/utils/format.ts << 'EOF'\n{format_content}\nEOF")
    
    # Create validation.ts
    validation_content = """export const isEmail = (email: string): boolean => {
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
"""
    execute_command(client, f"cat > /var/www/vidibemus/src/utils/validation.ts << 'EOF'\n{validation_content}\nEOF")
    
    # Create helpers.ts
    helpers_content = """export const sleep = (ms: number): Promise<void> => {
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
"""
    execute_command(client, f"cat > /var/www/vidibemus/src/utils/helpers.ts << 'EOF'\n{helpers_content}\nEOF")
    
    # Set proper ownership
    execute_command(client, "chown -R vidibemus:vidibemus /var/www/vidibemus/src/utils/")
    
    print("Utils files created!\n")
    
    # Now rebuild
    print("2. Rebuilding application...")
    out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus npm run build")
    
    # Check if build succeeded
    if "Compiled successfully" in out or "Route" in out or "Generating static pages" in out:
        print("Build completed successfully!\n")
        
        # Create proper PM2 config
        print("3. Creating PM2 configuration...")
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
        
        # Stop and start PM2
        print("4. Starting application with PM2...")
        execute_command(client, "su - vidibemus -c 'pm2 delete all' 2>/dev/null || true")
        out, err = execute_command(client, "cd /var/www/vidibemus && sudo -u vidibemus pm2 start ecosystem.config.js")
        print(out)
        
        # Save PM2
        execute_command(client, "sudo -u vidibemus pm2 save")
        
        # Wait and check status
        import time
        time.sleep(5)
        
        print("\n5. Checking PM2 status...")
        out, err = execute_command(client, "sudo -u vidibemus pm2 list")
        print(out)
        
        # Test application
        print("\n6. Testing application...")
        out, err = execute_command(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")
        print(f"HTTP Response Code: {out}")
        
        if "200" in out or "302" in out or "304" in out:
            print("\n✅ SUCCESS! Your website is running!")
            print("Access it at: http://31.97.117.30")
        else:
            print("\nChecking PM2 logs for errors...")
            out, err = execute_command(client, "sudo -u vidibemus pm2 logs --lines 15 --nostream")
            print(out)
    else:
        print("Build failed. Output:")
        print(out[-2000:] if out else "No output")
        if err:
            print("Errors:")
            print(err[-2000:])
    
    client.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()