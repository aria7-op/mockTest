const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function testFinalScoring() {
  try {
    console.log('🧪 Final Test: Essay and Multiple Choice Scoring');
    
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    // Test with exam that has both essay and multiple choice questions
    const examId = 'cmdxemzpq0009i2l47dst2dmf';
    
    console.log('🚀 Starting fresh exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
    
    if (startResponse.data.success) {
      const questions = startResponse.data.data.questions;
      const attemptId = startResponse.data.data.attempt.id;
      
      console.log(`📝 Fresh attempt started: ${attemptId}`);
      console.log(`📝 Total Questions: ${questions.length}`);
      
      // Categorize questions
      const mcQuestions = questions.filter(q => q.type === 'MULTIPLE_CHOICE' || q.type === 'SINGLE_CHOICE');
      const essayQuestions = questions.filter(q => q.type === 'ESSAY');
      
      console.log(`📝 Multiple Choice Questions: ${mcQuestions.length}`);
      console.log(`📝 Essay Questions: ${essayQuestions.length}`);
      
      // Get correct answers from database
      const responses = [];
      
      // Add multiple choice responses with correct answers
      for (const question of mcQuestions) {
        const dbQuestion = await prisma.question.findUnique({
          where: { id: question.id },
          include: { options: true }
        });
        
        const correctOptionIds = dbQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        responses.push({
          questionId: question.id,
          selectedOptions: correctOptionIds,
          timeSpent: 30,
          essayAnswer: null
        });
      }
      
      // Add essay responses with good answers
      for (const question of essayQuestions) {
        const dbQuestion = await prisma.question.findUnique({
          where: { id: question.id },
          include: { options: true }
        });
        
        const correctAnswer = dbQuestion.options.find(opt => opt.isCorrect)?.text || 'This is a comprehensive and well-structured answer that demonstrates understanding of the topic.';
        
        responses.push({
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 120,
          essayAnswer: correctAnswer
        });
      }
      
      console.log(`📝 Submitting ${responses.length} responses (${mcQuestions.length} MC + ${essayQuestions.length} Essay)...`);
      
      const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers: studentHeaders });
      
      if (completeResponse.data.success) {
        const results = completeResponse.data.data.results;
        console.log('\n📊 FINAL RESULTS:');
        console.log(`- Total Score: ${results.score}/${results.totalQuestions}`);
        console.log(`- Percentage: ${results.percentage}%`);
        console.log(`- Correct Answers: ${results.correctAnswers}`);
        console.log(`- Wrong Answers: ${results.wrongAnswers}`);
        console.log(`- Unanswered: ${results.unanswered}`);
        console.log(`- Is Passed: ${results.isPassed}`);
        
        if (results.percentage >= 80) {
          console.log('✅ Both essay and multiple choice scoring are working correctly!');
        } else {
          console.log('❌ There may still be issues with scoring');
        }
      } else {
        console.log('❌ Failed to complete exam:', completeResponse.data.message);
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

testFinalScoring(); 