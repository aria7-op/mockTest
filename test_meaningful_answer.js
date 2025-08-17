const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testMeaningfulAnswer() {
  try {
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🔍 Testing meaningful but wrong answer for exam:', examId);
    
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
    
    // Test with a meaningful but wrong answer about OOP
    const meaningfulWrongAnswer = `Object-Oriented Programming is a software development approach that focuses on creating reusable code components called classes. The main principles include modularity, reusability, and maintainability. Classes contain properties and methods that define their behavior. This approach helps developers write cleaner and more organized code by grouping related functionality together.`;
    
    console.log('\n--- Testing Meaningful Wrong Answer ---');
    console.log(`Question: ${essayQuestions[0].text.substring(0, 100)}...`);
    console.log(`Answer: ${meaningfulWrongAnswer}`);
    console.log('Expected: Should get moderate score (30-60%) because it mentions OOP concepts but gets details wrong');
    
    const responses = [{
      questionId: essayQuestions[0].id,
      selectedOptions: [],
      timeSpent: 30,
      essayAnswer: meaningfulWrongAnswer
    }];
    
    // Complete the attempt
    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: responses
    }, { headers });
    
    if (completeResponse.data.success) {
      const score = completeResponse.data.data?.score || 0;
      const percentage = completeResponse.data.data?.percentage || 0;
      console.log(`✅ Score: ${score}/${completeResponse.data.data?.maxMarks || 10} (${percentage}%)`);
      
      if (percentage >= 30 && percentage <= 70) {
        console.log(`✅ Score looks reasonable for meaningful but wrong answer`);
      } else if (percentage < 30) {
        console.log(`⚠️  Score might be too low for a meaningful answer`);
      } else {
        console.log(`⚠️  Score might be too high for a wrong answer`);
      }
    } else {
      console.log(`❌ Failed: ${completeResponse.data.message}`);
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMeaningfulAnswer(); 