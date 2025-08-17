const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:5000/api/v1';
const EXAM_ID = 'cmdyncpow000pi2x0kdykxugt';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

const prisma = new PrismaClient();

async function testVeryWeakEssayAnswer() {
  try {
    console.log('🔐 Logging in as student...');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }

    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    
    console.log('✅ Login successful');
    console.log(`👤 User ID: ${userId}`);

    // Set up headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Check if student has a booking for this exam
    console.log('\n📋 Checking exam bookings...');
    const bookingsResponse = await axios.get(`${BASE_URL}/bookings`, { headers });
    
    let booking = null;
    if (bookingsResponse.data.success && bookingsResponse.data.data.bookings) {
      booking = bookingsResponse.data.data.bookings.find(b => b.examId === EXAM_ID);
    }

    if (!booking) {
      console.log('❌ No booking found for this exam');
      return;
    }

    console.log(`✅ Found booking: ${booking.id}`);
    console.log(`📊 Booking status: ${booking.status}`);
    console.log(`📈 Attempts used: ${booking.attemptsUsed}/${booking.attemptsAllowed}`);

    // Start the exam attempt
    console.log('\n🚀 Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${EXAM_ID}/start`, {}, { headers });
    
    if (!startResponse.data.success) {
      throw new Error(`Failed to start exam: ${startResponse.data.message}`);
    }

    const attemptId = startResponse.data.data.attempt.id;
    console.log(`✅ Exam started. Attempt ID: ${attemptId}`);

    // Get the questions from the start response
    const questions = startResponse.data.data.questions;
    console.log(`📋 Found ${questions.length} questions`);

    // Prepare very weak answers
    console.log('\n🔍 Preparing very weak answers...');
    const responses = [];
    
    for (const question of questions) {
      console.log(`\n🔍 Question: ${question.text.substring(0, 100)}...`);
      console.log(`   Type: ${question.type}`);
      
      if (question.type === 'ESSAY') {
        // Use a very weak/off-topic answer
        const veryWeakAnswer = "Programming is writing code. Objects are things in code. There are different types of programming. Some use objects, some don't. It's important to write good code.";
        
        console.log(`   📝 Using very weak answer: ${veryWeakAnswer.substring(0, 100)}...`);
        
        responses.push({
          questionId: question.id,
          selectedOptions: [],
          essayAnswer: veryWeakAnswer,
          timeSpent: 30 // Very short time
        });
      } else {
        // For other question types, select correct options
        const correctOptions = question.options.filter(option => option.isCorrect);
        console.log(`   ✅ Selecting ${correctOptions.length} correct options`);
        
        responses.push({
          questionId: question.id,
          selectedOptions: correctOptions.map(option => option.id),
          timeSpent: 15
        });
      }
    }

    console.log(`\n📤 Submitting ${responses.length} responses...`);

    // Submit the attempt
    const submitResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: responses
    }, { headers });

    if (!submitResponse.data.success) {
      throw new Error(`Failed to submit exam: ${submitResponse.data.message}`);
    }

    const result = submitResponse.data.data;
    console.log('\n📊 Exam Results:');
    console.log(`   Total Marks: ${result.attempt.totalMarks}`);
    console.log(`   Obtained Marks: ${result.attempt.obtainedMarks}`);
    console.log(`   Percentage: ${result.attempt.percentage}%`);
    console.log(`   Passed: ${result.attempt.isPassed}`);
    console.log(`   Status: ${result.attempt.status}`);

    if (result.results) {
      console.log('\n📈 Detailed Results:');
      console.log(`   Total Questions: ${result.results.totalQuestions}`);
      console.log(`   Correct Answers: ${result.results.correctAnswers}`);
      console.log(`   Wrong Answers: ${result.results.wrongAnswers}`);
      console.log(`   Score: ${result.results.score}`);
      console.log(`   Grade: ${result.results.grade}`);
      console.log(`   Time Efficiency: ${result.results.timeEfficiency}`);
      console.log(`   Accuracy: ${result.results.accuracy}%`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testVeryWeakEssayAnswer(); 