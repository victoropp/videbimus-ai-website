#!/bin/bash

# Email Account Management Script for Vidibemus AI
# Create unlimited email addresses for your domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="vidibemus.ai"
MYSQL_USER="mailuser"
MYSQL_PASS="CHANGE_THIS_PASSWORD"
MYSQL_DB="mailserver"

# Function to create email account
create_email() {
    echo -e "${GREEN}Creating new email account${NC}"
    read -p "Enter email address (e.g., john@$DOMAIN): " EMAIL
    read -sp "Enter password: " PASSWORD
    echo

    # Validate email format
    if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@$DOMAIN$ ]]; then
        echo -e "${RED}Error: Invalid email format. Must be in format: user@$DOMAIN${NC}"
        exit 1
    fi

    # Hash the password
    HASH_PASS=$(doveadm pw -s SHA512-CRYPT -p "$PASSWORD")

    # Get domain ID
    DOMAIN_ID=$(mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB -se "SELECT id FROM virtual_domains WHERE name='$DOMAIN'")

    if [ -z "$DOMAIN_ID" ]; then
        echo -e "${RED}Error: Domain $DOMAIN not found in database${NC}"
        exit 1
    fi

    # Insert user into database
    mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB <<EOF
INSERT INTO virtual_users (domain_id, email, password)
VALUES ($DOMAIN_ID, '$EMAIL', '$HASH_PASS')
ON DUPLICATE KEY UPDATE password='$HASH_PASS';
EOF

    # Create maildir
    MAILDIR="/var/mail/vhosts/$DOMAIN/$(echo $EMAIL | cut -d@ -f1)"
    mkdir -p "$MAILDIR"
    chown -R vmail:vmail "$MAILDIR"

    echo -e "${GREEN}✅ Email account $EMAIL created successfully!${NC}"
    echo -e "${YELLOW}Email settings for client configuration:${NC}"
    echo "  IMAP Server: mail.$DOMAIN (Port 993, SSL/TLS)"
    echo "  SMTP Server: mail.$DOMAIN (Port 587, STARTTLS)"
    echo "  Username: $EMAIL"
    echo "  Password: [the password you entered]"
}

# Function to delete email account
delete_email() {
    echo -e "${YELLOW}Delete email account${NC}"
    read -p "Enter email address to delete: " EMAIL

    mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB <<EOF
DELETE FROM virtual_users WHERE email='$EMAIL';
EOF

    # Remove maildir
    MAILDIR="/var/mail/vhosts/$DOMAIN/$(echo $EMAIL | cut -d@ -f1)"
    if [ -d "$MAILDIR" ]; then
        rm -rf "$MAILDIR"
    fi

    echo -e "${GREEN}✅ Email account $EMAIL deleted${NC}"
}

# Function to list all email accounts
list_emails() {
    echo -e "${GREEN}Email accounts for $DOMAIN:${NC}"
    mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB -e "SELECT email FROM virtual_users WHERE domain_id=(SELECT id FROM virtual_domains WHERE name='$DOMAIN')"
}

# Function to change password
change_password() {
    echo -e "${YELLOW}Change email password${NC}"
    read -p "Enter email address: " EMAIL
    read -sp "Enter new password: " PASSWORD
    echo

    HASH_PASS=$(doveadm pw -s SHA512-CRYPT -p "$PASSWORD")

    mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB <<EOF
UPDATE virtual_users SET password='$HASH_PASS' WHERE email='$EMAIL';
EOF

    echo -e "${GREEN}✅ Password updated for $EMAIL${NC}"
}

# Function to create email alias
create_alias() {
    echo -e "${GREEN}Create email alias${NC}"
    read -p "Enter source email (e.g., info@$DOMAIN): " SOURCE
    read -p "Enter destination email: " DEST

    DOMAIN_ID=$(mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB -se "SELECT id FROM virtual_domains WHERE name='$DOMAIN'")

    mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB <<EOF
INSERT INTO virtual_aliases (domain_id, source, destination)
VALUES ($DOMAIN_ID, '$SOURCE', '$DEST');
EOF

    echo -e "${GREEN}✅ Alias created: $SOURCE → $DEST${NC}"
}

# Function to bulk create emails from CSV
bulk_create() {
    echo -e "${YELLOW}Bulk create email accounts from CSV${NC}"
    read -p "Enter CSV file path (format: email,password per line): " CSV_FILE

    if [ ! -f "$CSV_FILE" ]; then
        echo -e "${RED}Error: File not found${NC}"
        exit 1
    fi

    while IFS=',' read -r email password; do
        if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@$DOMAIN$ ]]; then
            HASH_PASS=$(doveadm pw -s SHA512-CRYPT -p "$password")
            DOMAIN_ID=$(mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB -se "SELECT id FROM virtual_domains WHERE name='$DOMAIN'")
            
            mysql -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB <<EOF
INSERT INTO virtual_users (domain_id, email, password)
VALUES ($DOMAIN_ID, '$email', '$HASH_PASS')
ON DUPLICATE KEY UPDATE password='$HASH_PASS';
EOF
            
            MAILDIR="/var/mail/vhosts/$DOMAIN/$(echo $email | cut -d@ -f1)"
            mkdir -p "$MAILDIR"
            chown -R vmail:vmail "$MAILDIR"
            
            echo -e "${GREEN}Created: $email${NC}"
        else
            echo -e "${RED}Skipped invalid: $email${NC}"
        fi
    done < "$CSV_FILE"
    
    echo -e "${GREEN}✅ Bulk creation complete${NC}"
}

# Function to test email sending
test_email() {
    echo -e "${YELLOW}Test email configuration${NC}"
    read -p "Enter FROM email address: " FROM
    read -p "Enter TO email address: " TO
    
    echo "Test email from Vidibemus AI" | mail -s "Test Email" -r "$FROM" "$TO"
    
    echo -e "${GREEN}✅ Test email sent from $FROM to $TO${NC}"
}

# Main menu
show_menu() {
    echo -e "\n${GREEN}=== Vidibemus AI Email Management ===${NC}"
    echo "1. Create email account"
    echo "2. Delete email account"
    echo "3. List all email accounts"
    echo "4. Change password"
    echo "5. Create email alias"
    echo "6. Bulk create from CSV"
    echo "7. Test email sending"
    echo "8. Exit"
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [1-8]: " choice

    case $choice in
        1) create_email ;;
        2) delete_email ;;
        3) list_emails ;;
        4) change_password ;;
        5) create_alias ;;
        6) bulk_create ;;
        7) test_email ;;
        8) echo "Goodbye!"; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
done