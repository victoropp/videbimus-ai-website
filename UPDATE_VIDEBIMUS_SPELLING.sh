#!/bin/bash

# Update Videbimus Spelling on Production Server
# This script updates all instances of "Vidibemus" to "Videbimus"

echo "========================================="
echo "Updating Vidibemus to Videbimus on Server"
echo "========================================="

# Connect to server
SERVER="root@31.97.117.30"
PASSWORD="Advance@UK@2025"

echo ""
echo "Step 1: Connecting to server..."
echo "Please enter password when prompted: $PASSWORD"
echo ""

ssh $SERVER << 'ENDSSH'
echo "Connected to server successfully!"
echo ""

# Navigate to application directory
cd /var/www/vidibemus

echo "Step 2: Pulling latest changes from GitHub..."
git pull origin master

echo ""
echo "Step 3: Updating all Vidibemus references to Videbimus..."

# Update critical files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./.git/*" \
    -exec sed -i 's/Vidibemus/Videbimus/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./.git/*" \
    -exec sed -i 's/vidibemus/videbimus/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./.git/*" \
    -exec sed -i 's/VIDIBEMUS/VIDEBIMUS/g' {} \;

echo ""
echo "Step 4: Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "Step 5: Building application..."
npm run build

echo ""
echo "Step 6: Restarting PM2..."
pm2 restart vidibemus-ai

echo ""
echo "Step 7: Checking application status..."
pm2 status vidibemus-ai

echo ""
echo "========================================="
echo "Update Complete!"
echo "========================================="
echo ""
echo "Please verify the changes at:"
echo "https://videbimusai.com"
echo ""
echo "Check that all references now show 'Videbimus AI' instead of 'Vidibemus AI'"
echo ""
ENDSSH

echo ""
echo "Deployment script completed!"