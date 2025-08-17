const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function testEssayScoringVerification() {
  try {
    console.log('🧪 Testing Essay Scoring Verification');
    
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    // Test with the exam that has essay questions
    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🚀 Starting fresh exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
    
    if (startResponse.data.success) {
      const questions = startResponse.data.data.questions;
      const attemptId = startResponse.data.data.attempt.id;
      
      console.log(`📝 Fresh attempt started: ${attemptId}`);
      console.log(`📝 Questions: ${questions.length}`);
      
      // Find essay questions
      const essayQuestions = questions.filter(q => q.type === 'ESSAY');
      console.log(`📝 Essay Questions: ${essayQuestions.length}`);
      
      if (essayQuestions.length === 0) {
        console.log('❌ No essay questions found in this exam');
        return;
      }
      
      const question = essayQuestions[0];
      console.log(`\n📝 Question: ${question.text.substring(0, 100)}...`);
      
      // Get correct answer from database
      const dbQuestion = await prisma.question.findUnique({
        where: { id: question.id },
        include: { options: true }
      });
      
      const correctAnswer = dbQuestion.options.find(opt => opt.isCorrect)?.text || '';
      console.log(`📝 Correct answer from DB: ${correctAnswer.substring(0, 100)}...`);
      
      // Test with correct answer
      console.log(`\n📝 Testing with CORRECT answer...`);
      const correctResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: [{
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 120,
          essayAnswer: correctAnswer
        }]
      }, { headers: studentHeaders });
      
      console.log(`📊 CORRECT ANSWER RESULT:`);
      console.log(`- Score: ${correctResponse.data.data?.results?.score}`);
      console.log(`- Percentage: ${correctResponse.data.data?.results?.percentage}`);
      console.log(`- Correct Answers: ${correctResponse.data.data?.results?.correctAnswers}`);
      console.log(`- Wrong Answers: ${correctResponse.data.data?.results?.wrongAnswers}`);
      
      // Test with gibberish answer
      console.log(`\n📝 Testing with GIBBERISH answer...`);
      const startResponse2 = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
      const attemptId2 = startResponse2.data.data.attempt.id;
      
      const gibberishResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId2}/complete`, {
        responses: [{
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 120,
          essayAnswer: 'aldbaslbsjadhadsaldas asldkjasldkj asldkjalsdkj asldkjalsdkj asldkjalsdkj'
        }]
      }, { headers: studentHeaders });
      
      console.log(`📊 GIBBERISH ANSWER RESULT:`);
      console.log(`- Score: ${gibberishResponse.data.data?.results?.score}`);
      console.log(`- Percentage: ${gibberishResponse.data.data?.results?.percentage}`);
      console.log(`- Correct Answers: ${gibberishResponse.data.data?.results?.correctAnswers}`);
      console.log(`- Wrong Answers: ${gibberishResponse.data.data?.results?.wrongAnswers}`);
      
      // Analysis
      console.log('\n📊 ANALYSIS:');
      console.log(`Correct answer: ${correctResponse.data.data?.results?.percentage}%`);
      console.log(`Gibberish answer: ${gibberishResponse.data.data?.results?.percentage}%`);
      
      if (correctResponse.data.data?.results?.percentage > gibberishResponse.data.data?.results?.percentage) {
        console.log('✅ Essay scoring is working correctly!');
      } else {
        console.log('❌ Essay scoring is NOT working correctly!');
      }
      
    } else {
      console.log(`❌ Failed to start exam: ${startResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEssayScoringVerification(); 