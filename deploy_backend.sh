#!/bin/bash

# Backend Deployment Script for LXC Container
# This script deploys your backend application to the LXC container

set -e

# Configuration
CONTAINER_NAME="backend-app"
BACKEND_SOURCE_DIR="src"
CONTAINER_APP_DIR="/opt/backend"

echo "🚀 Deploying backend to LXC container..."

# Check if container exists and is running
if ! lxc list | grep -q "$CONTAINER_NAME.*RUNNING"; then
    echo "❌ Container '$CONTAINER_NAME' is not running. Starting it..."
    lxc start "$CONTAINER_NAME"
    sleep 5
fi

echo "📦 Copying backend files to container..."

# Create a temporary tar file of the backend source
echo "📁 Creating archive of backend files..."
tar -czf backend.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='uploads/*' \
    --exclude='database/*.sql' \
    --exclude='prisma/migrations' \
    "$BACKEND_SOURCE_DIR" \
    package.json \
    package-lock.json \
    .env.example \
    prisma/schema.prisma

# Copy the archive to the container
echo "📤 Uploading to container..."
lxc file push backend.tar.gz "$CONTAINER_NAME$CONTAINER_APP_DIR/"

# Extract and set up in container
echo "🔧 Setting up backend in container..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cd $CONTAINER_APP_DIR
    
    # Extract the backend files
    tar -xzf backend.tar.gz
    rm backend.tar.gz
    
    # Install dependencies
    echo '📦 Installing Node.js dependencies...'
    npm install --production
    
    # Set up environment
    if [ -f .env.example ]; then
        echo '⚙️  Setting up environment variables...'
        cp .env.example .env
        echo 'Please edit .env file with your production values'
    fi
    
    # Set up Prisma
    if [ -f prisma/schema.prisma ]; then
        echo '🗄️  Setting up database...'
        npx prisma generate
        echo 'Run: npx prisma migrate deploy to apply migrations'
    fi
    
    # Set proper permissions
    chown -R root:root .
    chmod -R 755 .
    
    echo '✅ Backend setup completed!'
"

# Clean up local archive
rm -f backend.tar.gz

echo "🔐 Setting up environment variables..."
echo "Please edit the .env file in the container with your production values:"
echo "lxc exec $CONTAINER_NAME nano $CONTAINER_APP_DIR/.env"

echo "🗄️  Database setup:"
echo "1. Update .env with your database credentials"
echo "2. Run: lxc exec $CONTAINER_NAME -- bash -c 'cd $CONTAINER_APP_DIR && npx prisma migrate deploy'"

echo "🚀 Starting the backend..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cd $CONTAINER_APP_DIR
    
    # Start with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Set PM2 to start on boot
    pm2 startup
"

echo "📊 Checking application status..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cd $CONTAINER_APP_DIR
    pm2 status
    pm2 logs --lines 10
"

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 Container IP: $(lxc list | grep $CONTAINER_NAME | awk '{print $4}')"
echo "🔗 Backend URL: http://$(lxc list | grep $CONTAINER_NAME | awk '{print $4}'):5000"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: lxc exec $CONTAINER_NAME -- pm2 logs"
echo "  - Restart: lxc exec $CONTAINER_NAME -- pm2 restart backend"
echo "  - Status: lxc exec $CONTAINER_NAME -- pm2 status"
echo "  - Access container: lxc exec $CONTAINER_NAME bash" 