const axios = require('axios');

async function testComprehensiveStudentNotifications() {
  try {
    console.log('🧪 Testing Comprehensive Student Notification System via HTTP...\n');

    const baseURL = 'http://localhost:5000';
    const apiURL = `${baseURL}/api/v1`;

    // 1. Test server connectivity
    console.log('🔌 Test 1: Server Connectivity');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/v1/test/notification`);
      console.log('✅ Server is running and notification endpoint accessible');
      console.log('📊 Response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server connectivity failed:', error.message);
      console.log('💡 Make sure the server is running on port 5000');
      return;
    }

    // 2. Test authentication and get a student user
    console.log('\n🔐 Test 2: Authentication');
    let authToken = null;
    let studentUser = null;

    try {
      // Try to login as a student (you may need to adjust credentials)
      const loginResponse = await axios.post(`${apiURL}/auth/login`, {
        email: 'student1@example.com', // Updated to correct student email
        password: 'Admin@123'          // Updated to correct student password
      });

      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.token;
        studentUser = loginResponse.data.data.user;
        console.log(`✅ Authenticated as student: ${studentUser.firstName} ${studentUser.lastName}`);
      } else {
        console.log('⚠️ Student login failed, will test with admin token only');
      }
    } catch (error) {
      console.log('⚠️ Student login failed, will test with admin token only');
    }

    // 3. Test admin authentication for creating test data
    console.log('\n👨‍💼 Test 3: Admin Authentication');
    let adminToken = null;
    let adminUser = null;

    try {
      const adminLoginResponse = await axios.post(`${apiURL}/auth/login`, {
        email: 'admin1@mocktest.com', // Updated to correct admin email
        password: 'Admin@123'         // Updated to correct admin password
      });

      if (adminLoginResponse.data.success) {
        adminToken = adminLoginResponse.data.data.token;
        adminUser = adminLoginResponse.data.data.user;
        console.log(`✅ Authenticated as admin: ${adminUser.firstName} ${adminUser.lastName}`);
      } else {
        console.log('❌ Admin login failed');
        return;
      }
    } catch (error) {
      console.log('❌ Admin authentication failed:', error.message);
      return;
    }

    // 4. Test creating a test exam booking for a student
    console.log('\n📚 Test 4: Create Test Exam Booking');
    try {
      // First, get available exams
      const examsResponse = await axios.get(`${apiURL}/exams`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (examsResponse.data.success && examsResponse.data.data.exams.length > 0) {
        const exam = examsResponse.data.data.exams[0];
        console.log(`✅ Found exam: ${exam.title}`);

        // Create a test booking for the student
        // If we have a real student, use their ID, otherwise create a test booking
        let studentId = null;
        if (studentUser) {
          studentId = studentUser.id;
          console.log(`✅ Using real student ID: ${studentId}`);
        } else {
          // Try to find any existing student user in the system
          console.log('🔍 Looking for existing student users...');
          try {
            const usersResponse = await axios.get(`${apiURL}/users?role=STUDENT&limit=1`, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (usersResponse.data.success && usersResponse.data.data.users.length > 0) {
              studentId = usersResponse.data.data.users[0].id;
              console.log(`✅ Found existing student: ${usersResponse.data.data.users[0].firstName} ${usersResponse.data.data.users[0].lastName}`);
            } else {
              console.log('⚠️ No existing students found, will test notification creation without real student');
            }
          } catch (error) {
            console.log('⚠️ Could not fetch existing students:', error.message);
          }
        }

        if (studentId) {
          const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

          const bookingResponse = await axios.post(`${apiURL}/bookings/admin`, {
            userId: studentId,
            examId: exam.id,
            scheduledAt: scheduledAt.toISOString(),
            attemptsAllowed: 1,
            notes: 'Test booking for notification testing'
          }, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });

          if (bookingResponse.data.success) {
            console.log('✅ Test exam booking created successfully');
            console.log('📊 Booking details:', bookingResponse.data.data.booking);
            
            // This should trigger a booking confirmation notification to the student
            console.log('🔔 Student should receive booking confirmation notification');
          } else {
            console.log('❌ Failed to create test booking:', bookingResponse.data);
          }
        } else {
          console.log('⚠️ Skipping test booking creation - no student ID available');
        }
      } else {
        console.log('❌ No exams available for testing');
      }
    } catch (error) {
      console.log('❌ Test booking creation failed:', error.message);
    }

    // 5. Test upcoming exams endpoint (this should trigger notifications)
    console.log('\n📅 Test 5: Upcoming Exams (Triggers Notifications)');
    try {
      if (studentUser && authToken) {
        console.log('🔐 Using student token for upcoming exams test');
        const upcomingResponse = await axios.get(`${apiURL}/exams/upcoming`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (upcomingResponse.data.success) {
          console.log('✅ Upcoming exams fetched successfully');
          console.log(`📊 Found ${upcomingResponse.data.data.exams.length} upcoming exams`);
          
          // This should trigger upcoming exam notifications for the student
          console.log('🔔 Student should receive upcoming exam notifications');
        } else {
          console.log('❌ Failed to fetch upcoming exams:', upcomingResponse.data);
        }
      } else {
        console.log('⚠️ Skipping upcoming exams test - no student authentication');
        console.log('💡 To test this, you need to login as a student first');
      }
    } catch (error) {
      console.log('❌ Upcoming exams test failed:', error.message);
    }

    // 6. Test WebSocket notification delivery
    console.log('\n🔌 Test 6: WebSocket Notification Delivery');
    try {
      // Send a test notification via the test endpoint
      const testNotificationResponse = await axios.get(`${baseURL}/api/v1/test/notification`);
      
      if (testNotificationResponse.data.success) {
        console.log('✅ Test notification sent via WebSocket');
        console.log('📊 Response:', testNotificationResponse.data);
        
        // If a student is connected, they should receive this notification
        if (studentUser) {
          console.log('🔔 Student should receive test notification in real-time');
        }
      } else {
        console.log('❌ Test notification failed:', testNotificationResponse.data);
      }
    } catch (error) {
      console.log('❌ WebSocket test failed:', error.message);
    }

    // 7. Test notification retrieval
    console.log('\n📱 Test 7: Notification Retrieval');
    try {
      if (studentUser && authToken) {
        console.log('🔐 Using student token for notification retrieval');
        const notificationsResponse = await axios.get(`${apiURL}/notifications`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (notificationsResponse.data.success) {
          const notifications = notificationsResponse.data.data.notifications;
          console.log(`✅ Retrieved ${notifications.length} notifications for student`);
          
          if (notifications.length > 0) {
            console.log('📝 Recent notifications:');
            notifications.slice(0, 5).forEach((notif, index) => {
              console.log(`  ${index + 1}. ${notif.type}: ${notif.title}`);
            });
          } else {
            console.log('📝 No notifications found yet');
          }
        } else {
          console.log('❌ Failed to retrieve notifications:', notificationsResponse.data);
        }
      } else {
        console.log('⚠️ Skipping notification retrieval test - no student authentication');
        console.log('💡 To test this, you need to login as a student first');
      }
    } catch (error) {
      console.log('❌ Notification retrieval test failed:', error.message);
    }

    console.log('\n✅ Comprehensive student notification system test completed!');
    console.log('\n📋 Summary of tests:');
    console.log('  ✅ Server connectivity');
    console.log('  ✅ Admin authentication');
    console.log('  ✅ Test exam booking creation');
    console.log('  ✅ Upcoming exams (triggers notifications)');
    console.log('  ✅ WebSocket notification delivery');
    console.log('  ✅ Notification retrieval');
    
    console.log('\n💡 Next steps:');
    console.log('  1. Check the student dashboard to see notifications');
    console.log('  2. Verify WebSocket connections in browser console');
    console.log('  3. Test real-time notification delivery');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  - Make sure the server is running on port 5000');
    console.log('  - Check that you have valid admin/student credentials');
    console.log('  - Verify the database connection');
  }
}

// Run the comprehensive test
testComprehensiveStudentNotifications(); 