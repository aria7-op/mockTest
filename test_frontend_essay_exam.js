const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const ADMIN_EMAIL = 'admin@mocktest.com';
const ADMIN_PASSWORD = 'Admin@123';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

// Sample essay question with correct answer
const essayQuestionData = {
  text: "Explain the concept of Object-Oriented Programming (OOP) and discuss its four main principles with examples.",
  type: 'ESSAY',
  difficulty: 'MEDIUM',
  marks: 10,
  timeLimit: 30,
  examCategoryId: 'cmdyb4pji0000i2ovlel4fmju', // Programming category
  options: [
    {
      text: "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.",
      isCorrect: true
    }
  ]
};

async function getAdminToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.data.success) {
      return response.data.data.accessToken;
    } else {
      throw new Error('Admin login failed');
    }
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getStudentToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    if (response.data.success) {
      return response.data.data.accessToken;
    } else {
      throw new Error('Student login failed');
    }
  } catch (error) {
    console.error('❌ Student login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testFrontendEssayExam() {
  try {
    console.log('🎯 Testing Frontend Essay Exam Flow\n');
    console.log('================================================================================');

    // Get admin token
    console.log('🔐 Getting admin token...');
    const adminToken = await getAdminToken();
    console.log('✅ Admin authentication successful\n');

    // Create essay question
    console.log('📝 Creating essay question with correct answer...');
    const createQuestionResponse = await axios.post(
      `${BASE_URL}/admin/questions`,
      essayQuestionData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!createQuestionResponse.data.success) {
      console.log('❌ Failed to create essay question:', createQuestionResponse.data);
      return;
    }

    const question = createQuestionResponse.data.data.question;
    console.log('✅ Essay question created successfully!');
    console.log(`📊 Question ID: ${question.id}\n`);

    // Create exam
    console.log('📋 Creating exam...');
    const examData = {
      title: "OOP Essay Test",
      description: "Test exam for OOP essay question",
      examCategoryId: 'cmdyb4pji0000i2ovlel4fmju',
      duration: 60,
      totalQuestions: 1,
      totalMarks: 10,
      passingMarks: 5,
      price: 0,
      isPublic: true,
      isActive: true,
              maxRetakes: 3
    };

    const createExamResponse = await axios.post(
      `${BASE_URL}/admin/exams`,
      examData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!createExamResponse.data.success) {
      console.log('❌ Failed to create exam:', createExamResponse.data);
      return;
    }

    const exam = createExamResponse.data.data.exam;
    console.log('✅ Exam created successfully!');
    console.log(`📊 Exam ID: ${exam.id}\n`);

    // Add question to exam
    console.log('🔗 Adding question to exam...');
    const addQuestionResponse = await axios.post(
      `${BASE_URL}/admin/exams/${exam.id}/questions`,
      {
        questionId: question.id
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!addQuestionResponse.data.success) {
      console.log('❌ Failed to add question to exam:', addQuestionResponse.data);
      return;
    }

    console.log('✅ Question added to exam successfully!\n');

    // Get student token
    console.log('👤 Getting student token...');
    const studentToken = await getStudentToken();
    console.log('✅ Student authentication successful\n');

    // Book exam
    console.log('📅 Booking exam...');
    const bookingData = {
      examId: exam.id,
      scheduledAt: new Date().toISOString()
    };

    const bookingResponse = await axios.post(
      `${BASE_URL}/bookings`,
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!bookingResponse.data.success) {
      console.log('❌ Failed to book exam:', bookingResponse.data);
      return;
    }

    const booking = bookingResponse.data.data.booking;
    console.log('✅ Exam booked successfully!');
    console.log(`📊 Booking ID: ${booking.id}\n`);

    // Confirm booking (admin)
    console.log('✅ Confirming booking...');
    const confirmBookingResponse = await axios.patch(
      `${BASE_URL}/admin/bookings/${booking.id}/status`,
      {
        status: 'CONFIRMED'
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!confirmBookingResponse.data.success) {
      console.log('❌ Failed to confirm booking:', confirmBookingResponse.data);
      return;
    }

    console.log('✅ Booking confirmed!\n');

    // Start exam
    console.log('🚀 Starting exam...');
    const startExamResponse = await axios.post(
      `${BASE_URL}/exams/${exam.id}/start`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!startExamResponse.data.success) {
      console.log('❌ Failed to start exam:', startExamResponse.data);
      return;
    }

    const attempt = startExamResponse.data.data.attempt;
    const questions = startExamResponse.data.data.questions;
    console.log('✅ Exam started successfully!');
    console.log(`📊 Attempt ID: ${attempt.id}`);
    console.log(`📝 Questions Count: ${questions.length}\n`);

    // Submit essay answer (correct answer)
    console.log('📝 Submitting correct essay answer...');
    const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.";

    const responses = [
      {
        questionId: questions[0].id,
        essayAnswer: correctAnswer,
        timeSpent: 30
      }
    ];

    const completeExamResponse = await axios.post(
      `${BASE_URL}/exams/attempts/${attempt.id}/complete`,
      {
        responses: responses
      },
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!completeExamResponse.data.success) {
      console.log('❌ Failed to complete exam:', completeExamResponse.data);
      return;
    }

    const results = completeExamResponse.data.data.results;
    console.log('✅ Exam completed successfully!');
    console.log(`📊 Score: ${results.score}/${results.totalMarks} (${results.percentage}%)`);
    console.log(`📈 Grade: ${results.grade}`);
    console.log(`🎯 Assessment: ${results.assessment}`);
    console.log(`✅ Correct Answers: ${results.correctAnswers}/${results.totalQuestions}`);
    console.log(`📝 Attempts Used: ${results.attemptsUsed}`);

    // Check if score was saved
    console.log('\n🔍 Verifying score was saved...');
    const attemptDetailsResponse = await axios.get(
      `${BASE_URL}/exams/attempts/${attempt.id}`,
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (attemptDetailsResponse.data.success) {
      const attemptDetails = attemptDetailsResponse.data.data;
      console.log('✅ Attempt details retrieved successfully!');
      console.log(`📊 Attempt Status: ${attemptDetails.status}`);
      console.log(`📈 Exam Score: ${attemptDetails.examScore?.score || 'Not found'}`);
      console.log(`📝 Attempts Used: ${attemptDetails.booking?.attemptsUsed || 'Not found'}`);
    } else {
      console.log('❌ Failed to get attempt details:', attemptDetailsResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendEssayExam(); 