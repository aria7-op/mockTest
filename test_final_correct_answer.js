const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testFinalCorrectAnswer() {
  try {
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🔍 Final test with correct OOP answer');
    
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
    
    // Test with the correct OOP answer that matches the question
    const correctOOPAnswer = `Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.`;
    
    console.log('\n--- Testing Correct OOP Answer ---');
    console.log(`Question: ${essayQuestions[0].text}`);
    console.log(`Student Answer: ${correctOOPAnswer.substring(0, 200)}...`);
    console.log('Expected: Should get high score (80-100%) because it correctly explains OOP and its four principles');
    
    const responses = [{
      questionId: essayQuestions[0].id,
      selectedOptions: [],
      timeSpent: 30,
      essayAnswer: correctOOPAnswer
    }];
    
    // Complete the attempt
    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: responses
    }, { headers });
    
    if (completeResponse.data.success) {
      console.log('\n✅ Exam completed successfully');
      
      // Get detailed results
      const resultsResponse = await axios.get(`${BASE_URL}/exams/attempts/${attemptId}`, { headers });
      
      if (resultsResponse.data.success && resultsResponse.data.data.responses && resultsResponse.data.data.responses.length > 0) {
        const response = resultsResponse.data.data.responses[0];
        console.log('\n📊 FINAL SCORING BREAKDOWN:');
        console.log(`Score: ${response.score}/${response.question.marks} (${response.percentage}%)`);
        console.log(`Feedback: ${response.feedback}`);
        if (response.detailedAnalysis) {
          console.log(`Detailed Analysis:`, JSON.stringify(response.detailedAnalysis, null, 2));
        }
        
        // Final assessment
        if (response.percentage >= 80) {
          console.log(`\n🎉 EXCELLENT! The system correctly gave a high score (${response.percentage}%) for a correct answer!`);
        } else if (response.percentage >= 60) {
          console.log(`\n✅ GOOD! The system correctly gave a good score (${response.percentage}%) for a correct answer!`);
        } else {
          console.log(`\n⚠️  The system might need adjustment - correct answer got ${response.percentage}%`);
        }
      }
    } else {
      console.log(`❌ Failed: ${completeResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFinalCorrectAnswer(); 