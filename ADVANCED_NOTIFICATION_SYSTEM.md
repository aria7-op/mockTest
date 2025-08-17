# Advanced Dynamic Push Notification System

## Overview

This comprehensive notification system provides real-time, multi-channel notifications that are automatically triggered by backend business events without requiring frontend calls. The system supports WebSocket real-time notifications, email notifications, push notifications, SMS, and database persistence.

## 🚀 Key Features

### ✨ **Dynamic Push Notifications**
- **Real-time WebSocket notifications** - Instant delivery to connected users
- **Database persistence** - All notifications stored for history and offline access
- **Email notifications** - Automated email delivery for important events
- **Push notifications** - Mobile/browser push support (ready for implementation)
- **SMS notifications** - Text message support (ready for implementation)

### 🎯 **Smart Targeting**
- **User-specific notifications** - Targeted to individual users
- **Admin broadcasts** - System alerts to all administrators
- **Priority-based routing** - High/urgent notifications get special treatment
- **Channel preferences** - Users can control which channels they receive notifications on

### ⚡ **Automatic Triggers**
- **User lifecycle events** - Registration, email verification, account changes
- **Exam flow events** - Booking, confirmation, start, completion, scoring
- **Payment events** - Success, failure, refunds
- **System events** - Health checks, alerts, maintenance notifications

### 📅 **Scheduled Notifications**
- **Exam reminders** - 24h, 1h, and 15-minute reminders
- **Custom scheduling** - Schedule any notification for future delivery
- **Recurring notifications** - System maintenance, report generation
- **Cleanup automation** - Automatic removal of old notifications

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Business      │    │   Notification   │    │   Delivery      │
│   Events        │───▶│   Service        │───▶│   Channels      │
│                 │    │                  │    │                 │
│ • User Reg      │    │ • Routing        │    │ • WebSocket     │
│ • Exam Start    │    │ • Templating     │    │ • Email         │
│ • Payment       │    │ • Persistence    │    │ • Push          │
│ • Booking       │    │ • Scheduling     │    │ • SMS           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Database       │
                       │   Storage        │
                       │                  │
                       │ • Notifications  │
                       │ • Preferences    │
                       │ • Delivery Log   │
                       └──────────────────┘
```

## 📋 Notification Types

### User Lifecycle
- `USER_REGISTERED` - Welcome new users
- `EMAIL_VERIFIED` - Confirm email verification
- `ACCOUNT_STATUS_CHANGED` - Account activation/deactivation

### Exam Flow
- `BOOKING_CONFIRMED` - Exam booking confirmation
- `BOOKING_CANCELLED` - Booking cancellation notice
- `EXAM_STARTED` - Exam attempt started
- `EXAM_COMPLETED` - Exam finished with results
- `EXAM_REMINDER` - Scheduled exam reminders
- `CERTIFICATE_READY` - Certificate available for download

### Payment Processing
- `PAYMENT_SUCCESS` - Payment completed successfully
- `PAYMENT_FAILED` - Payment processing failed

### System Management
- `SYSTEM_ALERT` - Critical system notifications
- `NEW_USER_REGISTERED` - Admin notification for new registrations

## 🔧 Implementation Details

### Core Service: `AdvancedNotificationService`

```javascript
// Send a notification
const result = await notificationService.sendNotification({
  userId: 'user-123',
  type: 'EXAM_COMPLETED',
  title: '🎉 Exam Completed - Passed!',
  message: 'You scored 85% on "JavaScript Fundamentals". Congratulations!',
  priority: 'high',
  channels: ['websocket', 'database', 'email'],
  data: { 
    examId: 'exam-456',
    score: 85,
    passed: true
  }
});
```

### Business Event Integration

The system automatically triggers notifications for key business events:

```javascript
// In examBookingController.js
if (global.notificationService) {
  await global.notificationService.notifyBookingConfirmed(booking);
}

// In paymentService.js
if (status === 'COMPLETED') {
  await global.notificationService.notifyPaymentSuccess(payment);
}

// In userService.js
await global.notificationService.notifyAccountStatusChanged(userId, statusData);
```

### WebSocket Real-time Delivery

```javascript
// Client-side JavaScript
const socket = io();

// Join user room for personalized notifications
socket.emit('join-user', { userId: currentUser.id });

// Listen for notifications
socket.on('notification', (notification) => {
  showNotificationToast(notification);
  updateNotificationBadge();
});
```

### Database Schema

```sql
-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority notification_priority DEFAULT 'normal',
    status notification_status DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE notification_preferences (
    user_id UUID REFERENCES users(id) UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    websocket_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE
);
```

## 📡 API Endpoints

### Get User Notifications
```http
GET /api/v1/notifications
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- status: Filter by status (UNREAD, READ)
- type: Filter by notification type
- priority: Filter by priority level
```

### Mark Notification as Read
```http
PATCH /api/v1/notifications/:id/read
```

### Mark All as Read
```http
PATCH /api/v1/notifications/read-all
```

### Get Notification Statistics
```http
GET /api/v1/notifications/stats
```

### Send Test Notification (Admin)
```http
POST /api/v1/notifications/test
{
  "userId": "user-123",
  "title": "Test Notification",
  "message": "This is a test message",
  "type": "SYSTEM_ALERT",
  "priority": "normal"
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# Notification system
NOTIFICATIONS_ENABLED=true
PUSH_NOTIFICATIONS_ENABLED=false
SMS_NOTIFICATIONS_ENABLED=false

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com

# WebSocket configuration
WEBSOCKET_ENABLED=true
```

### Notification Channels

Each notification can be sent through multiple channels:

- **websocket** - Real-time delivery to connected users
- **database** - Persistent storage for notification history
- **email** - Email delivery using configured SMTP
- **push** - Push notifications (requires FCM/APNS setup)
- **sms** - SMS delivery (requires Twilio/AWS SNS setup)

## 📅 Scheduled Notifications

### Exam Reminders

The system automatically sends exam reminders:
- **24 hours before** - Initial reminder
- **1 hour before** - Final preparation reminder  
- **15 minutes before** - Last chance reminder

### System Maintenance

```javascript
// Schedule a maintenance notification
await notificationScheduler.scheduleNotification({
  type: 'SYSTEM_MAINTENANCE',
  title: '🔧 Scheduled Maintenance',
  message: 'System will be down for maintenance from 2 AM to 4 AM UTC.',
  priority: 'high',
  channels: ['websocket', 'database', 'email']
}, new Date('2024-01-15T02:00:00Z'));
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
node test_notification_system.js
```

This tests:
- ✅ Basic notification sending
- ✅ Different notification types
- ✅ Priority levels
- ✅ Multiple delivery channels
- ✅ Notification management
- ✅ Business event triggers
- ✅ System alerts
- ✅ Statistics and analytics

## 🔍 Monitoring & Analytics

### System Health Checks

The scheduler performs automatic health checks:
- **Database connectivity** - Ensures database is responsive
- **Notification delivery rates** - Monitors success/failure rates
- **Unread notification counts** - Alerts on excessive backlogs
- **System performance** - Tracks notification processing times

### Notification Statistics

```javascript
const stats = await notificationService.getNotificationStats(userId);
// Returns:
// {
//   total: 150,
//   unread: 12,
//   byType: { 'EXAM_COMPLETED': 25, 'BOOKING_CONFIRMED': 30, ... },
//   byPriority: { 'high': 15, 'normal': 120, 'low': 15 }
// }
```

## 🚀 Getting Started

### 1. Database Migration

Run the notification system migration:

```sql
-- Run the migration file
\i src/database/migrations/002_notifications.sql
```

### 2. Start the Server

The notification system starts automatically with the server:

```bash
npm start
```

You'll see:
```
🔔 NotificationService: WebSocket instance set
🕒 Starting notification scheduler
📅 Started scheduled job: exam-reminders
📅 Started scheduled job: cleanup-notifications
📅 Started scheduled job: system-health
🚀 Server is running on port 5000
```

### 3. Test the System

```bash
node test_notification_system.js
```

### 4. Frontend Integration

Add to your frontend application:

```javascript
// Connect to WebSocket
const socket = io();

// Join user room
socket.emit('join-user', { userId: currentUser.id });

// Listen for real-time notifications
socket.on('notification', (notification) => {
  // Display notification to user
  showToast(notification.title, notification.message, notification.priority);
  
  // Update notification badge
  updateNotificationCount();
  
  // Play notification sound for high priority
  if (notification.priority === 'high' || notification.priority === 'urgent') {
    playNotificationSound();
  }
});

// Fetch notification history
const notifications = await fetch('/api/v1/notifications').then(r => r.json());
```

## 🔮 Future Enhancements

### Push Notifications
- Firebase Cloud Messaging (FCM) integration
- Apple Push Notification Service (APNS) integration
- Web Push API support

### SMS Notifications
- Twilio integration
- AWS SNS integration
- International SMS support

### Advanced Features
- Notification templates with variables
- User notification preferences UI
- A/B testing for notification content
- Machine learning for optimal delivery timing
- Rich media notifications (images, buttons)

## 🛠️ Troubleshooting

### Common Issues

**Notifications not being sent:**
1. Check `NOTIFICATIONS_ENABLED=true` in environment
2. Verify database connection
3. Check server logs for errors

**WebSocket notifications not received:**
1. Verify client is connected to WebSocket
2. Check if user joined the correct room
3. Confirm `global.io` is available in server

**Email notifications failing:**
1. Verify SMTP configuration
2. Check email service credentials
3. Review email service logs

### Debug Mode

Enable debug logging:
```bash
DEBUG=notification* npm start
```

## 📞 Support

For questions or issues with the notification system:

1. Check the server logs for error messages
2. Run the test suite to verify system health
3. Review the notification delivery logs in the database
4. Check WebSocket connection status in browser dev tools

---

**The Advanced Notification System provides comprehensive, real-time communication capabilities that enhance user experience and keep everyone informed of important events automatically.**