#!/bin/bash

# Enterprise NGINX Plus Load Balancer Deployment Script
# Designed for 100M+ requests per minute

set -e

echo "🚀 Deploying Enterprise NGINX Plus Load Balancer..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NGINX_VERSION="1.25.0"
NGINX_PLUS_VERSION="r31"
SYSTEM_USER="nginx"
CONFIG_DIR="/etc/nginx"
SSL_DIR="/etc/nginx/ssl"
LOG_DIR="/var/log/nginx"
CACHE_DIR="/var/cache/nginx"
WEB_ROOT="/var/www/html"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
apt-get install -y -qq \
    build-essential \
    libpcre3-dev \
    libssl-dev \
    zlib1g-dev \
    libgd-dev \
    libxml2-dev \
    libxslt1-dev \
    libgeoip-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libfreetype6-dev \
    curl \
    wget \
    git \
    htop \
    iotop \
    nethogs \
    iftop

# Create nginx user and group
echo -e "${YELLOW}👤 Creating nginx user and directories...${NC}"
if ! id "$SYSTEM_USER" &>/dev/null; then
    useradd -r -s /bin/false -d /var/lib/nginx $SYSTEM_USER
fi

# Create directories
mkdir -p $CONFIG_DIR $SSL_DIR $LOG_DIR $CACHE_DIR $WEB_ROOT
chown -R $SYSTEM_USER:$SYSTEM_USER $LOG_DIR $CACHE_DIR $WEB_ROOT

# Download and install NGINX Plus (Enterprise)
echo -e "${YELLOW}📥 Installing NGINX Plus...${NC}"
cd /tmp

# Note: You need to download NGINX Plus from your F5 account
# This is a placeholder - replace with actual download
echo -e "${YELLOW}⚠️  Please download NGINX Plus from your F5 account and place it in /tmp${NC}"
echo -e "${YELLOW}📁 Expected file: nginx-plus-${NGINX_PLUS_VERSION}.tar.gz${NC}"

# Wait for user to download
read -p "Press Enter after downloading NGINX Plus to /tmp..."

if [ ! -f "/tmp/nginx-plus-${NGINX_PLUS_VERSION}.tar.gz" ]; then
    echo -e "${RED}❌ NGINX Plus package not found!${NC}"
    exit 1
fi

# Extract and install
tar -xzf nginx-plus-${NGINX_PLUS_VERSION}.tar.gz
cd nginx-plus-${NGINX_PLUS_VERSION}

# Configure NGINX
echo -e "${YELLOW}⚙️  Configuring NGINX...${NC}"
./configure \
    --prefix=$CONFIG_DIR \
    --sbin-path=/usr/sbin/nginx \
    --conf-path=$CONFIG_DIR/nginx.conf \
    --error-log-path=$LOG_DIR/error.log \
    --http-log-path=$LOG_DIR/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=$CACHE_DIR/client_temp \
    --http-proxy-temp-path=$CACHE_DIR/proxy_temp \
    --http-fastcgi-temp-path=$CACHE_DIR/fastcgi_temp \
    --http-uwsgi-temp-path=$CACHE_DIR/uwsgi_temp \
    --http-scgi-temp-path=$CACHE_DIR/scgi_temp \
    --user=$SYSTEM_USER \
    --group=$SYSTEM_USER \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_addition_module \
    --with-http_sub_module \
    --with-http_dav_module \
    --with-http_flv_module \
    --with-http_mp4_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_random_index_module \
    --with-http_secure_link_module \
    --with-http_stub_status_module \
    --with-http_auth_request_module \
    --with-http_xslt_module \
    --with-http_image_filter_module \
    --with-http_geoip_module \
    --with-http_perl_module \
    --with-threads \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_ssl_preread_module \
    --with-http_slice_module \
    --with-file-aio \
    --with-http_v2_module \
    --with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector --param=ssp-buffer-size=4 -m64 -mtune=generic' \
    --with-ld-opt='-Wl,-z,relro'

# Compile and install
echo -e "${YELLOW}🔨 Compiling NGINX...${NC}"
make -j$(nproc)
make install

# Create systemd service
echo -e "${YELLOW}🔧 Creating systemd service...${NC}"
cat > /etc/systemd/system/nginx.service << EOF
[Unit]
Description=The nginx HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP \$MAINPID
KillSignal=SIGQUIT
TimeoutStopSec=5
KillMode=process
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Copy configuration
echo -e "${YELLOW}📋 Installing configuration...${NC}"
cp nginx-plus.conf $CONFIG_DIR/nginx.conf

# Generate self-signed SSL certificate (replace with real cert in production)
echo -e "${YELLOW}🔐 Generating SSL certificate...${NC}"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SSL_DIR/key.pem \
    -out $SSL_DIR/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"

chown $SYSTEM_USER:$SYSTEM_USER $SSL_DIR/*
chmod 600 $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem

# Create basic web page
echo -e "${YELLOW}🌐 Creating basic web page...${NC}"
cat > $WEB_ROOT/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Load Balancer Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { color: green; font-weight: bold; }
    </style>
</head>
<body>
    <h1>🚀 Enterprise Load Balancer</h1>
    <p class="status">✅ System is running</p>
    <p>Designed for 100M+ requests per minute</p>
    <p>Time: <span id="time"></span></p>
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
EOF

# Set permissions
chown -R $SYSTEM_USER:$SYSTEM_USER $WEB_ROOT

# Test configuration
echo -e "${YELLOW}🧪 Testing configuration...${NC}"
/usr/sbin/nginx -t

# Enable and start service
echo -e "${YELLOW}🚀 Starting NGINX service...${NC}"
systemctl daemon-reload
systemctl enable nginx
systemctl start nginx

# Check status
echo -e "${YELLOW}📊 Checking service status...${NC}"
systemctl status nginx --no-pager

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

# Performance tuning
echo -e "${YELLOW}⚡ Tuning system performance...${NC}"

# Increase file descriptor limits
cat >> /etc/security/limits.conf << EOF
nginx soft nofile 65536
nginx hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Kernel tuning
cat >> /etc/sysctl.conf << EOF
# Network tuning
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

# Memory tuning
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# Apply kernel settings
sysctl -p

# Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > /usr/local/bin/nginx-monitor.sh << 'EOF'
#!/bin/bash
echo "=== NGINX Load Balancer Status ==="
echo "Time: $(date)"
echo ""

echo "=== Service Status ==="
systemctl status nginx --no-pager | head -10
echo ""

echo "=== Connection Status ==="
ss -tuln | grep :80
ss -tuln | grep :443
echo ""

echo "=== Process Status ==="
ps aux | grep nginx | grep -v grep
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== Network Stats ==="
netstat -i
echo ""

echo "=== Active Connections ==="
netstat -an | grep :80 | wc -l
netstat -an | grep :443 | wc -l
EOF

chmod +x /usr/local/bin/nginx-monitor.sh

# Create log rotation
echo -e "${YELLOW}📝 Configuring log rotation...${NC}"
cat > /etc/logrotate.d/nginx << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 52
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

echo -e "${GREEN}✅ Enterprise NGINX Plus Load Balancer deployed successfully!${NC}"
echo ""
echo -e "${GREEN}🌐 Access your load balancer at:${NC}"
echo -e "   HTTP:  http://$(curl -s ifconfig.me)"
echo -e "   HTTPS: https://$(curl -s ifconfig.me)"
echo ""
echo -e "${GREEN}📊 Monitor with:${NC}"
echo -e "   nginx-monitor.sh"
echo ""
echo -e "${GREEN}🔧 Configuration files:${NC}"
echo -e "   Main config: $CONFIG_DIR/nginx.conf"
echo -e "   SSL certs: $SSL_DIR/"
echo ""
echo -e "${GREEN}📝 Next steps:${NC}"
echo -e "   1. Update SSL certificates with real ones"
echo -e "   2. Configure your domain in nginx.conf"
echo -e "   3. Set up monitoring and alerting"
echo -e "   4. Configure backup servers"
echo -e "   5. Set up Redis cluster for sessions" 