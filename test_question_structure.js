const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testQuestionStructure() {
  try {
    console.log('🔍 Testing question structure from API');
    
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
      
      console.log(`📝 Received ${questions.length} questions from API`);
      
      questions.forEach((question, index) => {
        console.log(`\n--- Question ${index + 1} ---`);
        console.log(`- ID: ${question.id}`);
        console.log(`- Type: ${question.type}`);
        console.log(`- Text: ${question.text.substring(0, 100)}...`);
        console.log(`- Marks: ${question.marks}`);
        console.log(`- Options Count: ${question.options ? question.options.length : 'NO OPTIONS'}`);
        
        if (question.options && question.options.length > 0) {
          question.options.forEach((option, optIndex) => {
            console.log(`  Option ${optIndex + 1}:`);
            console.log(`    - ID: ${option.id}`);
            console.log(`    - Text: ${option.text.substring(0, 100)}...`);
            console.log(`    - Is Correct: ${option.isCorrect}`);
          });
          
          const correctOptions = question.options.filter(opt => opt.isCorrect);
          console.log(`  Correct Options: ${correctOptions.length}`);
        } else {
          console.log('  ❌ NO OPTIONS FOUND - This is the problem!');
        }
      });
      
      // Test with the first question
      if (questions.length > 0) {
        const firstQuestion = questions[0];
        console.log(`\n🧪 Testing with first question: ${firstQuestion.id}`);
        
        if (firstQuestion.options && firstQuestion.options.length > 0) {
          const correctOption = firstQuestion.options.find(opt => opt.isCorrect);
          if (correctOption) {
            console.log(`✅ Found correct option: ${correctOption.text.substring(0, 100)}...`);
          } else {
            console.log(`❌ No correct option found in ${firstQuestion.options.length} options`);
          }
        } else {
          console.log('❌ No options found in question');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testQuestionStructure(); 