#!/bin/bash

# Backend LXC Container Creation Script
# This script creates an LXC container optimized for Node.js backend hosting

set -e

# Configuration
CONTAINER_NAME="backend-app"
CONTAINER_IP="10.0.0.100"
CONTAINER_MEMORY="2GB"
CONTAINER_STORAGE="10GB"
CONTAINER_CPU="2"
UBUNTU_VERSION="22.04"

echo "🚀 Creating LXC container for backend hosting..."

# Check if LXC is installed
if ! command -v lxc &> /dev/null; then
    echo "❌ LXC is not installed. Installing LXC..."
    sudo apt update
    sudo apt install -y lxc lxc-utils lxc-templates
fi

# Check if container already exists
if lxc list | grep -q "$CONTAINER_NAME"; then
    echo "⚠️  Container '$CONTAINER_NAME' already exists. Stopping and removing..."
    lxc stop "$CONTAINER_NAME" 2>/dev/null || true
    lxc delete "$CONTAINER_NAME"
fi

echo "📦 Creating container '$CONTAINER_NAME'..."

# Create the container with Ubuntu 22.04
lxc launch ubuntu:$UBUNTU_VERSION "$CONTAINER_NAME" \
    --config limits.memory="$CONTAINER_MEMORY" \
    --config limits.cpu="$CONTAINER_CPU" \
    --config limits.disk="$CONTAINER_STORAGE"

echo "⏳ Waiting for container to start..."
sleep 10

# Configure container resources
echo "⚙️  Configuring container resources..."
lxc config set "$CONTAINER_NAME" limits.memory "$CONTAINER_MEMORY"
lxc config set "$CONTAINER_NAME" limits.cpu "$CONTAINER_CPU"

# Set up networking (optional - uncomment if you want to set a specific IP)
# echo "🌐 Configuring networking..."
# lxc config device set "$CONTAINER_NAME" eth0 ipv4.address "$CONTAINER_IP"

echo "📋 Container configuration:"
lxc config show "$CONTAINER_NAME"

echo "🔧 Installing essential packages in container..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    apt update && apt upgrade -y
    apt install -y curl wget git vim nano htop
    apt install -y nodejs npm
    apt install -y postgresql-client
    apt install -y nginx
    apt install -y certbot python3-certbot-nginx
    npm install -g pm2
    npm install -g yarn
"

echo "🔑 Setting up SSH access..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    apt install -y openssh-server
    systemctl enable ssh
    systemctl start ssh
    mkdir -p /root/.ssh
    echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
    echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config
    systemctl restart ssh
"

echo "📁 Creating application directories..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    mkdir -p /opt/backend
    mkdir -p /var/log/backend
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled
"

echo "📝 Setting up Nginx configuration..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cat > /etc/nginx/sites-available/backend << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
"

echo "📊 Setting up PM2 ecosystem file..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cat > /opt/backend/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/backend/err.log',
    out_file: '/var/log/backend/out.log',
    log_file: '/var/log/backend/combined.log',
    time: true
  }]
};
EOF
"

echo "🔐 Setting up firewall..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 5000/tcp
    ufw --force enable
"

echo "📋 Container information:"
echo "Container Name: $CONTAINER_NAME"
echo "Memory Limit: $CONTAINER_MEMORY"
echo "CPU Limit: $CONTAINER_CPU"
echo "Storage Limit: $CONTAINER_STORAGE"
echo "Status: $(lxc list | grep $CONTAINER_NAME | awk '{print $2}')"

echo ""
echo "🎯 Next steps:"
echo "1. Access container: lxc exec $CONTAINER_NAME bash"
echo "2. Copy your backend code to /opt/backend/"
echo "3. Install dependencies: npm install"
echo "4. Set up environment variables"
echo "5. Start with PM2: pm2 start ecosystem.config.js"
echo "6. Set up SSL with Let's Encrypt"
echo ""
echo "✅ Container '$CONTAINER_NAME' created successfully!"
echo "🌐 Container IP: $(lxc list | grep $CONTAINER_NAME | awk '{print $4}')" 