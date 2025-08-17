const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugResponseProcessing() {
  try {
    console.log('🔍 Debugging response processing step by step');
    
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
      
      // Test with correct answers
      const responses = questions.map(question => {
        if (question.type === 'ESSAY') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          console.log(`\n📝 Question ${question.id} (ESSAY):`);
          console.log(`- Question: ${question.text.substring(0, 100)}...`);
          console.log(`- Correct Option: ${correctOption ? correctOption.text.substring(0, 100) + '...' : 'NOT FOUND'}`);
          console.log(`- Is Correct: ${correctOption ? correctOption.isCorrect : 'N/A'}`);
          
          return {
            questionId: question.id,
            selectedOptions: [],
            timeSpent: 30,
            essayAnswer: correctOption ? correctOption.text : "This is a test answer."
          };
        } else {
          const correctOptions = question.options.filter(opt => opt.isCorrect);
          console.log(`\n📝 Question ${question.id} (${question.type}):`);
          console.log(`- Question: ${question.text.substring(0, 100)}...`);
          console.log(`- Correct Options: ${correctOptions.length}`);
          correctOptions.forEach((opt, idx) => {
            console.log(`  ${idx + 1}. ${opt.text.substring(0, 50)}... (isCorrect: ${opt.isCorrect})`);
          });
          
          return {
            questionId: question.id,
            selectedOptions: correctOptions.map(opt => opt.id),
            timeSpent: 30
          };
        }
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
          if (response.selectedOptions && response.selectedOptions.length > 0) {
            console.log(`- Selected Options: ${response.selectedOptions.length}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugResponseProcessing(); 