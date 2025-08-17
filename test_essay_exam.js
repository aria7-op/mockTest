const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const EXAM_ID = 'cmdyncpow000pi2x0kdykxugt';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function testEssayExam() {
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

    // If booking is not confirmed, confirm it first
    if (booking.status !== 'CONFIRMED') {
      console.log('\n🔧 Confirming booking...');
      await axios.patch(`${BASE_URL}/admin/bookings/${booking.id}/status`, {
        status: 'CONFIRMED'
      }, { headers });
      console.log('✅ Booking confirmed');
    }

    // Start the exam attempt
    console.log('\n🚀 Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${EXAM_ID}/start`, {}, { headers });
    
    console.log('Start response:', JSON.stringify(startResponse.data, null, 2));
    
    if (!startResponse.data.success) {
      throw new Error(`Failed to start exam: ${startResponse.data.message}`);
    }

    const attemptId = startResponse.data.data.attempt.id;
    console.log(`✅ Exam started. Attempt ID: ${attemptId}`);

    // Get the questions from the start response
    const questions = startResponse.data.data.questions;
    console.log(`📋 Found ${questions.length} questions`);

    // Prepare answers with correct essay answers
    const responses = [];
    
    for (const question of questions) {
      console.log(`\n🔍 Question: ${question.text.substring(0, 100)}...`);
      console.log(`   Type: ${question.type}`);
      
      if (question.type === 'ESSAY') {
        // For essay questions, get the correct answer from options
        const correctOption = question.options.find(option => option.isCorrect);
        if (correctOption) {
          const essayAnswer = correctOption.text;
          console.log(`   ✅ Using correct answer: ${essayAnswer.substring(0, 100)}...`);
          
          responses.push({
            questionId: question.id,
            selectedOptions: [],
            essayAnswer: essayAnswer,
            timeSpent: 120 // 2 minutes
          });
        } else {
          console.log(`   ❌ No correct answer found for essay question`);
          // Use a comprehensive OOP answer
          const comprehensiveAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, providing data hiding and ensuring data integrity through access modifiers like private, protected, and public. 2) Inheritance - creating new classes that are built upon existing classes, promoting code reuse and establishing hierarchical relationships. 3) Polymorphism - the ability of different objects to respond to the same method call in different ways, including method overloading and overriding. 4) Abstraction - hiding complex implementation details and showing only necessary features, focusing on what an object does rather than how it does it. OOP promotes code reusability, maintainability, and scalability while providing a clear structure for organizing code.";
          
          responses.push({
            questionId: question.id,
            selectedOptions: [],
            essayAnswer: comprehensiveAnswer,
            timeSpent: 120
          });
        }
      } else {
        // For other question types, select correct options
        const correctOptions = question.options.filter(option => option.isCorrect);
        console.log(`   ✅ Selecting ${correctOptions.length} correct options`);
        
        responses.push({
          questionId: question.id,
          selectedOptions: correctOptions.map(option => option.id),
          timeSpent: 60
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

    // Check attempts used
    console.log('\n📈 Checking attempts used...');
    const availableExamsResponse = await axios.get(`${BASE_URL}/exams/available`, { headers });
    
    if (availableExamsResponse.data.success) {
      const exam = availableExamsResponse.data.data.find(e => e.id === EXAM_ID);
      if (exam) {
        console.log(`   Attempts Used: ${exam.attemptsUsed}`);
        console.log(`   Can Take Exam: ${exam.canTakeExam}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testEssayExam(); 