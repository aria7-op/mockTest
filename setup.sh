#!/bin/bash

# 🎯 Advanced Mock Test System Setup Script
# This script sets up the complete mock test system with Docker

set -e  # Exit on any error

echo "🚀 Starting Advanced Mock Test System Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    required_files=(
        "docker-compose.yml"
        "Dockerfile"
        "package.json"
        ".env.example"
        "prisma/schema.prisma"
        "src/server.js"
        "nginx/nginx.conf"
        "database/init.sql"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file not found: $file"
            exit 1
        fi
    done
    
    print_success "All required files are present"
}

# Setup environment file
setup_env() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please review and update .env file with your configuration"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "logs"
        "uploads"
        "backups"
        "nginx/ssl"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Generate SSL certificates for development
generate_ssl() {
    print_status "Generating SSL certificates for development..."
    
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        # Create self-signed certificate for development
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || {
            print_warning "Could not generate SSL certificates. Using HTTP only."
            # Modify nginx config to use HTTP only
            sed -i 's/listen 443 ssl http2;/# listen 443 ssl http2;/' nginx/nginx.conf
            sed -i 's/ssl_certificate/# ssl_certificate/' nginx/nginx.conf
            sed -i 's/ssl_certificate_key/# ssl_certificate_key/' nginx/nginx.conf
            sed -i 's/ssl_protocols/# ssl_protocols/' nginx/nginx.conf
            sed -i 's/ssl_ciphers/# ssl_ciphers/' nginx/nginx.conf
            sed -i 's/ssl_prefer_server_ciphers/# ssl_prefer_server_ciphers/' nginx/nginx.conf
            sed -i 's/ssl_session_cache/# ssl_session_cache/' nginx/nginx.conf
            sed -i 's/ssl_session_timeout/# ssl_session_timeout/' nginx/nginx.conf
            sed -i 's/add_header Strict-Transport-Security/# add_header Strict-Transport-Security/' nginx/nginx.conf
        }
    else
        print_success "SSL certificates already exist"
    fi
}

# Build and start Docker containers
start_containers() {
    print_status "Building and starting Docker containers..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    print_success "Docker containers started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U mock_test_user -d mock_test_db >/dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
            print_success "Redis is ready"
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Redis failed to start within 30 seconds"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    docker-compose exec -T app npx prisma generate
    
    # Run migrations
    docker-compose exec -T app npx prisma migrate deploy
    
    # Seed database
    docker-compose exec -T app npx prisma db seed
    
    print_success "Database setup completed"
}

# Check application health
check_health() {
    print_status "Checking application health..."
    
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            print_success "Application is healthy and running"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Application failed to start within 60 seconds"
        print_status "Checking container logs..."
        docker-compose logs app
        exit 1
    fi
}

# Display final information
display_info() {
    echo ""
    echo "🎉 Advanced Mock Test System Setup Complete!"
    echo ""
    echo "📊 Application URLs:"
    echo "   • API: http://localhost:3000/api"
    echo "   • Health Check: http://localhost:3000/health"
    echo "   • Prisma Studio: http://localhost:5555"
    echo ""
    echo "🔐 Default Login Credentials:"
    echo "   • Super Admin: admin@mocktest.com / Admin@123"
    echo "   • Admin: admin1@mocktest.com / Admin@123"
    echo "   • Moderator: moderator@mocktest.com / Admin@123"
    echo "   • Student: student1@example.com / Admin@123"
    echo ""
    echo "📁 Useful Commands:"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Stop services: docker-compose down"
    echo "   • Restart services: docker-compose restart"
    echo "   • Access database: docker-compose exec postgres psql -U mock_test_user -d mock_test_db"
    echo ""
    echo "⚠️  Security Notes:"
    echo "   • Change default passwords immediately"
    echo "   • Update environment variables for production"
    echo "   • Set up proper SSL certificates for production"
    echo ""
    print_success "Setup completed successfully!"
}

# Main setup function
main() {
    echo "🎯 Advanced Mock Test System Setup"
    echo "=================================="
    echo ""
    
    check_docker
    check_files
    setup_env
    create_directories
    generate_ssl
    start_containers
    wait_for_services
    setup_database
    check_health
    display_info
}

# Run main function
main "$@" 