const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const EXAM_ID = 'cmdxemzpq0009i2l47dst2dmf';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function testSpecificExam() {
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

    // Prepare answers with correct JavaScript answers
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
          // Use a generic good answer
          const genericAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features.";
          
          responses.push({
            questionId: question.id,
            selectedOptions: [],
            essayAnswer: genericAnswer,
            timeSpent: 120
          });
        }
      } else {
        // For multiple choice questions, provide correct answers based on question content
        let correctOptionId = null;
        
        if (question.text.includes('add an element to the end of an array')) {
          correctOptionId = question.options.find(opt => opt.text === 'push()')?.id;
        } else if (question.text.includes('callback function')) {
          correctOptionId = question.options.find(opt => opt.text === 'A function passed as an argument to another function')?.id;
        } else if (question.text.includes('JSON.parse')) {
          correctOptionId = question.options.find(opt => opt.text === 'To convert JSON string to JavaScript object')?.id;
        } else if (question.text.includes('use strict')) {
          correctOptionId = question.options.find(opt => opt.text === 'To catch common coding mistakes')?.id;
        } else if (question.text.includes('JSON.stringify') && question.text.includes('JSON.parse')) {
          correctOptionId = question.options.find(opt => opt.text === 'stringify converts object to JSON string, parse converts JSON string to object')?.id;
        } else if (question.text.includes('Date object')) {
          correctOptionId = question.options.find(opt => opt.text === 'To work with dates and times')?.id;
        } else if (question.text.includes('reduce method')) {
          correctOptionId = question.options.find(opt => opt.text === 'To reduce an array to a single value')?.id;
        } else if (question.text.includes('async/await')) {
          correctOptionId = question.options.find(opt => opt.text === 'To handle asynchronous operations more elegantly')?.id;
        }
        
        if (correctOptionId) {
          console.log(`   ✅ Selecting correct answer: ${question.options.find(opt => opt.id === correctOptionId)?.text}`);
          responses.push({
            questionId: question.id,
            selectedOptions: [correctOptionId],
            timeSpent: 60
          });
        } else {
          console.log(`   ❌ Could not determine correct answer, selecting first option`);
          responses.push({
            questionId: question.id,
            selectedOptions: [question.options[0].id],
            timeSpent: 60
          });
        }
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
    console.log(`   Total Marks: ${result.totalMarks}`);
    console.log(`   Obtained Marks: ${result.obtainedMarks}`);
    console.log(`   Percentage: ${result.percentage}%`);
    console.log(`   Passed: ${result.isPassed}`);
    console.log(`   Status: ${result.status}`);

    // Check if score was saved
    console.log('\n💾 Checking if score was saved...');
    const scoreResponse = await axios.get(`${BASE_URL}/exams/attempts/${attemptId}`, { headers });
    
    if (scoreResponse.data.success) {
      const attempt = scoreResponse.data.data;
      console.log(`   Attempt Score: ${attempt.obtainedMarks}/${attempt.totalMarks}`);
      console.log(`   Attempt Percentage: ${attempt.percentage}%`);
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
testSpecificExam(); 