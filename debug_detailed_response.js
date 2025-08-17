const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugDetailedResponse() {
  try {
    console.log('🔍 Debugging detailed response structure');
    
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
          return {
            questionId: question.id,
            selectedOptions: [],
            timeSpent: 30,
            essayAnswer: correctOption ? correctOption.text : "This is a test answer."
          };
        } else {
          const correctOptions = question.options.filter(opt => opt.isCorrect);
          return {
            questionId: question.id,
            selectedOptions: correctOptions.map(opt => opt.id),
            timeSpent: 30
          };
        }
      });
      
      console.log(`📝 Submitting ${responses.length} responses...`);
      
      const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers: studentHeaders });
      
      console.log('\n📊 COMPLETE RESPONSE STRUCTURE:');
      console.log(JSON.stringify(completeResponse.data, null, 2));
      
      if (completeResponse.data.success) {
        console.log('\n📊 EXTRACTED DATA:');
        console.log(`- Score: ${completeResponse.data.data?.score}`);
        console.log(`- Max Marks: ${completeResponse.data.data?.maxMarks}`);
        console.log(`- Percentage: ${completeResponse.data.data?.percentage}`);
        console.log(`- Is Passed: ${completeResponse.data.data?.isPassed}`);
        console.log(`- Total Questions: ${completeResponse.data.data?.totalQuestions}`);
        console.log(`- Correct Answers: ${completeResponse.data.data?.correctAnswers}`);
        console.log(`- Wrong Answers: ${completeResponse.data.data?.wrongAnswers}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugDetailedResponse(); 