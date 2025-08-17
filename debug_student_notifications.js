const axios = require('axios');

const apiURL = 'http://localhost:3000/api/v1';

async function debugStudentNotifications() {
  console.log('🔍 Debugging Student Notification System...\n');

  try {
    // 1. Login as student
    console.log('👤 Step 1: Student Authentication');
    const studentLoginResponse = await axios.post(`${apiURL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    if (!studentLoginResponse.data.success) {
      console.log('❌ Student login failed:', studentLoginResponse.data);
      return;
    }

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentId = studentLoginResponse.data.data.user.id;
    console.log('✅ Authenticated as student:', studentLoginResponse.data.data.user.firstName, studentLoginResponse.data.data.user.lastName);
    console.log('🆔 Student ID:', studentId);

    // 2. Check student's notifications
    console.log('\n📊 Step 2: Check Student Notifications');
    
    try {
      const notificationsResponse = await axios.get(`${apiURL}/notifications`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      if (notificationsResponse.data.success) {
        const notifications = notificationsResponse.data.data.notifications || [];
        console.log(`✅ Student has ${notifications.length} notifications`);
        
        if (notifications.length > 0) {
          console.log('📋 Recent student notifications:');
          notifications.slice(0, 5).forEach((notification, index) => {
            console.log(`  ${index + 1}. [${notification.type}] ${notification.title} - ${notification.status} (${new Date(notification.createdAt).toLocaleString()})`);
          });
        }
      } else {
        console.log('❌ Failed to get student notifications:', notificationsResponse.data);
      }
    } catch (error) {
      console.log('❌ Failed to get student notifications:', error.message);
    }

    // 3. Check notification stats for student
    console.log('\n📈 Step 3: Check Student Notification Stats');
    
    try {
      const statsResponse = await axios.get(`${apiURL}/notifications/stats`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        console.log('✅ Student notification stats:', stats);
      } else {
        console.log('❌ Failed to get student notification stats:', statsResponse.data);
      }
    } catch (error) {
      console.log('❌ Failed to get student notification stats:', error.message);
    }

    // 4. Check if there are any SYSTEM_ANNOUNCEMENT notifications in the database
    console.log('\n🔍 Step 4: Check Database for SYSTEM_ANNOUNCEMENT Notifications');
    console.log('💡 Since there\'s no admin notifications endpoint, let\'s check the database directly');
    console.log('💡 Run this command in your terminal:');
    console.log('   node check_notification_db.js');
    console.log('💡 Look for SYSTEM_ANNOUNCEMENT notifications');

    // 5. Test WebSocket connection
    console.log('\n🔌 Step 5: Test WebSocket Connection');
    console.log('💡 Open your browser console and check for WebSocket messages');
    console.log('💡 Look for: "new-exam-available" events');
    console.log('💡 Check if you see: "🔔 Real-time notification received:" messages');

    // 6. Check server logs
    console.log('\n📝 Step 6: Check Server Logs');
    console.log('💡 Look in your server terminal for these messages:');
    console.log('  - "🔔 Attempting to send new exam notification for: [Exam Title]"');
    console.log('  - "🔔 Sending individual notifications to X students"');
    console.log('  - "✅ Successfully notified X/X students about new exam"');
    console.log('  - "🔔 Sent individual exam notifications to all students"');

    // 7. Manual notification test
    console.log('\n🧪 Step 7: Manual Notification Test');
    console.log('💡 Try creating another exam from admin interface');
    console.log('💡 Watch server logs for notification process');
    console.log('💡 Check student dashboard for new notifications');

  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugStudentNotifications(); 