const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugStepByStep() {
  try {
    console.log('🔍 Debugging step by step...\n');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });
    
    const token = loginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Logged in successfully');
    
    // Start an exam with essay questions
    const startResponse = await axios.post(`${BASE_URL}/exams/cmdyncpow000pi2x0kdykxugt/start`, {}, { headers: studentHeaders });
    const attemptId = startResponse.data.data.attempt.id;
    const questions = startResponse.data.data.questions;
    
    console.log('✅ Started exam attempt:', attemptId);
    console.log('📝 Questions count:', questions?.length || 'No questions array');
    
    // Find an essay question
    const essayQuestion = questions.find(q => q.type === 'ESSAY');
    if (!essayQuestion) {
      console.log('❌ No essay question found');
      return;
    }
    
    console.log('✅ Found essay question:', essayQuestion.id);
    console.log('📝 Question text:', essayQuestion.text.substring(0, 100) + '...');
    console.log('📝 Options count:', essayQuestion.options.length);
    
    // Get correct answer
    const correctOption = essayQuestion.options.find(opt => opt.isCorrect);
    console.log('📝 Correct answer:', correctOption?.text || 'No correct answer found');
    
    // Submit a good answer
    const goodAnswer = "Object-Oriented Programming is a programming paradigm that organizes software design around objects. The four main principles are encapsulation, inheritance, polymorphism, and abstraction.";
    
    console.log('📝 Submitting answer:', goodAnswer.substring(0, 100) + '...');
    console.log('📝 Question marks:', essayQuestion.marks);
    
    const response = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: [{
        questionId: essayQuestion.id,
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: goodAnswer
      }]
    }, { headers: studentHeaders });
    
    console.log('✅ Response received');
    console.log('📊 Response status:', response.status);
    
    console.log('\n📊 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const results = response.data.data.results;
    console.log('\n📊 Final Results:');
    console.log('Score:', results?.score);
    console.log('Percentage:', results?.percentage);
    console.log('Correct Answers:', results?.correctAnswers);
    console.log('Wrong Answers:', results?.wrongAnswers);
    console.log('Is Passed:', results?.isPassed);
    console.log('Total Questions:', results?.totalQuestions);
    console.log('Unanswered:', results?.unanswered);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugStepByStep(); 