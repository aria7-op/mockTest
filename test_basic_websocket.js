const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';

// Test credentials  
const TEST_CREDENTIALS = {
  email: 'admin1@mocktest.com',
  password: 'Admin@123'
};

async function testBasicWebSocket() {
  console.log('⚡ BASIC WEBSOCKET NOTIFICATION TEST');
  console.log('===================================');
  console.log('');
  console.log('📋 SETUP:');
  console.log('1. Frontend should be open at http://localhost:3000');
  console.log('2. You should be logged in as admin@mocktest.com');
  console.log('3. Watch the notification icon in the header');
  console.log('');
  console.log('This test will send 5 notifications with 2-second intervals.');
  console.log('You should see them appear INSTANTLY via WebSocket!');
  console.log('');
  console.log('Press ENTER to start...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  try {
    // Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log(`✅ Logged in as: ${loginResponse.data.data.user.firstName}`);
    console.log('');
    console.log('🚀 Sending WebSocket notifications...');
    console.log('👀 WATCH YOUR FRONTEND NOW!');
    console.log('');

    // Send 5 test notifications
    const notifications = [
      {
        type: 'SYSTEM_ALERT',
        title: '🔥 WebSocket Test #1',
        message: 'First real-time notification via WebSocket!',
        priority: 'high'
      },
      {
        type: 'EXAM_REMINDER', 
        title: '📚 WebSocket Test #2',
        message: 'Second notification - exam reminder type',
        priority: 'normal'
      },
      {
        type: 'CERTIFICATE_READY',
        title: '🏆 WebSocket Test #3', 
        message: 'Third notification - certificate ready!',
        priority: 'high'
      },
      {
        type: 'PAYMENT_SUCCESS',
        title: '💰 WebSocket Test #4',
        message: 'Fourth notification - payment successful',
        priority: 'normal'
      },
      {
        type: 'USER_REGISTERED',
        title: '👤 WebSocket Test #5',
        message: 'Fifth notification - new user registered',
        priority: 'low'
      }
    ];

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      
      console.log(`📤 Sending notification ${i + 1}/5:`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Priority: ${notification.priority}`);
      
      try {
        const response = await axios.post(
          `${API_BASE}/notifications/test`,
          {
            ...notification,
            userId: userId
          },
          { headers }
        );
        
        console.log('   ✅ Sent successfully!');
        
        if (i < notifications.length - 1) {
          console.log('   ⏳ Waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.log('   ❌ Failed:', error.response?.data?.message || error.message);
      }
      
      console.log('');
    }

    console.log('🎯 WHAT YOU SHOULD SEE:');
    console.log('=======================');
    console.log('✅ Badge count increases by 5 (one for each notification)');
    console.log('✅ Toast notifications slide in from top-right corner');
    console.log('✅ Browser notifications appear (if permission granted)');
    console.log('✅ Dropdown shows new notifications at the top');
    console.log('✅ All happens INSTANTLY without page refresh');
    console.log('✅ WebSocket connection shows activity in dev tools');
    console.log('');
    console.log('🔍 DEBUG TIPS:');
    console.log('==============');
    console.log('• Check browser console for: "🔔 Real-time notification received"');
    console.log('• Check Network tab for WebSocket activity');
    console.log('• Verify notification badge count increased by 5');
    console.log('• Click notification icon to see dropdown with new notifications');
    console.log('');
    console.log('🎉 Basic WebSocket test completed!');
    console.log('💡 If notifications appeared instantly, WebSocket is working perfectly!');

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

testBasicWebSocket();