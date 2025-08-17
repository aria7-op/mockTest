#!/bin/bash

# Development Load Balancer Monitor
# Designed for local development on 192.168.0.105

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Development Load Balancer Monitor${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check NGINX status
echo -e "${YELLOW}📊 NGINX Status:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "  ${GREEN}✅ NGINX is running${NC}"
    echo -e "  📍 Ports: $(sudo netstat -tlnp | grep nginx | awk '{print $4}' | sort | uniq | tr '\n' ' ')"
else
    echo -e "  ${RED}❌ NGINX is not running${NC}"
fi
echo ""

# Check Redis status
echo -e "${YELLOW}🔴 Redis Status:${NC}"
if pgrep -x "redis-server" > /dev/null; then
    echo -e "  ${GREEN}✅ Redis is running${NC}"
    echo -e "  📍 Port: 6379 (with authentication)"
else
    echo -e "  ${RED}❌ Redis is not running${NC}"
fi
echo ""

# Check backend servers
echo -e "${YELLOW}🖥️  Backend Servers:${NC}"
if curl -s http://192.168.0.105:5051/ > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Backend 1 (port 5051) is running${NC}"
else
    echo -e "  ${RED}❌ Backend 1 (port 5051) is not responding${NC}"
fi

if curl -s http://192.168.0.105:5052/ > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Backend 2 (port 5052) is running${NC}"
else
    echo -e "  ${RED}❌ Backend 2 (port 5052) is not responding${NC}"
fi
echo ""

# Test load balancer
echo -e "${YELLOW}⚖️  Load Balancer Test:${NC}"
echo -e "  🌐 Testing API proxy..."
for i in {1..3}; do
    response=$(curl -s http://192.168.0.105/api/test)
    if [[ $response == *"Backend Server"* ]]; then
        echo -e "    ${GREEN}✅ Request $i: $response${NC}"
    else
        echo -e "    ${RED}❌ Request $i failed${NC}"
    fi
done
echo ""

# Check SSL certificates
echo -e "${YELLOW}🔒 SSL Certificates:${NC}"
if [ -f "/etc/nginx/ssl/dev-cert.pem" ]; then
    echo -e "  ${GREEN}✅ SSL certificate exists${NC}"
    echo -e "  📅 Valid until: $(openssl x509 -in /etc/nginx/ssl/dev-cert.pem -noout -enddate | cut -d= -f2)"
else
    echo -e "  ${RED}❌ SSL certificate not found${NC}"
fi
echo ""

# System resources
echo -e "${YELLOW}💻 System Resources:${NC}"
echo -e "  🧠 Memory: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2 }') used"
echo -e "  💾 Disk: $(df -h / | awk 'NR==2{printf "%.1f%%", $5}') used"
echo -e "  🔥 Load: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')"
echo ""

# Network status
echo -e "${YELLOW}🌐 Network Status:${NC}"
echo -e "  🏠 Local IP: $(hostname -I | awk '{print $1}')"
echo -e "  🌍 External IP: $(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo "Not accessible")"
echo ""

echo -e "${BLUE}🎯 Load Balancer is ready for development!${NC}"
echo -e "${BLUE}   Access via: http://192.168.0.105 or https://192.168.0.105${NC}"
echo -e "${BLUE}   API proxy: http://192.168.0.105/api/*${NC}"
echo -e "${BLUE}   Health check: http://192.168.0.105/health${NC}" 