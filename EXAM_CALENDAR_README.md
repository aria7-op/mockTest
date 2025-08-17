# Exam Calendar System

A comprehensive exam calendar system for administrators and moderators to manage and visualize exam bookings.

## Features

### 🗓️ **Advanced Calendar View**
- **Monthly Calendar**: Full month view with booking indicators
- **Visual Status Indicators**: Color-coded days showing booking status
  - 🟢 **Confirmed bookings** (Green)
  - 🟡 **Pending bookings** (Yellow) 
  - 🔴 **Mixed status** (Purple)
  - ⚪ **Free days** (Gray)
- **Interactive Date Selection**: Click any date to view detailed bookings
- **Booking Count Indicators**: Shows number of exams per day

### 📊 **Real-time Statistics**
- **Total Bookings**: Current month booking count
- **Status Breakdown**: Confirmed, pending, cancelled counts
- **Availability Overview**: Busy days vs free days
- **Category Distribution**: Bookings by exam category

### 🔍 **Advanced Filtering**
- **Status Filters**: Show/hide by booking status
- **Category Filters**: Filter by exam categories
- **Date Range**: Custom date range selection
- **Toggle Visibility**: Show/hide specific booking types

### 📋 **Booking Management**
- **Detailed Booking Cards**: Complete booking information
- **Quick Actions**: Confirm, cancel, or reschedule bookings
- **Status Updates**: Change booking status with audit trail
- **Conflict Detection**: Automatic scheduling conflict prevention
- **Reschedule Support**: Move bookings to different times

### 🔐 **Role-based Access**
- **Admin Access**: Full calendar management capabilities
- **Moderator Access**: View and update permissions
- **Secure Routes**: Protected API endpoints
- **Permission Validation**: Role-based permission checking

## Technical Implementation

### Frontend Components

#### ExamCalendar.jsx
- Main calendar component with interactive grid
- Real-time data fetching and updates
- Responsive design for all screen sizes
- Advanced state management for filters and selections

#### Calendar.jsx (Admin Page)
- Admin page wrapper with permission checking
- User role validation and access control
- Loading states and error handling

### Backend Services

#### CalendarService.js
- **getCalendarBookings()**: Fetch bookings with filters
- **getCalendarStats()**: Generate statistics and analytics
- **getDateAvailability()**: Check availability for specific dates
- **checkSchedulingConflicts()**: Prevent double bookings
- **rescheduleBooking()**: Move bookings to new times
- **updateBookingStatus()**: Change booking status with validation

#### CalendarController.js
- RESTful API endpoints for calendar operations
- Request validation and error handling
- Permission-based access control
- Comprehensive logging and audit trails

### API Endpoints

#### Calendar Data
- `GET /api/bookings/admin/calendar` - Get calendar bookings
- `GET /api/bookings/admin/calendar/overview` - Calendar overview/dashboard
- `GET /api/bookings/admin/calendar/stats` - Booking statistics
- `GET /api/bookings/admin/calendar/weekly/:date` - Weekly view
- `GET /api/bookings/admin/calendar/monthly/:date` - Monthly view

#### Availability & Conflicts
- `GET /api/bookings/admin/calendar/availability/:date` - Date availability
- `POST /api/bookings/admin/calendar/conflicts` - Check scheduling conflicts
- `GET /api/bookings/admin/calendar/categories` - Exam categories

#### Booking Management
- `PATCH /api/bookings/admin/calendar/:bookingId/reschedule` - Reschedule booking
- `PATCH /api/bookings/admin/calendar/:bookingId/status` - Update status

### Database Integration

The calendar system integrates with existing database tables:
- **ExamBooking**: Main booking records with scheduling
- **Exam**: Exam details and categories
- **User**: Student and admin information
- **ExamCategory**: Category filtering and organization
- **AuditLog**: Change tracking and audit trails

### Permissions

#### Admin Permissions
- `calendar:read` - View calendar data
- `calendar:update` - Modify bookings
- `calendar:reschedule` - Reschedule bookings
- `booking:create` - Create new bookings
- `booking:delete` - Cancel bookings

#### Moderator Permissions
- `calendar:read` - View calendar data
- `calendar:update` - Modify booking status
- `booking:update` - Update booking details

## Usage

### Accessing the Calendar

1. **Login** as Admin or Moderator
2. **Navigate** to "Exam Calendar" in the sidebar
3. **View** the monthly calendar with booking indicators
4. **Click** on any date to see detailed bookings
5. **Use filters** to customize the view

### Managing Bookings

1. **Select a date** with bookings
2. **View booking details** in the sidebar
3. **Use quick actions** to confirm, cancel, or reschedule
4. **Check conflicts** before making changes
5. **Monitor status changes** in real-time

### Viewing Statistics

- **Monthly Stats**: Displayed at the top of the calendar
- **Category Breakdown**: Filter by exam categories
- **Availability Overview**: See busy vs free days
- **Status Distribution**: Track pending vs confirmed bookings

## Security Features

- **Role-based Access Control**: Only admins and moderators can access
- **Permission Validation**: Server-side permission checking
- **Audit Logging**: All changes are logged with user information
- **Conflict Prevention**: Automatic scheduling conflict detection
- **Input Validation**: All API inputs are validated and sanitized

## Responsive Design

The calendar system is fully responsive and works on:
- **Desktop**: Full-featured calendar view
- **Tablet**: Optimized layout with touch support
- **Mobile**: Stacked layout with simplified navigation

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Features

- **Lazy Loading**: Calendar data loaded on demand
- **Caching**: Client-side caching for frequently accessed data
- **Optimized Queries**: Efficient database queries with proper indexing
- **Pagination**: Large datasets handled with pagination
- **Real-time Updates**: Live data updates without page refresh

## Future Enhancements

- **Email Notifications**: Automatic booking confirmations
- **Calendar Export**: Export to Google Calendar, Outlook
- **Bulk Operations**: Multi-select for batch operations
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: Dedicated mobile application
- **Integration**: Third-party calendar system integration

---

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install date-fns
   ```

2. **Access Calendar**:
   - Login as Admin/Moderator
   - Navigate to `/admin/calendar`

3. **Start Managing**:
   - View bookings by clicking dates
   - Use filters to customize view
   - Manage bookings with quick actions

The exam calendar system provides a comprehensive solution for managing exam schedules with an intuitive interface, powerful features, and robust security.