#!/bin/bash

# Deployment Script for Hostinger VPS
# Run this script from your local machine (Git Bash on Windows)

VPS_IP="31.97.117.30"
VPS_USER="root"
VPS_PASSWORD="Advance@UK@2025"

echo "🚀 Starting deployment to Hostinger VPS..."
echo "VPS IP: $VPS_IP"

# Step 1: Upload setup script
echo "📤 Uploading setup script to VPS..."
scp deployment/hostinger/setup-ubuntu24.sh root@$VPS_IP:/root/setup.sh

# Step 2: Upload environment template
echo "📤 Uploading environment configuration..."
scp .env.production.template root@$VPS_IP:/root/.env.production

# Step 3: Execute setup script
echo "🔧 Running setup script on VPS..."
ssh root@$VPS_IP 'chmod +x /root/setup.sh && bash /root/setup.sh'

echo "✅ Initial setup complete!"
echo ""
echo "📋 Manual steps required:"
echo "1. SSH into VPS: ssh root@$VPS_IP"
echo "2. Switch to app user: su - vidibemus"
echo "3. Deploy application: cd /var/www/vidibemus && bash /home/vidibemus/deploy.sh"
echo "4. Configure environment: cp /root/.env.production /var/www/vidibemus/.env.local"
echo "5. Edit environment variables: nano /var/www/vidibemus/.env.local"