#!/bin/bash

# Email Server Setup Script for Vidibemus AI
# Configures Postfix and Dovecot for unlimited email addresses

set -e

DOMAIN="vidibemus.ai"
HOSTNAME="mail.vidibemus.ai"

echo "📧 Configuring Email Server for $DOMAIN"

# Install required packages
apt-get update
apt-get install -y postfix postfix-mysql dovecot-core dovecot-imapd dovecot-pop3d dovecot-lmtpd dovecot-mysql
apt-get install -y opendkim opendkim-tools postfix-policyd-spf-python
apt-get install -y certbot

# Backup original configs
cp /etc/postfix/main.cf /etc/postfix/main.cf.backup
cp /etc/dovecot/dovecot.conf /etc/dovecot/dovecot.conf.backup

# Configure Postfix main.cf
cat > /etc/postfix/main.cf <<EOF
# Basic Configuration
myhostname = $HOSTNAME
mydomain = $DOMAIN
myorigin = \$mydomain
mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
inet_interfaces = all
inet_protocols = all

# Mail directories
home_mailbox = Maildir/
mailbox_command =

# Virtual domains
virtual_mailbox_domains = mysql:/etc/postfix/mysql-virtual-mailbox-domains.cf
virtual_mailbox_maps = mysql:/etc/postfix/mysql-virtual-mailbox-maps.cf
virtual_alias_maps = mysql:/etc/postfix/mysql-virtual-alias-maps.cf

# SMTP Authentication
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = \$mydomain
broken_sasl_auth_clients = yes

# TLS Configuration
smtpd_use_tls = yes
smtpd_tls_cert_file = /etc/letsencrypt/live/$DOMAIN/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/$DOMAIN/privkey.pem
smtpd_tls_security_level = may
smtpd_tls_auth_only = yes
smtp_tls_security_level = may

# Restrictions
smtpd_recipient_restrictions =
    permit_mynetworks,
    permit_sasl_authenticated,
    reject_unauth_destination,
    check_policy_service unix:private/policyd-spf,
    reject_unauth_pipelining,
    reject_invalid_hostname,
    reject_non_fqdn_hostname,
    reject_non_fqdn_sender,
    reject_non_fqdn_recipient,
    reject_unknown_sender_domain,
    reject_unknown_recipient_domain,
    reject_rbl_client zen.spamhaus.org,
    permit

# Limits
message_size_limit = 20485760
mailbox_size_limit = 0
recipient_delimiter = +

# DKIM
milter_default_action = accept
milter_protocol = 6
smtpd_milters = local:opendkim/opendkim.sock
non_smtpd_milters = local:opendkim/opendkim.sock

# Virtual mailbox settings
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000
virtual_mailbox_base = /var/mail/vhosts
EOF

# Configure Postfix master.cf for SMTP submission
cat >> /etc/postfix/master.cf <<EOF

# Submission port 587
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_tls_auth_only=yes
  -o smtpd_client_restrictions=permit_sasl_authenticated,reject

# SMTPS port 465
smtps     inet  n       -       y       -       -       smtpd
  -o syslog_name=postfix/smtps
  -o smtpd_tls_wrappermode=yes
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_client_restrictions=permit_sasl_authenticated,reject
EOF

# Create MySQL database for virtual mailboxes
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS mailserver;
USE mailserver;

CREATE TABLE IF NOT EXISTS virtual_domains (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS virtual_users (
  id INT NOT NULL AUTO_INCREMENT,
  domain_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS virtual_aliases (
  id INT NOT NULL AUTO_INCREMENT,
  domain_id INT NOT NULL,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Add the domain
INSERT INTO virtual_domains (name) VALUES ('$DOMAIN');

-- Create mail user
GRANT SELECT ON mailserver.* TO 'mailuser'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
FLUSH PRIVILEGES;
EOF

# Configure Postfix MySQL queries
cat > /etc/postfix/mysql-virtual-mailbox-domains.cf <<EOF
user = mailuser
password = CHANGE_THIS_PASSWORD
hosts = 127.0.0.1
dbname = mailserver
query = SELECT 1 FROM virtual_domains WHERE name='%s'
EOF

cat > /etc/postfix/mysql-virtual-mailbox-maps.cf <<EOF
user = mailuser
password = CHANGE_THIS_PASSWORD
hosts = 127.0.0.1
dbname = mailserver
query = SELECT CONCAT(SUBSTRING_INDEX(email,'@',-1),'/',SUBSTRING_INDEX(email,'@',1),'/') FROM virtual_users WHERE email='%s'
EOF

cat > /etc/postfix/mysql-virtual-alias-maps.cf <<EOF
user = mailuser
password = CHANGE_THIS_PASSWORD
hosts = 127.0.0.1
dbname = mailserver
query = SELECT destination FROM virtual_aliases WHERE source='%s'
EOF

# Set permissions
chmod 640 /etc/postfix/mysql-*.cf
chgrp postfix /etc/postfix/mysql-*.cf

# Configure Dovecot
cat > /etc/dovecot/dovecot.conf <<EOF
protocols = imap pop3 lmtp
listen = *
mail_location = maildir:/var/mail/vhosts/%d/%n
mail_privileged_group = mail

# SSL Configuration
ssl = required
ssl_cert = </etc/letsencrypt/live/$DOMAIN/fullchain.pem
ssl_key = </etc/letsencrypt/live/$DOMAIN/privkey.pem

# Authentication
auth_mechanisms = plain login
disable_plaintext_auth = yes

passdb {
  driver = sql
  args = /etc/dovecot/dovecot-sql.conf
}

userdb {
  driver = sql
  args = /etc/dovecot/dovecot-sql.conf
}

service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0660
    user = postfix
    group = postfix
  }
}

service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    mode = 0600
    user = postfix
    group = postfix
  }
}

# Logging
log_path = /var/log/dovecot.log
info_log_path = /var/log/dovecot-info.log
EOF

# Configure Dovecot SQL
cat > /etc/dovecot/dovecot-sql.conf <<EOF
driver = mysql
connect = host=127.0.0.1 dbname=mailserver user=mailuser password=CHANGE_THIS_PASSWORD
default_pass_scheme = SHA512-CRYPT
password_query = SELECT email as user, password FROM virtual_users WHERE email='%u'
user_query = SELECT 5000 AS uid, 5000 AS gid, CONCAT('/var/mail/vhosts/',SUBSTRING_INDEX(email,'@',-1),'/',SUBSTRING_INDEX(email,'@',1)) AS home FROM virtual_users WHERE email='%u'
EOF

# Create mail user and directories
groupadd -g 5000 vmail
useradd -g vmail -u 5000 vmail -d /var/mail
mkdir -p /var/mail/vhosts/$DOMAIN
chown -R vmail:vmail /var/mail

# Configure OpenDKIM
cat > /etc/opendkim.conf <<EOF
Syslog yes
SyslogSuccess yes
Mode sv
Canonicalization relaxed/simple
Domain $DOMAIN
Selector mail
KeyFile /etc/opendkim/keys/$DOMAIN/mail.private
Socket local:/var/spool/postfix/var/run/opendkim/opendkim.sock
PidFile /var/run/opendkim/opendkim.pid
TrustedHosts 127.0.0.1
UserID opendkim:opendkim
EOF

# Generate DKIM keys
mkdir -p /etc/opendkim/keys/$DOMAIN
opendkim-genkey -s mail -d $DOMAIN -D /etc/opendkim/keys/$DOMAIN
chown -R opendkim:opendkim /etc/opendkim
chmod 600 /etc/opendkim/keys/$DOMAIN/mail.private

# Configure SPF
cat > /etc/postfix-policyd-spf-python/policyd-spf.conf <<EOF
debugLevel = 1
defaultSeedOnly = 1
HELO_reject = Fail
Mail_From_reject = Fail
EOF

# Restart services
systemctl restart postfix
systemctl restart dovecot
systemctl restart opendkim

# Enable services
systemctl enable postfix
systemctl enable dovecot
systemctl enable opendkim

echo "✅ Email server configuration complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Change MySQL password in all config files"
echo "2. Add DKIM record to DNS:"
cat /etc/opendkim/keys/$DOMAIN/mail.txt
echo ""
echo "3. Add SPF record to DNS:"
echo "   TXT @ \"v=spf1 ip4:YOUR_SERVER_IP -all\""
echo ""
echo "4. Add DMARC record to DNS:"
echo "   TXT _dmarc \"v=DMARC1; p=quarantine; rua=mailto:admin@$DOMAIN\""
echo ""
echo "5. Create email accounts using the provided script"