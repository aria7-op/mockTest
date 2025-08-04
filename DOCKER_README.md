# Mock Exam System - Docker Setup

This document explains how to run the Mock Exam System using Docker containers. This setup includes everything needed to run the application: database, backend API, and frontend.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd mock
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

4. **Default credentials**:
   - Email: `admin@mockexam.com`
   - Password: `admin123`

## Services Overview

### 1. PostgreSQL Database (`postgres`)
- **Port**: 5432
- **Database**: `mock_exam_db`
- **User**: `mock_user`
- **Password**: `mock_password`
- **Volume**: `postgres_data` (persistent data)

### 2. Backend API (`backend`)
- **Port**: 5000
- **Environment**: Production
- **Dependencies**: PostgreSQL
- **Features**: 
  - User authentication
  - Exam management
  - Question handling
  - Results processing
  - Certificate generation

### 3. Frontend (`frontend`)
- **Port**: 3000
- **Framework**: React + Vite
- **Features**:
  - User interface
  - Exam taking interface
  - Results display
  - Certificate viewing

### 4. Nginx Reverse Proxy (`nginx`) - Optional
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**:
  - Load balancing
  - SSL termination
  - Static file serving

## Docker Commands

### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up -d postgres
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f backend
```

### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U mock_user -d mock_exam_db

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

## Environment Variables

### Backend Environment
```env
NODE_ENV=production
DATABASE_URL=postgresql://mock_user:mock_password@postgres:5432/mock_exam_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

### Frontend Environment
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Data Persistence

- **Database**: Data is stored in a Docker volume (`postgres_data`)
- **Uploads**: Files are stored in `./uploads` directory
- **Logs**: Application logs are stored in `./logs` directory

## Development vs Production

### Development
```bash
# Start with development settings
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Production
```bash
# Start with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5000
   lsof -i :5432
   ```

2. **Database connection issues**:
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U mock_user -d mock_exam_db
   ```

3. **Service not starting**:
   ```bash
   # Check service logs
   docker-compose logs <service-name>
   
   # Check service status
   docker-compose ps
   ```

4. **Permission issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER ./uploads ./logs
   ```

### Reset Everything
```bash
# Stop all services and remove everything
docker-compose down -v --remove-orphans
docker system prune -a
docker volume prune

# Start fresh
docker-compose up -d
```

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Enable HTTPS** in production
4. **Restrict database access**
5. **Regular security updates**

## Monitoring

### Health Checks
- Backend: `http://localhost:5000/api/v1/health`
- Frontend: `http://localhost:3000/health`
- Database: Built-in PostgreSQL health check

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## Backup and Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U mock_user mock_exam_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U mock_user -d mock_exam_db < backup.sql
```

## Performance Optimization

1. **Database**: Add indexes for frequently queried columns
2. **Backend**: Enable caching (Redis)
3. **Frontend**: Enable compression and caching
4. **Nginx**: Configure load balancing and caching

## Support

For issues and questions:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check network connectivity between services
4. Ensure all prerequisites are met 