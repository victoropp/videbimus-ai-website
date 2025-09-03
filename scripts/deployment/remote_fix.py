#!/usr/bin/env python3
import paramiko
import time

# Connection details
hostname = '0.tcp.eu.ngrok.io'
port = 10886
username = 'root'
password = 'Advance@UK@2025'

# Commands to fix deployment
fix_commands = """
echo "🔧 Starting fix..."

# Fix as vidibemus user
su - vidibemus -c 'cd /var/www/vidibemus && pm2 delete all 2>/dev/null || true'

# Check and create env file if needed
su - vidibemus -c 'cd /var/www/vidibemus && if [ ! -f .env.local ]; then
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://31.97.117.30
NEXTAUTH_URL=http://31.97.117.30
NEXTAUTH_SECRET=CopY9fhWSKvxd7TAsaVFfT/oqbnG6LcJ4cx89OVJmqw=
DATABASE_URL=postgresql://vidibemus:fb671b96bdd3463085f9dfd645af44d4@localhost:5432/vidibemus_ai
REDIS_URL=redis://:1405675dc0d791fb76726d61c8959938@localhost:6379
JWT_SECRET=3d8f72a9b4c5e6f1827394a0b5c6d7e8
ENCRYPTION_KEY=f47ac10b58cc4372a5670e02b2c3d479
EOF
fi'

# Install and build
su - vidibemus -c 'cd /var/www/vidibemus && npm install'
su - vidibemus -c 'cd /var/www/vidibemus && npx prisma generate'
su - vidibemus -c 'cd /var/www/vidibemus && npx prisma db push --skip-seed'
su - vidibemus -c 'cd /var/www/vidibemus && npm run build'

# Create PM2 config
su - vidibemus -c 'cd /var/www/vidibemus && cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "vidibemus-ai",
    script: "./node_modules/.bin/next",
    args: "start",
    cwd: "/var/www/vidibemus",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
};
EOF'

# Start app
su - vidibemus -c 'cd /var/www/vidibemus && pm2 start ecosystem.config.js'
su - vidibemus -c 'pm2 save'

# Restart nginx
systemctl restart nginx

# Test
sleep 3
curl -I http://localhost:3000
"""

try:
    # Connect
    print(f"Connecting to {hostname}:{port}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)
    
    # Execute commands
    print("Executing fix commands...")
    stdin, stdout, stderr = client.exec_command(fix_commands)
    
    # Print output
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    # Check PM2 status
    stdin, stdout, stderr = client.exec_command("su - vidibemus -c 'pm2 status'")
    print("\n📊 PM2 Status:")
    print(stdout.read().decode())
    
    client.close()
    print("\n✅ Fix complete!")
    
except Exception as e:
    print(f"Error: {e}")