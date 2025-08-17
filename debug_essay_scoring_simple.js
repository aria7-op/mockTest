const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugEssayScoring() {
  try {
    console.log('🔍 Debugging essay scoring with water cycle question...\n');
    
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mocktest.com',
      password: 'Admin@123'
    });
    
    const token = loginResponse.data.data.accessToken;
    const adminHeaders = { Authorization: `Bearer ${token}` };
    
    // Test data
    const correctAnswer = "Evaporation, condensation, precipitation, collection. Regulates temperature, distributes freshwater, maintains water balance on Earth.";
    const studentAnswer = "Water cycle is a fundamental natural process where water evaporates, condenses, and precipitates. It's crucial for distributing freshwater globally and regulating Earth's temperature.";
    
    console.log('📝 Correct Answer:', correctAnswer);
    console.log('📝 Student Answer:', studentAnswer);
    console.log('');
    
    // Test the essay scoring service directly
    const response = await axios.post(`${BASE_URL}/admin/test-essay`, {
      studentAnswer,
      correctAnswer,
      maxMarks: 10
    }, { headers: adminHeaders });
    
    console.log('📊 Scoring Result:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugEssayScoring(); 