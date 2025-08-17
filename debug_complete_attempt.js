const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugCompleteAttempt() {
  try {
    console.log('🔍 Debugging complete attempt with detailed logging');
    
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    const examId = 'cmdyncpow000pi2x0kdykxugt';
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
    
    if (startResponse.data.success) {
      const questions = startResponse.data.data.questions;
      const attemptId = startResponse.data.data.attempt.id;
      
      console.log(`📝 Selected Questions: ${questions.length}`);
      
      // Test with a simple correct answer
      const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features.";
      
      const responses = questions.map(question => {
        console.log(`\n📝 Question ID: ${question.id}`);
        console.log(`📝 Question Type: ${question.type}`);
        console.log(`📝 Question Text: ${question.text.substring(0, 100)}...`);
        
        return {
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 30,
          essayAnswer: correctAnswer
        };
      });
      
      console.log(`\n📝 Submitting ${responses.length} responses...`);
      console.log('📋 Response payload:');
      console.log(JSON.stringify(responses, null, 2));
      
      const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers: studentHeaders });
      
      console.log('\n📊 COMPLETE RESPONSE:');
      console.log(JSON.stringify(completeResponse.data, null, 2));
      
      // Get detailed results
      const resultsResponse = await axios.get(`${BASE_URL}/exams/attempts/${attemptId}`, { headers: studentHeaders });
      
      if (resultsResponse.data.success && resultsResponse.data.data.responses) {
        console.log('\n📋 DETAILED RESPONSES:');
        resultsResponse.data.data.responses.forEach((response, index) => {
          console.log(`\n--- Response ${index + 1} ---`);
          console.log(`- Question ID: ${response.questionId}`);
          console.log(`- Question Type: ${response.question.type}`);
          console.log(`- Is Correct: ${response.isCorrect}`);
          console.log(`- Score: ${response.score}/${response.question.marks} (${response.percentage}%)`);
          console.log(`- Feedback: ${response.feedback}`);
          if (response.essayAnswer) {
            console.log(`- Essay Answer: ${response.essayAnswer.substring(0, 100)}...`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugCompleteAttempt(); 