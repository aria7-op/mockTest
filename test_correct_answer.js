const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testCorrectAnswer() {
  try {
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🔍 Testing correct answer for exam:', examId);
    
    // Start exam attempt
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers });
    
    if (!startResponse.data.success) {
      console.log('❌ Failed to start exam:', startResponse.data.message);
      return;
    }
    
    const attemptId = startResponse.data.data.attempt.id;
    const questions = startResponse.data.data.questions;
    const essayQuestions = questions.filter(q => q.type === 'ESSAY');
    
    console.log(`✅ Started attempt: ${attemptId}`);
    console.log(`📝 Found ${essayQuestions.length} essay questions`);
    
    // Test with a correct answer about photosynthesis
    const correctAnswer = `Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process occurs in the chloroplasts of plant cells, specifically in the chlorophyll-containing organelles. The process is essential for oxygen production and forms the base of the food chain, providing energy for all living organisms.`;
    
    console.log('\n--- Testing Correct Answer ---');
    console.log(`Question: ${essayQuestions[0].text.substring(0, 100)}...`);
    console.log(`Answer: ${correctAnswer}`);
    console.log('Expected: Should get high score (70-100%) because it correctly explains photosynthesis');
    
    const responses = [{
      questionId: essayQuestions[0].id,
      selectedOptions: [],
      timeSpent: 30,
      essayAnswer: correctAnswer
    }];
    
    // Complete the attempt
    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: responses
    }, { headers });
    
    if (completeResponse.data.success) {
      const score = completeResponse.data.data?.score || 0;
      const percentage = completeResponse.data.data?.percentage || 0;
      console.log(`✅ Score: ${score}/${completeResponse.data.data?.maxMarks || 10} (${percentage}%)`);
      
      if (percentage >= 70) {
        console.log(`✅ Score looks excellent for correct answer`);
      } else if (percentage >= 50) {
        console.log(`✅ Score looks good for correct answer`);
      } else {
        console.log(`⚠️  Score might be too low for a correct answer`);
      }
    } else {
      console.log(`❌ Failed: ${completeResponse.data.message}`);
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCorrectAnswer(); 