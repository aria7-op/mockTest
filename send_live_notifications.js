const axios = require('axios');

async function sendLiveNotifications() {
  try {
    console.log('🚀 Testing Real-time WebSocket Notifications');
    console.log('==========================================\n');

    // Login first
    console.log('🔐 Authenticating...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin1@mocktest.com',
      password: 'Admin@123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    const user = loginResponse.data.data.user;
    console.log(`✅ Logged in as: ${user.firstName} (${user.role})\n`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Array of test notifications to send
    const testNotifications = [
      {
        title: '🔥 LIVE WebSocket Test #1',
        message: 'This notification was sent in real-time! Check if it appears instantly without page refresh.',
        type: 'SYSTEM_ALERT',
        priority: 'high'
      },
      {
        title: '⚡ Real-time Update #2',
        message: 'Another live notification! This should appear immediately in your header badge.',
        type: 'SYSTEM_ALERT', 
        priority: 'normal'
      },
      {
        title: '🎯 WebSocket Test #3',
        message: 'Third real-time notification! Badge count should increase instantly.',
        type: 'EXAM_REMINDER',
        priority: 'high'
      },
      {
        title: '🏆 Achievement Unlocked!',
        message: 'You have successfully tested the real-time notification system! 🎉',
        type: 'CERTIFICATE_READY',
        priority: 'high'
      }
    ];

    console.log('📡 Sending real-time notifications...');
    console.log('👀 WATCH YOUR FRONTEND NOW!\n');

    for (let i = 0; i < testNotifications.length; i++) {
      const notification = testNotifications[i];
      
      console.log(`📤 Sending notification ${i + 1}/${testNotifications.length}:`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Priority: ${notification.priority}`);

      try {
        const response = await axios.post('http://localhost:5000/api/v1/notifications/test', 
          notification, { headers });

        if (response.data.success) {
          console.log(`   ✅ Sent successfully!`);
        } else {
          console.log(`   ❌ Failed:`, response.data);
        }
      } catch (error) {
        console.log(`   ❌ Error:`, error.response?.data || error.message);
      }

      // Wait 3 seconds between notifications to see them individually
      if (i < testNotifications.length - 1) {
        console.log('   ⏳ Waiting 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log('\n🎯 WHAT YOU SHOULD SEE IN FRONTEND:');
    console.log('=====================================');
    console.log('✅ Badge count increases by 4 (one for each notification)');
    console.log('✅ Toast notifications slide in from top-right corner');
    console.log('✅ Browser notifications appear (if permission granted)');
    console.log('✅ Dropdown shows new notifications at the top');
    console.log('✅ All happens INSTANTLY without page refresh');
    console.log('✅ WebSocket connection shows activity in dev tools\n');

    console.log('🔍 DEBUG TIPS:');
    console.log('==============');
    console.log('• Check browser console for: "🔔 Real-time notification received"');
    console.log('• Check Network tab for WebSocket activity');
    console.log('• Verify notification badge count increased');
    console.log('• Click notification icon to see dropdown with new notifications\n');

    console.log('🎉 Real-time WebSocket test completed!');
    console.log('💡 If notifications appeared instantly, WebSocket is working perfectly!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on localhost:5000');
      console.log('💡 Start it with: npm start');
    } else {
      console.error('❌ Test failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/health');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if backend server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Backend server is not running on localhost:5000');
    console.log('💡 Please start it first with: npm start');
    console.log('💡 Then run this script again');
    return;
  }

  console.log('✅ Backend server is running\n');
  
  console.log('📋 INSTRUCTIONS:');
  console.log('================');
  console.log('1. Make sure your FRONTEND is open at http://localhost:3000');
  console.log('2. Make sure you are LOGGED IN as admin@mocktest.com');
  console.log('3. Keep the notification dropdown CLOSED');
  console.log('4. Watch the notification badge in the header');
  console.log('5. This script will send 4 notifications with 3-second intervals\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Press ENTER when ready to start the WebSocket test... ', () => {
    readline.close();
    sendLiveNotifications();
  });
}

main();