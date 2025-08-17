const io = require('socket.io-client');

async function testStudentWebSocketConnection() {
  try {
    console.log('🧪 Testing Student WebSocket Connection...\n');

    // 1. First, get a student authentication token
    console.log('🔐 Getting student authentication token...');
    
    const axios = require('axios');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Student login failed');
      return;
    }

    const token = loginResponse.data.data.token;
    const student = loginResponse.data.data.user;
    console.log(`✅ Authenticated as student: ${student.firstName} ${student.lastName} (ID: ${student.id})`);

    // 2. Connect to WebSocket
    console.log('\n🔌 Connecting to WebSocket...');
    
    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });

    // 3. Handle connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      console.log(`🔌 Socket ID: ${socket.id}`);
      
      // Join user room
      socket.emit('join-user', { userId: student.id });
      console.log(`👤 Emitted join-user event for user ${student.id}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection error:', error.message);
    });

    // 4. Listen for notifications
    socket.on('notification', (notification) => {
      console.log('🔔 Received notification via WebSocket:');
      console.log('  Title:', notification.title);
      console.log('  Message:', notification.message);
      console.log('  Type:', notification.type);
      console.log('  Priority:', notification.priority);
      console.log('  Timestamp:', notification.timestamp);
    });

    // 5. Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Test notification delivery
    console.log('\n🧪 Testing notification delivery...');
    
    // Send a test notification via HTTP endpoint
    try {
      const testResponse = await axios.get('http://localhost:5000/api/v1/test/notification');
      console.log('✅ Test notification sent via HTTP endpoint');
      console.log('📊 Response:', testResponse.data);
      
      // Wait for WebSocket notification
      console.log('⏳ Waiting for WebSocket notification...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log('❌ Failed to send test notification:', error.message);
    }

    // 7. Test upcoming exams (should trigger notifications)
    console.log('\n📚 Testing upcoming exams endpoint...');
    try {
      const upcomingResponse = await axios.get('http://localhost:5000/api/v1/exams/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (upcomingResponse.data.success) {
        console.log('✅ Upcoming exams fetched successfully');
        console.log(`📊 Found ${upcomingResponse.data.data.exams.length} upcoming exams`);
        
        // Wait for notifications
        console.log('⏳ Waiting for upcoming exam notifications...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log('❌ Failed to fetch upcoming exams:', error.message);
    }

    // 8. Cleanup
    console.log('\n🧹 Cleaning up...');
    socket.disconnect();
    
    console.log('\n✅ WebSocket connection test completed!');
    console.log('\n💡 If you received notifications, the system is working!');
    console.log('💡 If not, check the server logs for WebSocket connection issues.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStudentWebSocketConnection(); 