#!/bin/bash

# Backend Deployment Script for LXC Container
# This script builds the backend and deploys it to the LXC container

set -e

# Configuration
CONTAINER_NAME="exam"
BACKEND_SOURCE_DIR="src"
CONTAINER_APP_DIR="/opt/backend"
BUILD_DIR="dist"

echo "🚀 Building and deploying backend to LXC container..."

# Check if container exists and is running
if ! lxc list | grep -q "$CONTAINER_NAME.*RUNNING"; then
    echo "❌ Container '$CONTAINER_NAME' is not running. Starting it..."
    lxc start "$CONTAINER_NAME"
    sleep 5
fi

# Build the production version
echo "🔨 Building production version..."
npm run build:clean

# Create logs directory in container
echo "📁 Setting up container directories..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    mkdir -p $CONTAINER_APP_DIR
    mkdir -p $CONTAINER_APP_DIR/logs
    mkdir -p $CONTAINER_APP_DIR/uploads
"

# Copy only the built files and necessary production files
echo "📦 Copying production files to container..."

# Copy built application
lxc file push -r "$BUILD_DIR/" "$CONTAINER_NAME$CONTAINER_APP_DIR/"

# Copy package files
lxc file push package.json "$CONTAINER_NAME$CONTAINER_APP_DIR/"
lxc file push package-lock.json "$CONTAINER_NAME$CONTAINER_APP_DIR/"

# Copy Prisma schema and migrations
lxc file push -r prisma/ "$CONTAINER_NAME$CONTAINER_APP_DIR/"

# Copy ecosystem config
lxc file push ecosystem.config.js "$CONTAINER_NAME$CONTAINER_APP_DIR/"

# Copy environment template
if [ -f env.template ]; then
    lxc file push env.template "$CONTAINER_NAME$CONTAINER_APP_DIR/"
fi

# Set up the backend in container
echo "🔧 Setting up backend in container..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cd $CONTAINER_APP_DIR
    
    # Install production dependencies only
    echo '📦 Installing production dependencies...'
    npm ci --only=production
    
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
    chmod 644 .env 2>/dev/null || true
    
    echo '✅ Backend setup completed!'
"

# Clean up local build
echo "🧹 Cleaning up local build files..."
rm -rf "$BUILD_DIR"

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
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Set PM2 to start on boot
    pm2 startup
"

echo "📊 Checking application status..."
lxc exec "$CONTAINER_NAME" -- bash -c "
    cd $CONTAINER_APP_DIR
    pm2 status
    pm2 logs --lines 5
"

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 Container IP: $(lxc list | grep $CONTAINER_NAME | awk '{print $4}')"
echo "🔗 Backend URL: http://$(lxc list | grep $CONTAINER_NAME | awk '{print $4}'):5000"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: lxc exec $CONTAINER_NAME -- pm2 logs"
echo "  - Restart: lxc exec $CONTAINER_NAME -- pm2 restart mock-test-backend"
echo "  - Status: lxc exec $CONTAINER_NAME -- pm2 status"
echo "  - Access container: lxc exec $CONTAINER_NAME bash"
echo ""
echo "🔒 Security note: Only compiled/minified code has been deployed, source code remains secure." 