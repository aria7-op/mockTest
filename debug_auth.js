const axios = require('axios');

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication issue...\n');

    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin1@mocktest.com',
      password: 'Admin@123'
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.accessToken;
    const user = loginResponse.data.data.user;
    console.log(`✅ Login successful for: ${user.firstName} (${user.role})`);
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

    // Test token validation with a simple API call
    console.log('\n2. Testing token with notification stats API...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const statsResponse = await axios.get('http://localhost:5000/api/v1/notifications/stats', { headers });
    console.log('Stats response status:', statsResponse.status);
    console.log('Stats response:', JSON.stringify(statsResponse.data, null, 2));

    // Test the notification test endpoint
    console.log('\n3. Testing notification test endpoint...');
    const testNotification = {
      title: '🧪 Debug Test Notification',
      message: 'Testing if authentication works for sending notifications',
      type: 'SYSTEM_ALERT',
      priority: 'normal'
    };

    const testResponse = await axios.post('http://localhost:5000/api/v1/notifications/test', 
      testNotification, { headers });
    
    console.log('Test notification response status:', testResponse.status);
    console.log('Test notification response:', JSON.stringify(testResponse.data, null, 2));

    console.log('\n✅ Authentication debugging completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    }
  }
}

debugAuth();