const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function debugEssayScoring() {
  try {
    console.log('🔍 Debugging essay scoring with different answers');
    
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    // Start a fresh attempt
    console.log('🚀 Starting fresh exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
    
    if (startResponse.data.success) {
      const questions = startResponse.data.data.questions;
      const attemptId = startResponse.data.data.attempt.id;
      
      console.log(`📝 Fresh attempt started: ${attemptId}`);
      console.log(`📝 Questions: ${questions.length}`);
      
      // Get correct answers from database for each question
      const responses = [];
      
      for (const question of questions) {
        console.log(`\n📝 Question: ${question.text.substring(0, 100)}...`);
        
        // Get the correct answer from database
        const dbQuestion = await prisma.question.findUnique({
          where: { id: question.id },
          include: { options: true }
        });
        
        const correctOption = dbQuestion.options.find(opt => opt.isCorrect);
        const correctAnswer = correctOption ? correctOption.text : "This is a test answer.";
        
        console.log(`📝 Correct answer from DB: ${correctAnswer.substring(0, 100)}...`);
        
        // Test with correct answer
        responses.push({
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 30,
          essayAnswer: correctAnswer
        });
      }
      
      console.log(`\n📝 Submitting ${responses.length} responses with CORRECT answers...`);
      
      const correctResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers: studentHeaders });
      
      console.log('\n📊 CORRECT ANSWERS RESPONSE:');
      console.log(`- Score: ${correctResponse.data.data?.results?.score}`);
      console.log(`- Percentage: ${correctResponse.data.data?.results?.percentage}`);
      console.log(`- Correct Answers: ${correctResponse.data.data?.results?.correctAnswers}`);
      console.log(`- Wrong Answers: ${correctResponse.data.data?.results?.wrongAnswers}`);
      
      // Now test with wrong answers
      const wrongResponses = questions.map((question, index) => ({
        questionId: question.id,
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: `This is a completely wrong answer for question ${index + 1}. It has nothing to do with the topic.`
      }));
      
      // Start a new attempt for wrong answers
      const startResponse2 = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
      const attemptId2 = startResponse2.data.data.attempt.id;
      
      console.log(`\n📝 Submitting ${wrongResponses.length} responses with WRONG answers...`);
      
      const wrongResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId2}/complete`, {
        responses: wrongResponses
      }, { headers: studentHeaders });
      
      console.log('\n📊 WRONG ANSWERS RESPONSE:');
      console.log(`- Score: ${wrongResponse.data.data?.results?.score}`);
      console.log(`- Percentage: ${wrongResponse.data.data?.results?.percentage}`);
      console.log(`- Correct Answers: ${wrongResponse.data.data?.results?.correctAnswers}`);
      console.log(`- Wrong Answers: ${wrongResponse.data.data?.results?.wrongAnswers}`);
      
      // Compare results
      console.log('\n📊 COMPARISON:');
      console.log(`Correct answers: ${correctResponse.data.data?.results?.percentage}%`);
      console.log(`Wrong answers: ${wrongResponse.data.data?.results?.percentage}%`);
      
      if (correctResponse.data.data?.results?.percentage > wrongResponse.data.data?.results?.percentage) {
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

debugEssayScoring(); 