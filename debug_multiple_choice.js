const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function debugMultipleChoice() {
  try {
    console.log('🔍 Debugging multiple choice question scoring');
    
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    const examId = 'cmdxemzpq0009i2l47dst2dmf';
    
    // Start a fresh attempt
    console.log('🚀 Starting fresh exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
    
    if (startResponse.data.success) {
      const questions = startResponse.data.data.questions;
      const attemptId = startResponse.data.data.attempt.id;
      
      console.log(`📝 Fresh attempt started: ${attemptId}`);
      console.log(`📝 Questions: ${questions.length}`);
      
      // Find multiple choice questions
      const mcQuestions = questions.filter(q => q.type === 'MULTIPLE_CHOICE' || q.type === 'SINGLE_CHOICE');
      console.log(`📝 Found ${mcQuestions.length} multiple choice questions`);
      
      if (mcQuestions.length === 0) {
        console.log('❌ No multiple choice questions found in this exam');
        return;
      }
      
      // Test the first multiple choice question
      const question = mcQuestions[0];
      console.log(`\n📝 Question: ${question.text.substring(0, 100)}...`);
      console.log(`📝 Question Type: ${question.type}`);
      console.log(`📝 Options:`, question.options.map(opt => ({ id: opt.id, text: opt.text.substring(0, 50) })));
      
      // Get the correct answer from database
      const dbQuestion = await prisma.question.findUnique({
        where: { id: question.id },
        include: { options: true }
      });
      
      const correctOptions = dbQuestion.options.filter(opt => opt.isCorrect);
      const correctOptionIds = correctOptions.map(opt => opt.id);
      
      console.log(`📝 Correct option IDs from DB:`, correctOptionIds);
      console.log(`📝 Correct option texts:`, correctOptions.map(opt => opt.text.substring(0, 50)));
      
      // Test with correct answer
      console.log(`\n📝 Testing with CORRECT answer...`);
      const correctResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: [{
          questionId: question.id,
          selectedOptions: correctOptionIds,
          timeSpent: 30,
          essayAnswer: null
        }]
      }, { headers: studentHeaders });
      
      console.log(`📊 CORRECT ANSWER RESULT:`);
      console.log(`- Score: ${correctResponse.data.data?.results?.score}`);
      console.log(`- Percentage: ${correctResponse.data.data?.results?.percentage}`);
      console.log(`- Correct Answers: ${correctResponse.data.data?.results?.correctAnswers}`);
      console.log(`- Wrong Answers: ${correctResponse.data.data?.results?.wrongAnswers}`);
      
      // Test with wrong answer
      console.log(`\n📝 Testing with WRONG answer...`);
      const wrongOptionIds = question.options.filter(opt => !correctOptionIds.includes(opt.id)).map(opt => opt.id);
      
      // Start a new attempt for wrong answer
      const startResponse2 = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
      const attemptId2 = startResponse2.data.data.attempt.id;
      
      const wrongResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId2}/complete`, {
        responses: [{
          questionId: question.id,
          selectedOptions: wrongOptionIds.length > 0 ? [wrongOptionIds[0]] : [],
          timeSpent: 30,
          essayAnswer: null
        }]
      }, { headers: studentHeaders });
      
      console.log(`📊 WRONG ANSWER RESULT:`);
      console.log(`- Score: ${wrongResponse.data.data?.results?.score}`);
      console.log(`- Percentage: ${wrongResponse.data.data?.results?.percentage}`);
      console.log(`- Correct Answers: ${wrongResponse.data.data?.results?.correctAnswers}`);
      console.log(`- Wrong Answers: ${wrongResponse.data.data?.results?.wrongAnswers}`);
      
      // Analysis
      console.log('\n📊 ANALYSIS:');
      console.log(`Correct answer: ${correctResponse.data.data?.results?.percentage}%`);
      console.log(`Wrong answer: ${wrongResponse.data.data?.results?.percentage}%`);
      
      if (correctResponse.data.data?.results?.percentage > wrongResponse.data.data?.results?.percentage) {
        console.log('✅ Multiple choice scoring is working correctly!');
      } else {
        console.log('❌ Multiple choice scoring is NOT working correctly!');
      }
      
    } else {
      console.log(`❌ Failed to start exam: ${startResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error?.details) {
      console.error('❌ Validation details:', error.response.data.error.details);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugMultipleChoice(); 