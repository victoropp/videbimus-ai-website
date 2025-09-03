#!/bin/bash
# Database Import Script for Neon PostgreSQL
# This script imports your database backup to Neon

echo "====================================="
echo "Neon Database Import Script"
echo "====================================="

# Neon connection details from your .env.production
NEON_URL="postgresql://neondb_owner:npg_MO0q1mnXYsAf@ep-royal-term-a5lvpqmo-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: ./import_to_neon.sh <backup_file.sql>"
    echo "       ./import_to_neon.sh <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "1. Preparing to import: $BACKUP_FILE"

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "2. Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    IMPORT_FILE="${BACKUP_FILE%.gz}"
else
    IMPORT_FILE="$BACKUP_FILE"
fi

echo "3. Importing database to Neon..."
echo "   This may take several minutes depending on database size..."

# Import to Neon using psql
psql "$NEON_URL" < "$IMPORT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database imported successfully to Neon!"
    echo ""
    echo "====================================="
    echo "NEXT STEPS:"
    echo "====================================="
    echo "1. Run Prisma migrations to sync schema:"
    echo "   npx prisma migrate deploy"
    echo ""
    echo "2. Verify data in Neon dashboard:"
    echo "   https://console.neon.tech"
    echo ""
    echo "3. Test your application connection"
else
    echo ""
    echo "✗ Error: Failed to import database"
    echo "Please check your Neon connection string and try again"
fi

# Clean up temporary file if we decompressed
if [[ "$BACKUP_FILE" == *.gz ]] && [ -f "${BACKUP_FILE%.gz}" ]; then
    rm "${BACKUP_FILE%.gz}"
fi