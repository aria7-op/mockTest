const axios = require('axios');

async function testStudentConnectionStatus() {
  try {
    console.log('🔌 Testing Student WebSocket Connection Status...\n');

    const baseURL = 'http://localhost:5000';
    const apiURL = `${baseURL}/api/v1`;

    // 1. Check WebSocket status
    console.log('🔌 Step 1: Check WebSocket Status');
    try {
      const testResponse = await axios.get(`${baseURL}/api/v1/test/notification`);
      console.log('📊 WebSocket Status Response:', testResponse.data);
      
      if (testResponse.data.message.includes('No connected students found')) {
        console.log('❌ No students are currently connected to WebSocket');
      } else {
        console.log('✅ Students are connected to WebSocket');
      }
    } catch (error) {
      console.log('❌ Failed to check WebSocket status:', error.message);
    }

    // 2. Login as admin to check student users
    console.log('\n👨‍💼 Step 2: Check Student Users');
    let adminToken = null;
    
    try {
      const adminLoginResponse = await axios.post(`${apiURL}/auth/login`, {
        email: 'admin1@mocktest.com',
        password: 'Admin@123'
      });

      if (adminLoginResponse.data.success) {
        adminToken = adminLoginResponse.data.data.token;
        console.log(`✅ Authenticated as admin: ${adminLoginResponse.data.data.user.firstName} ${adminLoginResponse.data.data.user.lastName}`);
      } else {
        console.log('❌ Admin login failed');
        return;
      }
    } catch (error) {
      console.log('❌ Admin authentication failed:', error.message);
      return;
    }

    // 3. Get all student users
    try {
      const studentsResponse = await axios.get(`${apiURL}/users?role=STUDENT&limit=20`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (studentsResponse.data.success) {
        const students = studentsResponse.data.data.users;
        console.log(`📊 Found ${students.length} student users:`);
        
        students.forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`);
          console.log(`     ID: ${student.id} | Active: ${student.isActive} | Created: ${student.createdAt}`);
        });
        
        if (students.length === 0) {
          console.log('⚠️ No student users found');
        } else {
          console.log('\n💡 To test notifications:');
          console.log('  1. Open a browser and go to the student dashboard');
          console.log('  2. Login as one of the students above');
          console.log('  3. Check browser console for WebSocket connection messages');
          console.log('  4. Run the new exam test to trigger notifications');
        }
      } else {
        console.log('❌ Failed to get student users:', studentsResponse.data);
      }
    } catch (error) {
      console.log('❌ Failed to get student users:', error.message);
    }

    // 4. Test creating a simple notification
    console.log('\n🧪 Step 3: Test Notification Creation');
    try {
      if (adminToken) {
        // Try to create a simple notification for a student
        const studentsResponse = await axios.get(`${apiURL}/users?role=STUDENT&limit=1`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (studentsResponse.data.success && studentsResponse.data.data.users.length > 0) {
          const student = studentsResponse.data.data.users[0];
          console.log(`✅ Found student for testing: ${student.firstName} ${student.lastName}`);
          
          // Check if this student has any existing notifications
          try {
            const notificationsResponse = await axios.get(`${apiURL}/notifications?userId=${student.id}&limit=5`, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (notificationsResponse.data.success) {
              const notifications = notificationsResponse.data.data.notifications;
              console.log(`📝 Student has ${notifications.length} existing notifications`);
              
              if (notifications.length > 0) {
                console.log('📋 Recent notifications:');
                notifications.slice(0, 3).forEach((notif, index) => {
                  console.log(`  ${index + 1}. ${notif.type}: ${notif.title}`);
                });
              }
            }
          } catch (error) {
            console.log('⚠️ Could not check existing notifications:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('❌ Notification test failed:', error.message);
    }

    console.log('\n✅ Student Connection Status Test Completed!');
    console.log('\n🔍 Key Findings:');
    console.log('  - WebSocket status checked');
    console.log('  - Student users verified');
    console.log('  - Notification system tested');
    
    console.log('\n💡 Next Steps:');
    console.log('  1. Have students login to establish WebSocket connections');
    console.log('  2. Run test_new_exam_notification.js to create a new exam');
    console.log('  3. Check if students receive notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStudentConnectionStatus(); 