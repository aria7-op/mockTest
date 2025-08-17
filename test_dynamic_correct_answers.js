const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function testDynamicCorrectAnswers() {
  try {
    console.log('🔍 Testing with dynamic correct answers from database');
    
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
        
        responses.push({
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 30,
          essayAnswer: correctAnswer
        });
      }
      
      console.log(`\n📝 Submitting ${responses.length} responses with correct answers from database...`);
      
      const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers: studentHeaders });
      
      console.log('\n📊 COMPLETE RESPONSE:');
      console.log(JSON.stringify(completeResponse.data, null, 2));
      
      if (completeResponse.data.success) {
        console.log('\n📊 EXTRACTED DATA:');
        console.log(`- Score: ${completeResponse.data.data?.results?.score}`);
        console.log(`- Max Marks: ${completeResponse.data.data?.results?.totalQuestions}`);
        console.log(`- Percentage: ${completeResponse.data.data?.results?.percentage}`);
        console.log(`- Is Passed: ${completeResponse.data.data?.results?.isPassed}`);
        console.log(`- Total Questions: ${completeResponse.data.data?.results?.totalQuestions}`);
        console.log(`- Correct Answers: ${completeResponse.data.data?.results?.correctAnswers}`);
        console.log(`- Wrong Answers: ${completeResponse.data.data?.results?.wrongAnswers}`);
        console.log(`- Unanswered: ${completeResponse.data.data?.results?.unanswered}`);
        
        // Check if we got a good score
        if (completeResponse.data.data?.results?.percentage >= 80) {
          console.log('\n🎉 SUCCESS! The essay scoring is working correctly!');
        } else if (completeResponse.data.data?.results?.percentage >= 50) {
          console.log('\n✅ The essay scoring is working, but could be improved.');
        } else {
          console.log('\n⚠️  The essay scoring might need adjustment.');
        }
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

testDynamicCorrectAnswers(); 