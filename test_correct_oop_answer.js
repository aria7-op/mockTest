const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testCorrectOOPAnswer() {
  try {
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🔍 Testing correct OOP answer for exam:', examId);
    
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
    
    // Test with a correct answer about OOP
    const correctOOPAnswer = `Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.`;
    
    console.log('\n--- Testing Correct OOP Answer ---');
    console.log(`Question: ${essayQuestions[0].text.substring(0, 100)}...`);
    console.log(`Answer: ${correctOOPAnswer.substring(0, 200)}...`);
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
      const score = completeResponse.data.data?.score || 0;
      const percentage = completeResponse.data.data?.percentage || 0;
      console.log(`✅ Score: ${score}/${completeResponse.data.data?.maxMarks || 10} (${percentage}%)`);
      
      if (percentage >= 80) {
        console.log(`✅ Score looks excellent for correct OOP answer`);
      } else if (percentage >= 60) {
        console.log(`✅ Score looks good for correct OOP answer`);
      } else {
        console.log(`⚠️  Score might be too low for a correct OOP answer`);
      }
    } else {
      console.log(`❌ Failed: ${completeResponse.data.message}`);
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCorrectOOPAnswer(); 