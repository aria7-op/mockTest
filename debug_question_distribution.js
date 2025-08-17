const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function debugQuestionDistribution() {
  try {
    console.log('🔍 Debugging question distribution and scoring issues');
    
    // 1. Test question selection directly
    console.log('\n1. Testing question selection...');
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
      console.log(`📝 Selected Questions: ${questions.length}`);
      
      // Group by type
      const questionsByType = {};
      questions.forEach(q => {
        if (!questionsByType[q.type]) {
          questionsByType[q.type] = [];
        }
        questionsByType[q.type].push(q);
      });
      
      console.log('📊 Question Distribution:');
      Object.keys(questionsByType).forEach(type => {
        console.log(`- ${type}: ${questionsByType[type].length} questions`);
      });
      
      // 2. Test with correct answers
      console.log('\n2. Testing with correct answers...');
      const attemptId = startResponse.data.data.attempt.id;
      
      const responses = questions.map(question => {
        if (question.type === 'ESSAY') {
          // Use the correct answer from the database
          const correctOption = question.options.find(opt => opt.isCorrect);
          return {
            questionId: question.id,
            selectedOptions: [],
            timeSpent: 30,
            essayAnswer: correctOption ? correctOption.text : "This is a test answer."
          };
        } else {
          // For other question types, select correct options
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
      
      if (completeResponse.data.success) {
        console.log('✅ Exam completed successfully');
        console.log(`📊 Final Score: ${completeResponse.data.data.score}/${completeResponse.data.data.maxMarks} (${completeResponse.data.data.percentage}%)`);
        
        if (completeResponse.data.data.percentage < 80) {
          console.log('⚠️  WARNING: Score is too low for all correct answers!');
          
          // Get detailed results
          const resultsResponse = await axios.get(`${BASE_URL}/exams/attempts/${attemptId}`, { headers: studentHeaders });
          if (resultsResponse.data.success && resultsResponse.data.data.responses) {
            console.log('\n📋 Detailed Response Analysis:');
            resultsResponse.data.data.responses.forEach((response, index) => {
              console.log(`\nQuestion ${index + 1} (${response.question.type}):`);
              console.log(`- Score: ${response.score}/${response.question.marks} (${response.percentage}%)`);
              console.log(`- Is Correct: ${response.isCorrect}`);
              if (response.feedback) {
                console.log(`- Feedback: ${response.feedback}`);
              }
            });
          }
        } else {
          console.log('✅ Score looks correct for all correct answers!');
        }
      } else {
        console.log(`❌ Failed to complete exam: ${completeResponse.data.message}`);
      }
    } else {
      console.log(`❌ Failed to start exam: ${startResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugQuestionDistribution(); 