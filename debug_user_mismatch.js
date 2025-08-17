const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api/v1';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin1@mocktest.com',
  password: 'Admin@123'
};

async function debugUserMismatch() {
  console.log('🔍 USER MISMATCH DEBUG');
  console.log('======================');
  console.log('');

  try {
    // 1. Login and get user info
    console.log('1️⃣ Getting backend test user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Authentication failed');
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    const userName = loginResponse.data.data.user.firstName;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log(`📋 Backend test user: ${userName} (${userId})`);
    console.log('');

    // 2. Check all users in database
    console.log('2️⃣ All users in database:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        isActive: true
      },
      where: {
        isActive: true
      }
    });

    allUsers.forEach((user, index) => {
      const isTestUser = user.id === userId ? '👈 BACKEND TEST USER' : '';
      console.log(`   ${index + 1}. ${user.firstName} (${user.email}) - ${user.role} ${isTestUser}`);
      console.log(`      ID: ${user.id}`);
    });

    console.log('');

    // 3. Check notifications for each user
    console.log('3️⃣ Notification counts per user:');
    for (const user of allUsers) {
      const notificationCount = await prisma.notification.count({
        where: { userId: user.id }
      });
      
      const unreadCount = await prisma.notification.count({
        where: { 
          userId: user.id,
          status: 'UNREAD'
        }
      });

      const marker = user.id === userId ? '👈 BACKEND TEST USER' : '';
      console.log(`   ${user.firstName}: ${notificationCount} total, ${unreadCount} unread ${marker}`);
    }

    console.log('');

    // 4. Send notification to EACH active user
    console.log('4️⃣ Sending test notification to ALL active users...');
    
    for (const user of allUsers) {
      try {
        console.log(`📤 Sending to ${user.firstName} (${user.id})...`);
        
        await axios.post(
          `${API_BASE}/notifications/test`,
          {
            type: 'SYSTEM_ALERT',
            title: `🎯 Multi-User Test for ${user.firstName}`,
            message: `This notification is specifically for ${user.firstName} to test WebSocket delivery`,
            priority: 'high',
            userId: user.id
          },
          { headers }
        );
        
        console.log(`   ✅ Sent to ${user.firstName}`);
      } catch (error) {
        console.log(`   ❌ Failed for ${user.firstName}: ${error.message}`);
      }
    }

    console.log('');
    console.log('5️⃣ INSTRUCTIONS FOR FRONTEND TESTING:');
    console.log('=====================================');
    console.log('');
    console.log('🎯 TO TEST WEBSOCKET NOTIFICATIONS:');
    console.log('');
    console.log('1. Open your frontend at http://192.168.0.7:3000');
    console.log('2. Check which user you are logged in as');
    console.log('3. Find that user in the list above');
    console.log('4. You should now see a new notification for that user!');
    console.log('');
    console.log('📊 Expected behavior:');
    console.log('✅ Notification badge count should increase by 1');
    console.log('✅ Toast notification should slide in');
    console.log('✅ Browser notification should appear (if enabled)');
    console.log('✅ New notification should appear in dropdown');
    console.log('');

    // 6. Wait and check final counts
    console.log('6️⃣ Waiting 3 seconds then checking final counts...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📊 Final notification counts:');
    for (const user of allUsers) {
      const finalCount = await prisma.notification.count({
        where: { userId: user.id }
      });
      
      const finalUnreadCount = await prisma.notification.count({
        where: { 
          userId: user.id,
          status: 'UNREAD'
        }
      });

      console.log(`   ${user.firstName}: ${finalCount} total, ${finalUnreadCount} unread`);
    }

    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('===================');
    console.log('');
    console.log('If you STILL don\'t see notifications in frontend:');
    console.log('');
    console.log('1. 🔍 Check browser console for:');
    console.log('   - "🔔 Real-time notification received"');
    console.log('   - "👤 Joined user room: user-<userId>"');
    console.log('   - WebSocket connection errors');
    console.log('');
    console.log('2. 🌐 Check Network tab for:');
    console.log('   - WebSocket connection to localhost:5000');
    console.log('   - WebSocket messages being sent/received');
    console.log('');
    console.log('3. 🔄 Try refreshing the frontend page');
    console.log('');
    console.log('4. 🔌 Check if WebSocket room joining is working:');
    console.log('   Look for backend logs showing user joining rooms');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugUserMismatch();