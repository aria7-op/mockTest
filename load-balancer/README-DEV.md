# 🏠 Development Load Balancer for Local Network

## 🎯 **Overview**
Development-optimized load balancing solution designed for **local network development** on `192.168.0.105` with:
- **NGINX** (standard) or **HAProxy** configurations
- **Local network IP support** (192.168.0.0/24)
- **Development-friendly settings** (CORS, longer timeouts, lenient rate limiting)
- **HTTP allowed** (no HTTPS redirect for easier testing)
- **Local SSL certificates** for development

## 🏗️ **Development Architecture**

```
Local Network (192.168.0.0/24)
                ↓
        Load Balancer (192.168.0.105)
                ↓
        Backend Servers (192.168.0.106, 192.168.0.107)
                ↓
        Database & Redis (Local Network)
```

## 📁 **Development Files Structure**
```
load-balancer/
├── nginx-dev.conf          # NGINX development configuration
├── haproxy-dev.cfg         # HAProxy development configuration  
├── redis-cluster.conf      # Redis cluster configuration
├── deploy-dev.sh           # Development deployment script
├── README.md               # Production documentation
└── README-DEV.md           # This development guide
```

## 🚀 **Quick Start for Development**

### **Option 1: NGINX (Recommended for Development)**
```bash
# 1. Make script executable
sudo chmod +x load-balancer/deploy-dev.sh

# 2. Run development deployment
sudo ./load-balancer/deploy-dev.sh

# 3. Access your load balancer
curl http://192.168.0.105/health
```

### **Option 2: HAProxy**
```bash
# Install HAProxy
sudo apt update
sudo apt install haproxy

# Copy development configuration
sudo cp load-balancer/haproxy-dev.cfg /etc/haproxy/haproxy.cfg

# Test configuration
sudo haproxy -f /etc/haproxy/haproxy.cfg -c

# Start service
sudo systemctl enable haproxy
sudo systemctl start haproxy
```

## 🌐 **Development Server Configuration**

### **Load Balancer (Main)**
- **IP**: 192.168.0.105
- **Ports**: 80 (HTTP), 443 (HTTPS), 8080 (WebSocket), 8404 (Stats)

### **Backend Servers (Optional for Development)**
- **Primary**: 192.168.0.106:5050, 192.168.0.107:5050
- **Backup**: 192.168.0.108:5050, 192.168.0.109:5050

### **Database & Redis (Optional for Development)**
- **PostgreSQL**: 192.168.0.106:5432, 192.168.0.107:5432
- **Redis**: 192.168.0.106:6379, 192.168.0.107:6379

## 🔧 **Development Features**

### **Development-Optimized Settings**
- ✅ **CORS enabled** for local development
- ✅ **HTTP allowed** (no HTTPS redirect)
- ✅ **Longer timeouts** for debugging (30s connect, 300s server)
- ✅ **Lenient rate limiting** (50,000 req/s global, 25,000 req/s API)
- ✅ **Local network IP support** (192.168.0.0/24)
- ✅ **Development SSL certificates** (self-signed)

### **Security Headers (Development Friendly)**
- **X-Frame-Options**: SAMEORIGIN (allows iframe in same origin)
- **Content-Security-Policy**: Includes 'unsafe-inline' and 'unsafe-eval'
- **CORS**: Access-Control-Allow-Origin: *

## 📊 **Development Monitoring**

### **Health Check Endpoints**
- **Load Balancer**: `http://192.168.0.105/health`
- **API Health**: `http://192.168.0.105/api/health`
- **NGINX Status**: `http://192.168.0.105/nginx_status`
- **HAProxy Stats**: `http://192.168.0.105:8404/stats`

### **Monitoring Commands**
```bash
# Development monitoring
dev-monitor.sh

# Health check
/var/www/dev/health-check.sh

# Real-time stats
watch -n 1 'netstat -an | grep :80 | wc -l'

# Performance metrics
htop
iotop
nethogs
```

## 🛠️ **Development Tools**

### **Built-in Tools**
- **Health Check Script**: `/var/www/dev/health-check.sh`
- **Development Directory**: `/var/www/dev/`
- **Web Interface**: `http://192.168.0.105`
- **Configuration Templates**: Available in `/var/www/dev/`

### **Quick Test Commands**
```bash
# Test HTTP endpoints
curl http://192.168.0.105/health
curl http://192.168.0.105/api/health
curl http://192.168.0.105/nginx_status

# Test HTTPS endpoints (ignore SSL warnings)
curl -k https://192.168.0.105/health
curl -k https://192.168.0.105/api/health

# Test WebSocket (if wscat is installed)
wscat -c ws://192.168.0.105:8080/
```

## 🔍 **Development Troubleshooting**

### **Common Development Issues**
1. **Port Already in Use**: Check if nginx/apache is running on port 80
2. **Permission Denied**: Ensure script is run as root
3. **SSL Certificate Warnings**: Normal for development (self-signed)
4. **Firewall Blocking**: Check UFW status and local network rules

### **Debug Commands**
```bash
# Check nginx configuration
nginx -t

# Check service status
systemctl status nginx

# View real-time logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check listening ports
ss -tuln | grep :80
ss -tuln | grep :443
ss -tuln | grep :8080

# Test local network connectivity
ping 192.168.0.105
curl -I http://192.168.0.105
```

## 📝 **Development Workflow**

### **1. Initial Setup**
```bash
# Deploy development load balancer
sudo ./load-balancer/deploy-dev.sh

# Verify deployment
curl http://192.168.0.105/health
```

### **2. Configure Backend Servers**
```bash
# On 192.168.0.106 and 192.168.0.107
# Start your Node.js/Express servers on port 5050
# Ensure they have /health endpoint
```

### **3. Test Load Balancing**
```bash
# Test multiple requests
for i in {1..10}; do
  curl http://192.168.0.105/api/health
  sleep 1
done
```

### **4. Monitor Performance**
```bash
# Real-time monitoring
dev-monitor.sh

# Check nginx status
curl http://192.168.0.105/nginx_status
```

## 🚀 **Scaling for Development**

### **Single Machine Development**
- **All services on 192.168.0.105**
- **Different ports** for different services
- **Docker containers** for isolation

### **Local Network Development**
- **Load balancer**: 192.168.0.105
- **Backend 1**: 192.168.0.106:5050
- **Backend 2**: 192.168.0.107:5050
- **Database**: 192.168.0.106:5432
- **Redis**: 192.168.0.106:6379

### **Docker Development**
```bash
# Create docker-compose.yml for local development
# Run multiple backend instances
# Use nginx reverse proxy
```

## 🔄 **Moving to Production**

### **When Ready for Production**
1. **Update IP addresses** in production configs
2. **Enable HTTPS redirect** (remove HTTP allow)
3. **Tighten rate limiting** (reduce limits)
4. **Use real SSL certificates** (Let's Encrypt)
5. **Enable security headers** (strict CSP)
6. **Configure monitoring** (Prometheus + Grafana)

### **Configuration Migration**
```bash
# Backup development config
cp /etc/nginx/nginx.conf /etc/nginx/nginx-dev.conf

# Install production config
cp load-balancer/nginx-plus.conf /etc/nginx/nginx.conf

# Test and reload
nginx -t && systemctl reload nginx
```

## 📚 **Development Resources**

### **Useful Commands**
- **`dev-monitor.sh`**: Comprehensive development monitoring
- **`/var/www/dev/health-check.sh`**: Quick health check
- **`nginx -t`**: Test nginx configuration
- **`systemctl reload nginx`**: Reload without downtime

### **Configuration Files**
- **Main Config**: `/etc/nginx/nginx.conf`
- **SSL Certificates**: `/etc/nginx/ssl/`
- **Development Tools**: `/var/www/dev/`
- **Logs**: `/var/log/nginx/`

---

## 🎯 **Quick Development Checklist**

- [ ] **Deploy load balancer**: `sudo ./deploy-dev.sh`
- [ ] **Verify health**: `curl http://192.168.0.105/health`
- [ ] **Check endpoints**: HTTP, HTTPS, WebSocket
- [ ] **Configure backend servers** (optional)
- [ ] **Test load balancing** (optional)
- [ ] **Monitor performance**: `dev-monitor.sh`

**🚀 Your development load balancer is ready for local network development!** 