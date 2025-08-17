const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugCompleteEndpoint() {
  try {
    console.log('🔍 Debugging complete endpoint...\n');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });
    
    const token = loginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${token}` };
    
    // Start an exam
    const startResponse = await axios.post(`${BASE_URL}/exams/cmdxemzpq0009i2l47dst2dmf/start`, {}, { headers: studentHeaders });
    const attemptId = startResponse.data.data.attempt.id;
    
    console.log('📝 Started exam attempt:', attemptId);
    
    // Submit a good essay answer
    const goodAnswer = "Water cycle is a fundamental natural process where water evaporates, condenses, and precipitates. It's crucial for distributing freshwater globally and regulating Earth's temperature.";
    
    const response = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: [{
        questionId: 'cmdxemzpq0009i2l47dst2dmf',
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: goodAnswer
      }]
    }, { headers: studentHeaders });
    
    console.log('📊 Complete Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check the specific fields
    const result = response.data.data?.results;
    console.log('\n📊 Extracted Fields:');
    console.log('Score:', result?.score);
    console.log('Percentage:', result?.percentage);
    console.log('Correct Answers:', result?.correctAnswers);
    console.log('Wrong Answers:', result?.wrongAnswers);
    console.log('Is Passed:', result?.isPassed);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugCompleteEndpoint(); 