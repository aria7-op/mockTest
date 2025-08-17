const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugResponseStructure() {
  try {
    console.log('🔍 Debugging response structure...\n');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@mocktest.com',
      password: 'student123'
    });
    
    const token = loginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${token}` };
    
    // Start an exam
    const startResponse = await axios.post(`${BASE_URL}/exams/cmdxemzpq0009i2l47dst2dmf/start`, {}, { headers: studentHeaders });
    const attemptId = startResponse.data.data.attempt.id;
    
    console.log('📝 Started exam attempt:', attemptId);
    
    // Submit a good essay answer
    const goodAnswer = "Object-Oriented Programming is a programming paradigm that organizes software design around objects. The four main principles are encapsulation, inheritance, polymorphism, and abstraction.";
    
    const response = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: [{
        questionId: 'cmdxemzpq0009i2l47dst2dmf',
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: goodAnswer
      }]
    }, { headers: studentHeaders });
    
    console.log('📊 Full Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check the specific fields
    const data = response.data.data;
    console.log('\n📊 Extracted Fields:');
    console.log('Score:', data?.score);
    console.log('Percentage:', data?.percentage);
    console.log('Correct Answers:', data?.correctAnswers);
    console.log('Wrong Answers:', data?.wrongAnswers);
    console.log('Is Passed:', data?.isPassed);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugResponseStructure(); 