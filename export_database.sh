#!/bin/bash
# Database Export Script for Videbimus AI
# This script exports your PostgreSQL database from Hostinger VPS

echo "==================================="
echo "Videbimus AI Database Export Script"
echo "==================================="

# Database credentials (update if different)
DB_NAME="vidibemus_ai"
DB_USER="vidibemus"
DB_HOST="localhost"
EXPORT_FILE="/tmp/vidibemus_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "1. Creating database backup..."
sudo -u postgres pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $EXPORT_FILE

if [ $? -eq 0 ]; then
    echo "✓ Database exported successfully to: $EXPORT_FILE"
    echo ""
    echo "2. Compressing backup..."
    gzip $EXPORT_FILE
    COMPRESSED_FILE="${EXPORT_FILE}.gz"
    echo "✓ Compressed to: $COMPRESSED_FILE"
    echo ""
    echo "File size: $(ls -lh $COMPRESSED_FILE | awk '{print $5}')"
    echo ""
    echo "==================================="
    echo "NEXT STEPS:"
    echo "==================================="
    echo "1. Download this file to your local machine:"
    echo "   scp root@YOUR_VPS_IP:$COMPRESSED_FILE ."
    echo ""
    echo "2. Or use this command to output the file content (base64):"
    echo "   base64 $COMPRESSED_FILE"
    echo ""
    echo "3. The backup file is located at:"
    echo "   $COMPRESSED_FILE"
else
    echo "✗ Error: Failed to export database"
    echo "Try running with sudo or check database credentials"
fi