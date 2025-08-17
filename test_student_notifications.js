const { PrismaClient } = require('@prisma/client');
const logger = require('./src/config/logger');

const prisma = new PrismaClient();

async function testStudentNotifications() {
  try {
    console.log('🧪 Testing Student Notification System...\n');

    // 1. Check if notification service is available
    if (!global.notificationService) {
      console.log('❌ Notification service not available globally');
      return;
    }

    // 2. Find a student user
    const student = await prisma.user.findFirst({
      where: {
        role: 'STUDENT',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!student) {
      console.log('❌ No student users found');
      return;
    }

    console.log(`👤 Found student: ${student.firstName} ${student.lastName} (${student.email})`);

    // 3. Check student's exam bookings
    const bookings = await prisma.examBooking.findMany({
      where: {
        userId: student.id,
        status: 'CONFIRMED'
      },
      include: {
        exam: {
          include: {
            examCategory: true
          }
        }
      }
    });

    console.log(`📚 Student has ${bookings.length} confirmed exam bookings`);

    if (bookings.length > 0) {
      // 4. Test upcoming exam notifications
      console.log('\n🔔 Testing upcoming exam notifications...');
      
      const upcomingExams = bookings.map(b => b.exam);
      const result = await global.notificationService.notifyUpcomingExams(student.id, upcomingExams);
      
      console.log('✅ Upcoming exam notifications result:', result);
    }

    // 5. Test exam reminder notification
    console.log('\n⏰ Testing exam reminder notification...');
    
    if (bookings.length > 0) {
      const testBooking = bookings[0];
      const reminderResult = await global.notificationService.notifyExamReminder(testBooking, '1h');
      
      console.log('✅ Exam reminder result:', reminderResult);
    }

    // 6. Check notifications in database
    console.log('\n📊 Checking notifications in database...');
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId: student.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`📝 Found ${notifications.length} notifications for student:`);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.type}: ${notif.title} - ${notif.message}`);
    });

    // 7. Test WebSocket notification
    console.log('\n🔌 Testing WebSocket notification...');
    
    if (global.io) {
      const testNotification = {
        id: 'test-' + Date.now(),
        type: 'EXAM_REMINDER',
        title: '🧪 Test Notification',
        message: 'This is a test notification for the student',
        priority: 'normal',
        timestamp: new Date().toISOString()
      };

      // Send to student's user room
      global.io.to(`user-${student.id}`).emit('notification', testNotification);
      console.log('✅ Test notification sent via WebSocket to user room:', `user-${student.id}`);
      
      // Check room membership
      const userRoom = global.io.sockets.adapter.rooms.get(`user-${student.id}`);
      const userCount = userRoom ? userRoom.size : 0;
      console.log(`👥 Users in room user-${student.id}: ${userCount}`);
    } else {
      console.log('❌ WebSocket not available');
    }

    console.log('\n✅ Student notification system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testStudentNotifications(); 