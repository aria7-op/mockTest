#!/bin/bash

# Development Load Balancer Deployment Script
# Designed for local development on 192.168.0.105

set -e

echo "🏠 Deploying Development Load Balancer for Local Network..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_IP="192.168.0.105"
LOCAL_NETWORK="192.168.0.0/24"
SYSTEM_USER="nginx"
CONFIG_DIR="/etc/nginx"
SSL_DIR="/etc/nginx/ssl"
LOG_DIR="/var/log/nginx"
CACHE_DIR="/var/cache/nginx"
WEB_ROOT="/var/www/html"
DEV_DIR="/var/www/dev"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

echo -e "${BLUE}📍 Local IP: ${LOCAL_IP}${NC}"
echo -e "${BLUE}🌐 Local Network: ${LOCAL_NETWORK}${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
apt-get install -y -qq \
    nginx \
    nginx-extras \
    curl \
    wget \
    git \
    htop \
    iotop \
    nethogs \
    iftop \
    redis-server \
    postgresql \
    postgresql-contrib \
    certbot \
    python3-certbot-nginx

# Create nginx user and group (if not exists)
echo -e "${YELLOW}👤 Setting up nginx user and directories...${NC}"
if ! id "$SYSTEM_USER" &>/dev/null; then
    useradd -r -s /bin/false -d /var/lib/nginx $SYSTEM_USER
fi

# Create directories
mkdir -p $CONFIG_DIR $SSL_DIR $LOG_DIR $CACHE_DIR $WEB_ROOT $DEV_DIR
chown -R $SYSTEM_USER:$SYSTEM_USER $LOG_DIR $CACHE_DIR $WEB_ROOT $DEV_DIR

# Stop nginx if running
echo -e "${YELLOW}🛑 Stopping existing nginx service...${NC}"
systemctl stop nginx 2>/dev/null || true

# Backup existing configuration
if [ -f "$CONFIG_DIR/nginx.conf" ]; then
    echo -e "${YELLOW}💾 Backing up existing nginx.conf...${NC}"
    cp $CONFIG_DIR/nginx.conf $CONFIG_DIR/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy development configuration
echo -e "${YELLOW}📋 Installing development configuration...${NC}"
cp nginx-dev.conf $CONFIG_DIR/nginx.conf

# Generate development SSL certificate
echo -e "${YELLOW}🔐 Generating development SSL certificate...${NC}"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/dev-key.pem \
    -out $SSL_DIR/dev-cert.pem \
    -subj "/C=US/ST=State/L=City/O=Development/CN=localhost"

# Create combined certificate for HAProxy compatibility
cat $SSL_DIR/dev-cert.pem $SSL_DIR/dev-key.pem > $SSL_DIR/dev-localhost.pem

chown $SYSTEM_USER:$SYSTEM_USER $SSL_DIR/*
chmod 600 $SSL_DIR/dev-key.pem
chmod 644 $SSL_DIR/dev-cert.pem
chmod 644 $SSL_DIR/dev-localhost.pem

# Create development web page
echo -e "${YELLOW}🌐 Creating development web page...${NC}"
cat > $WEB_ROOT/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Development Load Balancer</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .status { color: #4ade80; font-weight: bold; font-size: 1.2em; }
        .info { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0; }
        .endpoint { background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 5px 0; font-family: monospace; }
        h1 { text-align: center; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Development Load Balancer</h1>
        <p class="status">✅ System is running in development mode</p>
        
        <div class="info">
            <h3>📍 Local Network Configuration</h3>
            <p><strong>Local IP:</strong> ${LOCAL_IP}</p>
            <p><strong>Network:</strong> 192.168.0.0/24</p>
            <p><strong>Time:</strong> <span id="time"></span></p>
        </div>
        
        <div class="grid">
            <div class="info">
                <h3>🔌 API Endpoints</h3>
                <div class="endpoint">HTTP: http://${LOCAL_IP}/api/</div>
                <div class="endpoint">HTTPS: https://${LOCAL_IP}/api/</div>
                <div class="endpoint">WebSocket: ws://${LOCAL_IP}:8080/</div>
                <div class="endpoint">Health: /api/health</div>
            </div>
            
            <div class="info">
                <h3>📊 Monitoring</h3>
                <div class="endpoint">NGINX Status: /nginx_status</div>
                <div class="endpoint">Health Check: /health</div>
                <div class="endpoint">Dev Tools: /dev/</div>
            </div>
        </div>
        
        <div class="info">
            <h3>🚀 Development Features</h3>
            <ul>
                <li>✅ CORS enabled for local development</li>
                <li>✅ Longer timeouts for debugging</li>
                <li>✅ Lenient rate limiting</li>
                <li>✅ HTTP allowed (no HTTPS redirect)</li>
                <li>✅ Development SSL certificates</li>
                <li>✅ Local network IP support</li>
            </ul>
        </div>
        
        <div class="info">
            <h3>🔧 Next Steps</h3>
            <ol>
                <li>Configure your backend servers on 192.168.0.106, 192.168.0.107</li>
                <li>Set up Redis cluster on local network</li>
                <li>Configure PostgreSQL cluster</li>
                <li>Test load balancing with multiple backend instances</li>
                <li>Monitor performance with /nginx_status</li>
            </ol>
        </div>
    </div>
    
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
EOF

# Create development tools directory
echo -e "${YELLOW}🛠️ Creating development tools directory...${NC}"
cat > $DEV_DIR/README.md << EOF
# Development Tools Directory

This directory contains development and debugging tools for your load balancer.

## Available Tools:
- Network monitoring scripts
- Performance testing tools
- Configuration templates
- Health check scripts

## Quick Commands:
\`\`\`bash
# Check load balancer status
curl http://${LOCAL_IP}/health

# Check API health
curl http://${LOCAL_IP}/api/health

# Monitor nginx status
curl http://${LOCAL_IP}/nginx_status

# Test WebSocket connection
wscat -c ws://${LOCAL_IP}:8080/
\`\`\`
EOF

# Create health check script
cat > $DEV_DIR/health-check.sh << 'EOF'
#!/bin/bash
echo "🏥 Health Check for Development Load Balancer"
echo "=============================================="
echo "Time: $(date)"
echo ""

echo "📍 Local IP: 192.168.0.105"
echo ""

echo "🔌 HTTP Endpoints:"
curl -s http://192.168.0.105/health | head -1
curl -s http://192.168.0.105/api/health | head -1
echo ""

echo "🔒 HTTPS Endpoints:"
curl -k -s https://192.168.0.105/health | head -1
curl -k -s https://192.168.0.105/api/health | head -1
echo ""

echo "📊 NGINX Status:"
curl -s http://192.168.0.105/nginx_status | head -5
echo ""

echo "🌐 Network Status:"
ss -tuln | grep :80
ss -tuln | grep :443
ss -tuln | grep :8080
echo ""

echo "✅ Health check completed!"
EOF

chmod +x $DEV_DIR/health-check.sh

# Set permissions
chown -R $SYSTEM_USER:$SYSTEM_USER $WEB_ROOT $DEV_DIR

# Test configuration
echo -e "${YELLOW}🧪 Testing nginx configuration...${NC}"
nginx -t

# Start nginx service
echo -e "${YELLOW}🚀 Starting nginx service...${NC}"
systemctl enable nginx
systemctl start nginx

# Check status
echo -e "${YELLOW}📊 Checking service status...${NC}"
systemctl status nginx --no-pager

# Configure firewall for local network
echo -e "${YELLOW}🔥 Configuring firewall for local network...${NC}"
ufw allow from $LOCAL_NETWORK to any port 80
ufw allow from $LOCAL_NETWORK to any port 443
ufw allow from $LOCAL_NETWORK to any port 8080
ufw allow from $LOCAL_NETWORK to any port 8404
ufw allow from $LOCAL_NETWORK to any port 22
ufw --force enable

# Performance tuning for development
echo -e "${YELLOW}⚡ Tuning system performance for development...${NC}"

# Increase file descriptor limits
cat >> /etc/security/limits.conf << EOF
nginx soft nofile 65536
nginx hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Kernel tuning for development
cat >> /etc/sysctl.conf << EOF
# Network tuning for development
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_max_tw_buckets = 2000000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_timestamps = 1
net.ipv4.tcp_syncookies = 1

# Memory tuning for development
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# Apply kernel settings
sysctl -p

# Create development monitoring script
echo -e "${YELLOW}📊 Creating development monitoring script...${NC}"
cat > /usr/local/bin/dev-monitor.sh << 'EOF'
#!/bin/bash
echo "=== Development Load Balancer Monitor ==="
echo "Time: $(date)"
echo "Local IP: 192.168.0.105"
echo ""

echo "=== Service Status ==="
systemctl status nginx --no-pager | head -10
echo ""

echo "=== Development Endpoints ==="
echo "HTTP Health: $(curl -s http://192.168.0.105/health | head -1)"
echo "API Health: $(curl -s http://192.168.0.105/api/health | head -1)"
echo ""

echo "=== Connection Status ==="
ss -tuln | grep :80
ss -tuln | grep :443
ss -tuln | grep :8080
echo ""

echo "=== Process Status ==="
ps aux | grep nginx | grep -v grep
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Network Stats ==="
netstat -i
echo ""

echo "=== Active Connections ==="
netstat -an | grep :80 | wc -l
netstat -an | grep :443 | wc -l
netstat -an | grep :8080 | wc -l
echo ""

echo "=== Development Tools ==="
echo "Health Check: /var/www/dev/health-check.sh"
echo "Dev Directory: /var/www/dev/"
echo "Web Interface: http://192.168.0.105"
echo "Stats: http://192.168.0.105/nginx_status"
EOF

chmod +x /usr/local/bin/dev-monitor.sh

# Create log rotation
echo -e "${YELLOW}📝 Configuring log rotation...${NC}"
cat > /etc/logrotate.d/nginx-dev << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 640 $SYSTEM_USER adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}
EOF

echo -e "${GREEN}✅ Development Load Balancer deployed successfully!${NC}"
echo ""
echo -e "${GREEN}🌐 Access your development load balancer at:${NC}"
echo -e "   HTTP:  http://${LOCAL_IP}"
echo -e "   HTTPS: https://${LOCAL_IP}"
echo -e "   WebSocket: ws://${LOCAL_IP}:8080/"
echo ""
echo -e "${GREEN}📊 Monitor with:${NC}"
echo -e "   dev-monitor.sh"
echo -e "   /var/www/dev/health-check.sh"
echo ""
echo -e "${GREEN}🔧 Configuration files:${NC}"
echo -e "   Main config: $CONFIG_DIR/nginx.conf"
echo -e "   SSL certs: $SSL_DIR/"
echo -e "   Dev tools: $DEV_DIR/"
echo ""
echo -e "${GREEN}📝 Development Features:${NC}"
echo -e "   ✅ CORS enabled for local development"
echo -e "   ✅ HTTP allowed (no HTTPS redirect)"
echo -e "   ✅ Longer timeouts for debugging"
echo -e "   ✅ Lenient rate limiting"
echo -e "   ✅ Local network IP support"
echo ""
echo -e "${GREEN}🚀 Next Steps:${NC}"
echo -e "   1. Configure backend servers on 192.168.0.106, 192.168.0.107"
echo -e "   2. Set up Redis cluster on local network"
echo -e "   3. Configure PostgreSQL cluster"
echo -e "   4. Test load balancing with multiple instances"
echo -e "   5. Access /dev/ directory for development tools"
echo ""
echo -e "${GREEN}🔍 Quick Test:${NC}"
echo -e "   curl http://${LOCAL_IP}/health"
echo -e "   curl http://${LOCAL_IP}/api/health"
echo -e "   curl http://${LOCAL_IP}/nginx_status" 