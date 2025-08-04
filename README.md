# 🎯 Advanced Mock Test System

A highly professional and advanced mock test web application built with Node.js, Express, PostgreSQL, and React. This system provides a complete solution for creating, managing, and taking mock tests with advanced question randomization and comprehensive analytics.

## 🚀 Features

### 🔐 Authentication & Security
- **Role-based Access Control**: SUPER_ADMIN, ADMIN, MODERATOR, STUDENT roles
- **JWT Authentication** with refresh tokens
- **Account Security**: Failed login attempts tracking, account locking
- **Email Verification** and password reset functionality
- **Session Management** with Redis
- **Rate Limiting** and request throttling
- **Security Headers** and CORS protection

### 📊 Advanced Question System
- **Multiple Question Types**: Multiple choice, single choice, true/false, fill-in-the-blank, short answer, essay, matching, ordering
- **Difficulty Levels**: Easy, Medium, Hard, Expert
- **Advanced Randomization**: 4 different algorithms (weighted, difficulty-balanced, usage-based, adaptive)
- **Configurable Overlap Control**: Percentage-based question overlap between students
- **Question Analytics**: Usage tracking, success rates, average time
- **Bulk Import/Export**: CSV, JSON, XLSX support

### 🎯 Exam Management
- **Exam Categories**: Organized subject management
- **Flexible Exam Settings**: Duration, passing marks, retakes, randomization
- **Scheduling**: Start/end dates, time windows
- **Pricing**: Configurable pricing with multiple currencies
- **Results Display**: Configurable result visibility and answer explanations

### 📈 Advanced Scoring System
- **Separate Score Tables**: QuestionScore, ExamScore, UserPerformance
- **Detailed Analytics**: Time analysis, difficulty breakdown, performance metrics
- **Advanced Metrics**: Percentile ranking, improvement tracking, consistency scores
- **Real-time Scoring**: Immediate feedback and detailed breakdowns

### 💰 Revenue Tracking
- **Payment Integration**: Stripe ready (payment system to be implemented)
- **Revenue Analytics**: Detailed financial reporting
- **Transaction History**: Complete payment tracking

### 🔍 Comprehensive Analytics
- **User Analytics**: Performance tracking, learning curves
- **Exam Analytics**: Success rates, difficulty analysis
- **System Analytics**: Health monitoring, performance metrics
- **Real-time Dashboard**: Live statistics and monitoring

### 📧 Communication System
- **Email Notifications**: Welcome, results, reminders, system announcements
- **In-app Notifications**: Real-time notifications
- **Bulk Messaging**: Mass communication to users

### 🛡️ System Administration
- **Audit Logging**: Complete action tracking
- **System Health Monitoring**: Database, Redis, storage checks
- **Backup System**: Automated backups with encryption
- **Data Export**: Multiple format support
- **Maintenance Mode**: System maintenance capabilities

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, Rate Limiting

### Frontend Stack (Coming Soon)
- **Framework**: React 18+ with Vite
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI or Tailwind CSS
- **Real-time**: Socket.io
- **Charts**: Chart.js or D3.js

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL
- **Process Management**: PM2 (production)
- **Monitoring**: Health checks and logging

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mock-test-system
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Start with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:3000/api
# Prisma Studio: http://localhost:5555
```

### 4. Database Setup
```bash
# Generate Prisma client
docker-compose exec app npx prisma generate

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npx prisma db seed
```

### 5. Default Credentials
- **Super Admin**: admin@mocktest.com / Admin@123
- **Admin**: admin1@mocktest.com / Admin@123
- **Moderator**: moderator@mocktest.com / Admin@123
- **Students**: student1@example.com / Admin@123

## 📁 Project Structure

```
mock-test-system/
├── src/
│   ├── controllers/          # Request handlers
│   ├── services/            # Business logic
│   ├── middleware/          # Express middleware
│   ├── validators/          # Input validation
│   ├── routes/              # API routes
│   └── config/              # Configuration files
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── database/
│   └── init.sql            # Initial data
├── nginx/
│   └── nginx.conf          # Nginx configuration
├── docker-compose.yml      # Docker services
├── Dockerfile              # Application container
└── package.json            # Dependencies
```

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Docker Commands
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec app npm run dev
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin-only user creation
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile

### Admin Endpoints
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - Get all users
- `POST /api/admin/exam-categories` - Create exam category
- `POST /api/admin/questions` - Create question
- `POST /api/admin/exams` - Create exam

### Student Endpoints
- `GET /api/exams/available` - Get available exams
- `POST /api/exams/:examId/start` - Start exam
- `POST /api/exams/attempts/:attemptId/responses` - Submit answer
- `POST /api/exams/attempts/:attemptId/complete` - Complete exam
- `GET /api/exams/history` - Get exam history

### Booking Endpoints
- `POST /api/bookings` - Create exam booking
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings/:bookingId/start-exam` - Start booked exam

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **Rate Limiting** to prevent abuse
- **Input Validation** with Joi schemas
- **SQL Injection Protection** with Prisma ORM
- **XSS Protection** with security headers
- **CORS Configuration** for cross-origin requests
- **Audit Logging** for security monitoring

## 📈 Performance Features

- **Database Indexing** for optimal queries
- **Redis Caching** for session and data caching
- **Connection Pooling** with Prisma
- **Gzip Compression** with Nginx
- **Static File Serving** with caching headers
- **Load Balancing** ready with Nginx upstream

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Configure production environment
2. **SSL Certificates**: Set up SSL certificates for Nginx
3. **Database**: Use managed PostgreSQL service
4. **Redis**: Use managed Redis service
5. **Monitoring**: Set up application monitoring
6. **Backup**: Configure automated backups

### Environment Variables
```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://host:port

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

- [ ] Frontend React application
- [ ] Payment system integration (Stripe)
- [ ] Real-time notifications (Socket.io)
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] AI-powered question generation
- [ ] Multi-language support
- [ ] Advanced reporting system

---

**Built with ❤️ for advanced education and testing solutions** 