#!/bin/bash

# Check if the password parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <password>"
  exit 1
fi

PASSWORD=$1

# Navigate to the project directory
cd /home/leen/projects/ui/client

# Build the project with npm
npm install
npm run build

# Define server details
SERVER_IP="l1pi4"
REMOTE_DIR="react"

# Upload the build to the server using sshpass
sshpass -p "$PASSWORD" sftp pi@$SERVER_IP <<EOF
put -r build/* $REMOTE_DIR
bye
EOF

