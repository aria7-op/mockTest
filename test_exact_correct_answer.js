const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testExactCorrectAnswer() {
  try {
    console.log('🔍 Testing with exact correct answer from database');
    
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
      
      // Use the exact correct answers from the database
      const correctAnswers = [
        "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.",
        "Renewable: solar, wind, hydro - replenished, eco-friendly. Non-renewable: fossil fuels - finite, polluting. Renewable more important for future."
      ];
      
      const responses = questions.map((question, index) => {
        const correctAnswer = correctAnswers[index] || correctAnswers[0];
        console.log(`\n📝 Question: ${question.text.substring(0, 100)}...`);
        console.log(`📝 Using exact correct answer: ${correctAnswer.substring(0, 100)}...`);
        
        return {
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 30,
          essayAnswer: correctAnswer
        };
      });
      
      console.log(`\n📝 Submitting ${responses.length} responses with exact correct answers...`);
      
      const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers: studentHeaders });
      
      console.log('\n📊 COMPLETE RESPONSE:');
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
        console.log(`- Unanswered: ${completeResponse.data.data?.unanswered}`);
        
        if (completeResponse.data.data?.percentage >= 80) {
          console.log('\n🎉 SUCCESS! The essay scoring is working correctly!');
        } else {
          console.log('\n⚠️  The essay scoring might need adjustment.');
        }
      }
    } else {
      console.log(`❌ Failed to start exam: ${startResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testExactCorrectAnswer(); 