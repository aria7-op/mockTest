# Backend Deployment Guide

This guide explains how to build and deploy your backend to an LXC container on your VPS.

## 🏗️ Build System

The backend now uses Webpack to create production builds that:
- Minify and optimize your code
- Bundle dependencies efficiently
- Keep source code secure (only compiled code is deployed)
- Target Node.js 18+ for optimal performance

## 📦 Available Scripts

### Development
```bash
npm run dev          # Start development server with nodemon
npm start           # Start development server
```

### Building
```bash
npm run build       # Build for development
npm run build:prod  # Build for production (minified)
npm run build:clean # Clean build directory and rebuild
```

### Production
```bash
npm run start:prod  # Start production server from dist/
```

## 🚀 Deployment Process

### 1. Build the Backend
```bash
# Create production build
npm run build:prod

# This creates a `dist/` folder with optimized code
```

### 2. Deploy to LXC Container
```bash
# Make sure the script is executable
chmod +x deploy.sh

# Deploy to your container
./deploy.sh
```

The deployment script will:
- Build the production version
- Copy only necessary files to the container
- Install production dependencies
- Set up PM2 for process management
- Start the application

### 3. Configure Caddy (on VPS host)
```bash
# Copy Caddyfile to your VPS
# Update the domain name in Caddyfile
# Restart Caddy
sudo systemctl restart caddy
```

## 🔧 Container Setup

### Prerequisites
- LXC container named "exam" running
- Container has internet access
- PM2 installed in container

### Container Structure
```
/opt/backend/
├── dist/           # Compiled application
├── prisma/         # Database schema and migrations
├── logs/           # Application logs
├── uploads/        # File uploads
├── package.json    # Dependencies
├── ecosystem.config.js  # PM2 configuration
└── .env            # Environment variables
```

## 🌐 Networking

### Port Forwarding
The backend runs on port 5000 inside the container. Caddy handles:
- HTTP/HTTPS termination
- SSL certificates (automatic with Let's Encrypt)
- Reverse proxy to container
- Load balancing (if multiple instances)

### Container IP
Update the Caddyfile with your container's actual IP address:
```bash
# Get container IP
lxc list exam
```

## 🔒 Security Features

- Source code never leaves your development machine
- Only compiled/minified code is deployed
- Environment variables are kept secure
- PM2 process management with auto-restart
- Health checks and monitoring

## 📊 Monitoring

### PM2 Commands
```bash
# Check status
lxc exec exam -- pm2 status

# View logs
lxc exec exam -- pm2 logs

# Restart application
lxc exec exam -- pm2 restart mock-test-backend
```

### Health Checks
- Endpoint: `/health`
- Caddy monitors container health
- Automatic failover if container is down

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (requires 18+)
2. **Container can't start**: Verify memory limits and storage
3. **Port forwarding issues**: Check iptables/firewall rules
4. **Database connection**: Verify .env configuration

### Debug Commands
```bash
# Check container status
lxc list exam

# Access container shell
lxc exec exam bash

# Check application logs
lxc exec exam -- pm2 logs

# Check container resources
lxc config show exam
```

## 🔄 Updates

To update your deployed backend:

1. Make changes to your source code
2. Run `npm run build:prod`
3. Run `./deploy.sh`
4. PM2 will automatically restart the application

## 📝 Environment Variables

Create a `.env` file in the container with:
- Database connection string
- JWT secrets
- API keys
- Production settings

Example:
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET="your-secret-key"
```

## 🎯 Next Steps

1. Set up your domain DNS
2. Configure Caddy with your domain
3. Set up SSL certificates
4. Configure database
5. Test the deployment

Your backend is now production-ready with a secure build system! 🎉 