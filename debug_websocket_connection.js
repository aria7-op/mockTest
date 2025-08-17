const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api/v1';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@mocktest.com',
  password: 'Admin@123'
};

async function debugWebSocketConnection() {
  console.log('🔍 WEBSOCKET CONNECTION DEBUG');
  console.log('=============================');
  console.log('');

  try {
    // 1. Check if backend server is running
    console.log('1️⃣ Checking backend server...');
    try {
      const healthCheck = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend server is running');
    } catch (error) {
      console.log('❌ Backend server is NOT running');
      console.log('💡 Start the backend with: npm start');
      return;
    }

    // 2. Check authentication
    console.log('');
    console.log('2️⃣ Testing authentication...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Authentication failed');
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log(`✅ Authenticated as: ${loginResponse.data.data.user.firstName} (${userId})`);

    // 3. Check notification API endpoints
    console.log('');
    console.log('3️⃣ Testing notification API endpoints...');
    
    try {
      const notificationsResponse = await axios.get(`${API_BASE}/notifications`, { headers });
      console.log(`✅ Notifications API works - found ${notificationsResponse.data.data.notifications.length} notifications`);
    } catch (error) {
      console.log('❌ Notifications API failed:', error.response?.data?.message || error.message);
    }

    try {
      const statsResponse = await axios.get(`${API_BASE}/notifications/stats`, { headers });
      console.log(`✅ Stats API works - ${statsResponse.data.data.total} total notifications`);
    } catch (error) {
      console.log('❌ Stats API failed:', error.response?.data?.message || error.message);
    }

    // 4. Test notification creation and check if WebSocket emission happens
    console.log('');
    console.log('4️⃣ Testing notification creation with WebSocket emission...');
    
    // Get initial count
    const initialStats = await axios.get(`${API_BASE}/notifications/stats`, { headers });
    const initialCount = initialStats.data.data.unread;
    console.log(`📊 Initial unread count: ${initialCount}`);

    // Send a test notification
    console.log('📤 Sending test notification...');
    const testNotification = await axios.post(
      `${API_BASE}/notifications/test`,
      {
        type: 'SYSTEM_ALERT',
        title: '🔍 Debug Test Notification',
        message: 'This is a debug test to check WebSocket emission',
        priority: 'high',
        userId: userId
      },
      { headers }
    );

    console.log('✅ Test notification sent via API');

    // Wait a moment and check count again
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const afterStats = await axios.get(`${API_BASE}/notifications/stats`, { headers });
    const afterCount = afterStats.data.data.unread;
    console.log(`📊 After notification count: ${afterCount}`);

    if (afterCount > initialCount) {
      console.log('✅ Notification was created in database');
    } else {
      console.log('❌ Notification was NOT created in database');
    }

    // 5. Check WebSocket emission directly in backend logs
    console.log('');
    console.log('5️⃣ Checking WebSocket emission...');
    console.log('⚠️  Check your backend terminal for these logs:');
    console.log('   - "📡 WebSocket notification emitted to user-<userId>"');
    console.log('   - "🔔 Notification sent successfully via WebSocket"');
    console.log('');

    // 6. Check if the issue is in the notification service
    console.log('6️⃣ Checking advanced notification service integration...');
    
    // Check if global.notificationService exists by sending another notification
    try {
      await axios.post(
        `${API_BASE}/notifications/test`,
        {
          type: 'USER_REGISTERED',
          title: '👤 Service Integration Test',
          message: 'Testing if advanced notification service is working',
          priority: 'normal',
          userId: userId
        },
        { headers }
      );
      console.log('✅ Advanced notification service is accessible');
    } catch (error) {
      console.log('❌ Advanced notification service failed:', error.response?.data?.message || error.message);
    }

    // 7. Database verification
    console.log('');
    console.log('7️⃣ Verifying database notifications...');
    
    const dbNotifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📊 Found ${dbNotifications.length} notifications in database for user`);
    if (dbNotifications.length > 0) {
      console.log('📝 Latest notifications:');
      dbNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${notif.status}`);
      });
    }

    console.log('');
    console.log('🎯 DIAGNOSIS:');
    console.log('=============');
    console.log('');
    
    if (afterCount > initialCount) {
      console.log('✅ Backend notification system is working');
      console.log('✅ Database is receiving notifications');
      console.log('⚠️  Issue is likely in WebSocket connection between backend and frontend');
      console.log('');
      console.log('🔧 NEXT STEPS:');
      console.log('1. Check your FRONTEND browser console for WebSocket errors');
      console.log('2. Check Network tab for WebSocket connection status');
      console.log('3. Verify frontend is connecting to the right WebSocket URL');
      console.log('4. Make sure you\'re logged in to frontend with the same user');
      console.log('5. Check if frontend NotificationCenter component is properly mounted');
    } else {
      console.log('❌ Backend notification creation is failing');
      console.log('🔧 Check backend logs for errors in notification service');
    }

    console.log('');
    console.log('📋 FRONTEND DEBUGGING CHECKLIST:');
    console.log('================================');
    console.log('In your browser console, look for:');
    console.log('✅ "🔌 Socket connected"');
    console.log('✅ "👤 Joined user room: user-<userId>"');
    console.log('✅ "🔔 Real-time notification received"');
    console.log('✅ WebSocket connection in Network tab');
    console.log('❌ Any CORS errors');
    console.log('❌ Any connection failures');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugWebSocketConnection();