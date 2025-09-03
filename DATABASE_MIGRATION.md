# Database Migration Guide: Hostinger VPS to Neon

## Prerequisites
- SSH access to your Hostinger VPS
- psql command-line tool installed locally
- Neon database already created (✓ Done)

## Step 1: Export Database from Hostinger VPS

### Option A: Using ngrok tunnel (tcp://5.tcp.eu.ngrok.io:17999)
```bash
# Connect via ngrok
ssh root@5.tcp.eu.ngrok.io -p 17999

# Once connected, run the export script
chmod +x export_database.sh
./export_database.sh
```

### Option B: Direct SSH to VPS IP
```bash
# Replace YOUR_VPS_IP with actual IP
ssh root@YOUR_VPS_IP

# Run export script
chmod +x export_database.sh
./export_database.sh
```

## Step 2: Download the Backup

After running the export script, download the backup file:

```bash
# Via ngrok
scp -P 17999 root@5.tcp.eu.ngrok.io:/tmp/vidibemus_backup_*.sql.gz .

# Or via direct IP
scp root@YOUR_VPS_IP:/tmp/vidibemus_backup_*.sql.gz .
```

## Step 3: Import to Neon

Run the import script with your backup file:

```bash
chmod +x import_to_neon.sh
./import_to_neon.sh vidibemus_backup_*.sql.gz
```

## Step 4: Verify Migration

1. **Check Neon Console**
   - Visit: https://console.neon.tech
   - Navigate to your database
   - Check Tables tab to verify all tables are present

2. **Run Prisma Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Test Application**
   - Visit your Vercel deployment
   - Test login functionality
   - Verify data is accessible

## Connection Strings

### Hostinger VPS (Source)
- Host: localhost (when connected via SSH)
- Database: vidibemus_ai
- User: vidibemus

### Neon (Destination)
```
postgresql://neondb_owner:npg_MO0q1mnXYsAf@ep-royal-term-a5lvpqmo-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

## Troubleshooting

### If export fails:
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify credentials: `sudo -u postgres psql -l`
3. Try with sudo: `sudo ./export_database.sh`

### If import fails:
1. Ensure psql is installed locally: `psql --version`
2. Test Neon connection: `psql "$NEON_URL" -c "SELECT 1"`
3. Check file integrity: `gunzip -t backup.sql.gz`

## Custom Domain Setup (Already Configured)

DNS records have been added at Hostinger:
- A Record: videbimusai.com → 76.76.21.21 (Vercel)
- CNAME: www → cname.vercel-dns.com
- CNAME: oilflowbidec-erp → cname.vercel-dns.com

Next: Add these domains in Vercel dashboard after deployment succeeds.