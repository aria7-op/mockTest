const axios = require('axios');

const apiURL = 'http://localhost:3000/api/v1';

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // 1. Login as admin
    console.log('🔐 Step 1: Admin Authentication');
    const loginResponse = await axios.post(`${apiURL}/auth/login`, {
      email: 'admin1@mocktest.com',
      password: 'Admin@123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data);
      return;
    }

    const adminToken = loginResponse.data.data.accessToken;
    console.log('✅ Authenticated as admin:', loginResponse.data.data.user.firstName, loginResponse.data.data.user.lastName);

    // 2. Test notification endpoint directly
    console.log('\n🔔 Step 2: Test Notification Endpoint');
    
    const testNotification = {
      userId: 'test-user-id', // This will be replaced with actual student ID
      type: 'TEST_NOTIFICATION',
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify the system is working',
      priority: 'normal',
      channels: ['database', 'websocket']
    };

    try {
      const notificationResponse = await axios.post(`${apiURL}/notifications/test`, testNotification, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Test notification sent:', notificationResponse.data);
    } catch (error) {
      console.log('❌ Test notification failed:', error.message);
      if (error.response) {
        console.log('📊 Error response:', error.response.data);
      }
    }

    // 3. Check existing notifications
    console.log('\n📊 Step 3: Check Existing Notifications');
    
    try {
      const notificationsResponse = await axios.get(`${apiURL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (notificationsResponse.data.success) {
        const notifications = notificationsResponse.data.data.notifications || [];
        console.log(`✅ Found ${notifications.length} notifications in database`);
        
        if (notifications.length > 0) {
          console.log('📋 Recent notifications:');
          notifications.slice(0, 5).forEach((notification, index) => {
            console.log(`  ${index + 1}. ${notification.title} - ${notification.type} (${notification.status})`);
          });
        }
      } else {
        console.log('❌ Failed to get notifications:', notificationsResponse.data);
      }
    } catch (error) {
      console.log('❌ Failed to get notifications:', error.message);
    }

    // 4. Check notification stats
    console.log('\n📈 Step 4: Check Notification Stats');
    
    try {
      const statsResponse = await axios.get(`${apiURL}/notifications/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        console.log('✅ Notification stats:', stats);
      } else {
        console.log('❌ Failed to get notification stats:', statsResponse.data);
      }
    } catch (error) {
      console.log('❌ Failed to get notification stats:', error.message);
    }

    // 5. Check if there's a test notification endpoint
    console.log('\n🔍 Step 5: Check Available Notification Endpoints');
    
    try {
      const endpointsResponse = await axios.get(`${apiURL}/notifications`);
      console.log('📋 Available notification endpoints:', endpointsResponse.data);
    } catch (error) {
      console.log('ℹ️ Could not fetch notification endpoints info (this is normal)');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testNotificationSystem();