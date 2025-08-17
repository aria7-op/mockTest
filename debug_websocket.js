// WebSocket Connection Debug Script
const { io } = require('socket.io-client');

async function debugWebSocket() {
  console.log('🔌 Debugging WebSocket Connection...\n');

  try {
    // 1. Test basic connection
    console.log('🔌 Step 1: Testing Basic WebSocket Connection');
    
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      console.log('🆔 Socket ID:', socket.id);
      console.log('🔌 Transport:', socket.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection error:', error.message);
      console.log('🔍 Error details:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.log('❌ WebSocket reconnection error:', error.message);
    });

    // 2. Test authentication
    console.log('\n🔐 Step 2: Testing WebSocket Authentication');
    
    // Wait for connection, then test auth
    socket.on('connect', async () => {
      console.log('🔐 Testing authentication...');
      
      try {
        // Test with a sample token
        const testToken = 'test-token-123';
        socket.emit('authenticate', { token: testToken });
        
        // Wait a bit for response
        setTimeout(() => {
          console.log('🔐 Authentication test completed');
        }, 2000);
        
      } catch (error) {
        console.log('❌ Authentication test failed:', error.message);
      }
    });

    // 3. Test room joining
    console.log('\n🏠 Step 3: Testing Room Joining');
    
    socket.on('connect', () => {
      console.log('🏠 Testing room joining...');
      
      // Test joining user room
      const testUserId = 'test-user-123';
      socket.emit('join-user', { userId: testUserId });
      
      // Test joining admin room
      socket.emit('join-admin', { userId: testUserId, userRole: 'ADMIN' });
      
      console.log('🏠 Room joining test completed');
    });

    // 4. Listen for server events
    console.log('\n👂 Step 4: Listening for Server Events');
    
    socket.on('welcome', (data) => {
      console.log('👋 Welcome message received:', data);
    });

    socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
    });

    socket.on('new-exam-available', (data) => {
      console.log('📚 New exam notification received:', data);
    });

    socket.on('admin-notification', (data) => {
      console.log('👨‍💼 Admin notification received:', data);
    });

    // 5. Test sending events
    console.log('\n📤 Step 5: Testing Event Sending');
    
    socket.on('connect', () => {
      console.log('📤 Testing event sending...');
      
      // Test sending a test event
      socket.emit('test-event', { message: 'Hello from debug script!' });
      
      console.log('📤 Event sending test completed');
    });

    // 6. Check connection status
    console.log('\n📊 Step 6: Connection Status Check');
    
    const checkStatus = () => {
      console.log('📊 Connection Status:');
      console.log('  Connected:', socket.connected);
      console.log('  ID:', socket.id);
      console.log('  Transport:', socket.io?.engine?.transport?.name || 'Unknown');
      console.log('  Reconnecting:', socket.io?.engine?.reconnecting || false);
    };

    // Check status after connection
    socket.on('connect', () => {
      setTimeout(checkStatus, 1000);
    });

    // 7. Test cleanup
    console.log('\n🧹 Step 7: Testing Cleanup');
    
    setTimeout(() => {
      console.log('🧹 Disconnecting for cleanup test...');
      socket.disconnect();
      
      setTimeout(() => {
        console.log('🧹 Cleanup test completed');
        process.exit(0);
      }, 2000);
    }, 10000);

    // Error handling
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, cleaning up...');
      socket.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.log('❌ WebSocket debug failed:', error.message);
    process.exit(1);
  }
}

debugWebSocket();