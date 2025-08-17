#!/bin/bash

# Simple Health Check for Development Load Balancer
# Returns HTTP 200 if healthy, 503 if unhealthy

# Check NGINX
if ! systemctl is-active --quiet nginx; then
    echo "HTTP/1.1 503 Service Unavailable"
    echo "Content-Type: text/plain"
    echo ""
    echo "NGINX is not running"
    exit 1
fi

# Check if we can reach at least one backend
if ! curl -s --max-time 5 http://192.168.0.105:5051/ > /dev/null 2>&1 && \
   ! curl -s --max-time 5 http://192.168.0.105:5052/ > /dev/null 2>&1; then
    echo "HTTP/1.1 503 Service Unavailable"
    echo "Content-Type: text/plain"
    echo ""
    echo "No backend servers are responding"
    exit 1
fi

# Check if load balancer is working
if ! curl -s --max-time 5 http://192.168.0.105/api/test > /dev/null 2>&1; then
    echo "HTTP/1.1 503 Service Unavailable"
    echo "Content-Type: text/plain"
    echo ""
    echo "Load balancer proxy is not working"
    exit 1
fi

# All checks passed
echo "HTTP/1.1 200 OK"
echo "Content-Type: text/plain"
echo ""
echo "healthy"
exit 0 