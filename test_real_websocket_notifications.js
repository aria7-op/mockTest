const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@mocktest.com',
  password: 'Admin@123'
};

async function testRealWebSocketNotifications() {
  console.log('🔔 TESTING REAL WEBSOCKET NOTIFICATIONS');
  console.log('=====================================');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('1. Make sure your FRONTEND is open at http://localhost:3000');
  console.log('2. Make sure you are LOGGED IN as admin@mocktest.com');
  console.log('3. Keep the notification dropdown CLOSED');
  console.log('4. Watch the notification badge in the header');
  console.log('5. This script will trigger REAL business events that should send WebSocket notifications');
  console.log('');
  console.log('Press ENTER when ready to start the test...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  console.log('🚀 Starting Real Business Event Tests');
  console.log('=====================================');
  console.log('');

  try {
    // 1. Login to get token
    console.log('🔐 Authenticating...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log(`✅ Logged in as: ${loginResponse.data.data.user.firstName} (${loginResponse.data.data.user.role})`);
    console.log('');

    // 2. Test User Registration (Admin creating a new user)
    console.log('👤 TEST 1: User Registration');
    console.log('----------------------------');
    console.log('Creating a new user (should trigger notifications)...');
    
    const randomEmail = `testuser${Date.now()}@example.com`;
    const newUserData = {
      email: randomEmail,
      password: 'TestUser@123',
      firstName: 'WebSocket',
      lastName: 'Test',
      role: 'STUDENT',
      phone: '+1234567890'
    };

    try {
      const userResponse = await axios.post(`${API_BASE}/auth/register`, newUserData, { headers });
      console.log('✅ New user created successfully!');
      console.log('📡 Expected WebSocket notifications:');
      console.log('   - Welcome notification to new user');
      console.log('   - New user alert to admins');
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log('❌ User creation failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('');

    // 3. Test Account Status Change
    console.log('🔧 TEST 2: Account Status Change');
    console.log('--------------------------------');
    console.log('Changing user account status (should trigger notification)...');

    try {
      // Get users to find one to update
      const usersResponse = await axios.get(`${API_BASE}/admin/users?page=1&limit=1`, { headers });
      
      if (usersResponse.data.data.users.length > 0) {
        const targetUser = usersResponse.data.data.users[0];
        const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
        
        const statusUpdateResponse = await axios.put(
          `${API_BASE}/admin/users/${targetUser.id}/status`,
          { 
            status: newStatus,
            reason: 'WebSocket notification test' 
          },
          { headers }
        );
        
        console.log(`✅ User status changed to: ${newStatus}`);
        console.log('📡 Expected WebSocket notification:');
        console.log(`   - Account status change notification to user ${targetUser.firstName}`);
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log('❌ Status change failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('');

    // 4. Test System Alert
    console.log('⚠️  TEST 3: System Alert');
    console.log('------------------------');
    console.log('Sending a system alert (should trigger notification)...');

    try {
      const alertResponse = await axios.post(
        `${API_BASE}/notifications/test`,
        {
          type: 'SYSTEM_ALERT',
          title: '🔥 WebSocket Test Alert',
          message: 'This is a real-time WebSocket notification test!',
          priority: 'high',
          userId: userId
        },
        { headers }
      );

      console.log('✅ System alert sent successfully!');
      console.log('📡 Expected WebSocket notification:');
      console.log('   - System alert notification appears instantly');
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log('❌ System alert failed:', error.response?.data?.error?.message || error.message);
    }

    console.log('');

    // 5. Test Multiple Rapid Notifications
    console.log('⚡ TEST 4: Multiple Rapid Notifications');
    console.log('--------------------------------------');
    console.log('Sending multiple notifications rapidly...');

    for (let i = 1; i <= 3; i++) {
      try {
        await axios.post(
          `${API_BASE}/notifications/test`,
          {
            type: 'EXAM_REMINDER',
            title: `⚡ Rapid Test #${i}`,
            message: `This is rapid notification ${i} of 3`,
            priority: 'normal',
            userId: userId
          },
          { headers }
        );

        console.log(`✅ Sent rapid notification ${i}/3`);
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between notifications
      } catch (error) {
        console.log(`❌ Rapid notification ${i} failed:`, error.response?.data?.error?.message || error.message);
      }
    }

    console.log('📡 Expected WebSocket notifications:');
    console.log('   - 3 notifications should appear rapidly');
    console.log('⏳ Waiting 5 seconds for all to process...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('');
    console.log('🎯 WHAT YOU SHOULD SEE IN FRONTEND:');
    console.log('===================================');
    console.log('✅ Badge count increases with each notification');
    console.log('✅ Toast notifications slide in from top-right corner');
    console.log('✅ Browser notifications appear (if permission granted)');
    console.log('✅ All happens INSTANTLY without page refresh');
    console.log('✅ WebSocket connection shows activity in dev tools');
    console.log('');
    console.log('🔍 DEBUG TIPS:');
    console.log('==============');
    console.log('• Check browser console for: "🔔 Real-time notification received"');
    console.log('• Check Network tab for WebSocket activity');
    console.log('• Verify notification badge count increased');
    console.log('• Click notification icon to see dropdown with new notifications');
    console.log('');
    console.log('🎉 Real WebSocket notification test completed!');
    console.log('💡 If notifications appeared instantly, WebSocket integration is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

testRealWebSocketNotifications();