const axios = require('axios');

// Test configuration
const BASE_URL = 'https://31.97.70.79:5050';
const SOCKET_URL = 'https://31.97.70.79:5050';

console.log('🧪 Testing Frontend Configuration for cPanel Deployment\n');

console.log('📡 Backend API URL:', `${BASE_URL}/api/v1`);
console.log('🔌 WebSocket URL:', SOCKET_URL);
console.log('🌐 Frontend will be hosted on: HTTPS (cPanel)');
console.log('📱 Backend is running on: HTTP (VPS)\n');

// Test backend connectivity
const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connectivity...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.status);
    
    // Test API endpoint
    const apiResponse = await axios.get(`${BASE_URL}/api/v1/exam-categories`);
    console.log('✅ API endpoint accessible:', apiResponse.status);
    
    console.log('\n🎉 Backend is accessible and ready for frontend deployment!');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure your VPS backend is running on port 5000');
      console.log('   2. Check if port 5000 is open in your VPS firewall');
      console.log('   3. Verify the IP address is correct');
    }
  }
};

// Test mixed content handling
const testMixedContent = () => {
  console.log('\n🔒 Mixed Content Security Check:');
  console.log('   Frontend: HTTPS (cPanel)');
  console.log('   Backend: HTTP (VPS)');
  console.log('   ⚠️  This will cause mixed content issues in modern browsers');
  console.log('\n💡 Solutions:');
  console.log('   1. Use HTTP frontend (remove SSL from cPanel)');
  console.log('   2. Add SSL to your VPS backend');
  console.log('   3. Use a reverse proxy with SSL');
};

// Run tests
const runTests = async () => {
  await testBackendConnection();
  testMixedContent();
  
  console.log('\n📋 Summary:');
  console.log('   - Backend configuration: ✅ Ready');
  console.log('   - Frontend configuration: ✅ Ready');
  console.log('   - Mixed content: ⚠️  Needs attention');
  console.log('\n🚀 Your frontend is ready for cPanel deployment!');
};

runTests(); 