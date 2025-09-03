# 🏗️ Infrastructure Details

## Server Specifications

### Hostinger VPS (KVM)
- **Provider**: Hostinger
- **Type**: KVM VPS
- **Location**: United Kingdom - Manchester
- **IP Address**: 31.97.117.30
- **IPv6**: 2a02:4780:f:4bf4::1
- **Hostname**: srv985923.hstgr.cloud
- **Operating System**: Ubuntu 24.04 LTS
- **Kernel**: 6.8.0-79-generic x86_64

### Resources
- **CPU**: [Check with `lscpu` on server]
- **RAM**: [Check with `free -h` on server]
- **Storage**: 47.39GB
- **Current Usage**: 16.3% of storage

## Network Configuration

### Ports
| Port | Service | Status |
|------|---------|--------|
| 22   | SSH     | Open   |
| 80   | HTTP    | Open (redirects to 443) |
| 443  | HTTPS   | Open   |
| 3000 | Node.js | Internal only |
| 5432 | PostgreSQL | Local only |
| 6379 | Redis   | Local only |

### Firewall (UFW)
```bash
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
3000/tcp                   ALLOW       Anywhere
```

## Services Architecture

### 1. Web Server (Nginx)
- **Version**: Check with `nginx -v`
- **Config Location**: `/etc/nginx/sites-available/videbimusai`
- **Document Root**: Proxy to Node.js
- **SSL**: Configured with Let's Encrypt

### 2. Application Server
- **Runtime**: Node.js v20
- **Framework**: Next.js 15.5.2
- **Process Manager**: PM2 (cluster mode)
- **Workers**: 2 instances
- **Port**: 3000

### 3. Database Server
- **Type**: PostgreSQL 15
- **Database Name**: vidibemus_ai
- **User**: vidibemus
- **Location**: localhost:5432

### 4. Cache Server
- **Type**: Redis
- **Version**: Check with `redis-server --version`
- **Port**: 6379
- **Protected**: Yes (password required)

### 5. SSL/TLS
- **Provider**: Let's Encrypt
- **Certificate Location**: `/etc/letsencrypt/live/videbimusai.com/`
- **Auto-renewal**: Enabled via certbot.timer
- **Protocols**: TLSv1.2, TLSv1.3

## Directory Structure

```
/
├── var/
│   ├── www/
│   │   └── vidibemus/           # Application root
│   │       ├── .next/            # Built application
│   │       ├── node_modules/     # Dependencies
│   │       ├── public/           # Static files
│   │       ├── src/              # Source code
│   │       ├── .env.local        # Environment variables
│   │       ├── ecosystem.config.js # PM2 configuration
│   │       └── package.json      # Project dependencies
│   ├── log/
│   │   └── vidibemus/           # Application logs
│   └── backups/
│       └── vidibemus/           # Backup directory
├── etc/
│   ├── nginx/
│   │   └── sites-available/
│   │       └── videbimusai      # Nginx config
│   ├── letsencrypt/
│   │   └── live/
│   │       └── videbimusai.com/ # SSL certificates
│   └── systemd/
│       └── system/
│           └── certbot.timer     # SSL auto-renewal
└── home/
    └── vidibemus/               # App user home
        └── .pm2/                # PM2 configs
```

## DNS Configuration

### Current DNS Records (Hostinger)
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    | @    | 31.97.117.30 | 14400 |
| A    | www  | 31.97.117.30 | 14400 |

## Monitoring & Logs

### Log Files
- **Application Logs**: `/var/log/vidibemus/`
- **PM2 Logs**: `~vidibemus/.pm2/logs/`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **System Logs**: `/var/log/syslog`

### Monitoring Commands
```bash
# Application status
pm2 status
pm2 monit

# System resources
htop
df -h
free -m

# Service status
systemctl status nginx
systemctl status postgresql
systemctl status redis
```

## Backup Strategy

### What to Backup
1. Database: `pg_dump vidibemus_ai`
2. Environment file: `/var/www/vidibemus/.env.local`
3. User uploads: `/var/www/vidibemus/public/uploads/`
4. Nginx config: `/etc/nginx/sites-available/videbimusai`

### Backup Script Location
`/var/backups/vidibemus/backup.sh`

## Performance Optimization

### Current Optimizations
- PM2 cluster mode (2 workers)
- Nginx caching for static assets
- Gzip compression enabled
- Redis caching
- HTTP/2 enabled
- Keep-alive connections

### System Limits
```bash
# File descriptors
fs.file-max = 2097152

# Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
```

---
*Updated: December 2024*