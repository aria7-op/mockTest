#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const CATEGORY_ID = 'cmdyb4pji0000i2ovlel4fmju';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}${colors.blue}STEP ${step}:${colors.reset} ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function executeCurl(command) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function parseJsonResponse(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    return null;
  }
}

// Test data
const testData = {
  adminUser: {
    email: 'admin@test.com',
    password: 'admin123'
  },
  studentUser: {
    email: 'student@test.com',
    password: 'student123'
  },
  questions: [
    {
      text: "Explain the concept of Object-Oriented Programming and its four main principles. Provide examples for each principle.",
      type: "ESSAY",
      difficulty: "MEDIUM",
      marks: 10,
      timeLimit: 300,
      correctAnswer: "Object-Oriented Programming (OOP) is a programming paradigm that organizes code into objects that contain both data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit (class). Example: A BankAccount class with private balance and public deposit/withdraw methods. 2) Inheritance - creating new classes that are built upon existing classes. Example: Animal class with Dog and Cat subclasses inheriting common properties. 3) Polymorphism - the ability to present the same interface for different underlying forms. Example: A Shape interface with Circle and Rectangle classes implementing different area calculations. 4) Abstraction - hiding complex implementation details and showing only necessary features. Example: A Car class that hides engine complexity but provides simple start() and stop() methods.",
      explanation: "This question tests understanding of OOP fundamentals and ability to explain complex concepts with examples."
    },
    {
      text: "Describe the differences between synchronous and asynchronous programming. When would you use each approach?",
      type: "ESSAY", 
      difficulty: "MEDIUM",
      marks: 8,
      timeLimit: 240,
      correctAnswer: "Synchronous programming executes code sequentially, where each operation must complete before the next begins. Asynchronous programming allows operations to run concurrently without blocking the main execution thread. Synchronous is used for simple, linear operations like mathematical calculations or when operations depend on each other. Asynchronous is used for I/O operations (file reading, network requests), user interface responsiveness, and when operations can run independently. Examples: Synchronous - calculating a sum of numbers. Asynchronous - fetching data from an API while keeping the UI responsive.",
      explanation: "This question evaluates understanding of programming execution models and practical application scenarios."
    },
    {
      text: "What is the capital of France?",
      type: "MULTIPLE_CHOICE",
      difficulty: "EASY", 
      marks: 2,
      timeLimit: 30,
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      explanation: "Paris is the capital and largest city of France."
    }
  ]
};

let tokens = {
  admin: null,
  student: null
};

let createdIds = {
  questions: [],
  exam: null,
  booking: null,
  attempt: null
};

async function runTest() {
  log(`${colors.bright}${colors.magenta}🧪 COMPREHENSIVE ESSAY SCORING TEST${colors.reset}`, 'magenta');
  log(`${colors.bright}Testing advanced essay scoring with multiple layers of analysis${colors.reset}`, 'magenta');
  
  // Step 1: Login as Admin
  logStep(1, 'Logging in as Admin');
  const adminLoginCmd = `curl -s -X POST ${BASE_URL}/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email": "${testData.adminUser.email}", "password": "${testData.adminUser.password}"}'`;
  
  const adminLoginResult = executeCurl(adminLoginCmd);
  if (!adminLoginResult.success) {
    logError('Failed to login as admin');
    logError(adminLoginResult.error);
    return;
  }
  
  const adminLoginData = parseJsonResponse(adminLoginResult.data);
  if (!adminLoginData || !adminLoginData.token) {
    logError('Invalid admin login response');
    logError(adminLoginResult.data);
    return;
  }
  
  tokens.admin = adminLoginData.token;
  logSuccess('Admin login successful');
  
  // Step 2: Login as Student
  logStep(2, 'Logging in as Student');
  const studentLoginCmd = `curl -s -X POST ${BASE_URL}/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email": "${testData.studentUser.email}", "password": "${testData.studentUser.password}"}'`;
  
  const studentLoginResult = executeCurl(studentLoginCmd);
  if (!studentLoginResult.success) {
    logError('Failed to login as student');
    logError(studentLoginResult.error);
    return;
  }
  
  const studentLoginData = parseJsonResponse(studentLoginResult.data);
  if (!studentLoginData || !studentLoginData.token) {
    logError('Invalid student login response');
    logError(studentLoginResult.data);
    return;
  }
  
  tokens.student = studentLoginData.token;
  logSuccess('Student login successful');
  
  // Step 3: Create Questions
  logStep(3, 'Creating test questions');
  
  for (let i = 0; i < testData.questions.length; i++) {
    const question = testData.questions[i];
    logInfo(`Creating question ${i + 1}: ${question.text.substring(0, 50)}...`);
    
    let questionData;
    if (question.type === 'MULTIPLE_CHOICE') {
      questionData = {
        text: question.text,
        examCategoryId: CATEGORY_ID,
        difficulty: question.difficulty,
        type: question.type,
        marks: question.marks,
        timeLimit: question.timeLimit,
        options: question.options.map((option, index) => ({
          text: option,
          isCorrect: option === question.correctAnswer
        })),
        explanation: question.explanation
      };
    } else {
      questionData = {
        text: question.text,
        examCategoryId: CATEGORY_ID,
        difficulty: question.difficulty,
        type: question.type,
        marks: question.marks,
        timeLimit: question.timeLimit,
        explanation: question.explanation
      };
    }
    
    const createQuestionCmd = `curl -s -X POST ${BASE_URL}/admin/questions \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer ${tokens.admin}" \\
      -d '${JSON.stringify(questionData)}'`;
    
    const createQuestionResult = executeCurl(createQuestionCmd);
    if (!createQuestionResult.success) {
      logError(`Failed to create question ${i + 1}`);
      logError(createQuestionResult.error);
      continue;
    }
    
    const questionData = parseJsonResponse(createQuestionResult.data);
    if (!questionData || !questionData.id) {
      logError(`Invalid response for question ${i + 1}`);
      logError(createQuestionResult.data);
      continue;
    }
    
    createdIds.questions.push(questionData.id);
    logSuccess(`Question ${i + 1} created with ID: ${questionData.id}`);
  }
  
  if (createdIds.questions.length === 0) {
    logError('No questions were created successfully');
    return;
  }
  
  // Step 4: Create Exam
  logStep(4, 'Creating test exam');
  const examData = {
    title: "Advanced Programming Concepts Test",
    description: "A comprehensive test covering OOP, async programming, and basic knowledge",
    examCategoryId: CATEGORY_ID,
    duration: 1800, // 30 minutes
    totalMarks: 20,
    passingMarks: 12,
    price: 0,
    totalQuestions: createdIds.questions.length,
    randomizeQuestions: false,
    randomizeOptions: false
  };
  
  const createExamCmd = `curl -s -X POST ${BASE_URL}/admin/exams \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${tokens.admin}" \\
    -d '${JSON.stringify(examData)}'`;
  
  const createExamResult = executeCurl(createExamCmd);
  if (!createExamResult.success) {
    logError('Failed to create exam');
    logError(createExamResult.error);
    return;
  }
  
  const examData = parseJsonResponse(createExamResult.data);
  if (!examData || !examData.id) {
    logError('Invalid exam creation response');
    logError(createExamResult.data);
    return;
  }
  
  createdIds.exam = examData.id;
  logSuccess(`Exam created with ID: ${createdIds.exam}`);
  
  // Step 5: Add questions to exam
  logStep(5, 'Adding questions to exam');
  for (let i = 0; i < createdIds.questions.length; i++) {
    const questionId = createdIds.questions[i];
    const question = testData.questions[i];
    
    const addQuestionCmd = `curl -s -X POST ${BASE_URL}/admin/exams/${createdIds.exam}/questions \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer ${tokens.admin}" \\
      -d '{"questionId": "${questionId}", "order": ${i + 1}, "marks": ${question.marks}}'`;
    
    const addQuestionResult = executeCurl(addQuestionCmd);
    if (!addQuestionResult.success) {
      logWarning(`Failed to add question ${i + 1} to exam`);
      logWarning(addQuestionResult.error);
    } else {
      logSuccess(`Question ${i + 1} added to exam`);
    }
  }
  
  // Step 6: Book exam as student
  logStep(6, 'Booking exam as student');
  const bookingData = {
    examId: createdIds.exam,
    scheduledAt: new Date(Date.now() + 60000).toISOString() // 1 minute from now
  };
  
  const bookExamCmd = `curl -s -X POST ${BASE_URL}/bookings \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${tokens.student}" \\
    -d '${JSON.stringify(bookingData)}'`;
  
  const bookExamResult = executeCurl(bookExamCmd);
  if (!bookExamResult.success) {
    logError('Failed to book exam');
    logError(bookExamResult.error);
    return;
  }
  
  const bookingData = parseJsonResponse(bookExamResult.data);
  if (!bookingData || !bookingData.id) {
    logError('Invalid booking response');
    logError(bookExamResult.data);
    return;
  }
  
  createdIds.booking = bookingData.id;
  logSuccess(`Exam booked with ID: ${createdIds.booking}`);
  
  // Step 7: Start exam attempt
  logStep(7, 'Starting exam attempt');
  const startAttemptCmd = `curl -s -X POST ${BASE_URL}/attempts \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${tokens.student}" \\
    -d '{"examId": "${createdIds.exam}", "bookingId": "${createdIds.booking}"}'`;
  
  const startAttemptResult = executeCurl(startAttemptCmd);
  if (!startAttemptResult.success) {
    logError('Failed to start exam attempt');
    logError(startAttemptResult.error);
    return;
  }
  
  const attemptData = parseJsonResponse(startAttemptResult.data);
  if (!attemptData || !attemptData.id) {
    logError('Invalid attempt start response');
    logError(startAttemptResult.data);
    return;
  }
  
  createdIds.attempt = attemptData.id;
  logSuccess(`Exam attempt started with ID: ${createdIds.attempt}`);
  
  // Step 8: Submit answers
  logStep(8, 'Submitting test answers');
  
  // Excellent essay answer for question 1
  const excellentEssayAnswer = `Object-Oriented Programming (OOP) is a fundamental programming paradigm that organizes software design around data, or objects, rather than functions and logic. This approach provides a clear structure for programs and enables code reusability, making it easier to maintain and modify applications.

The four main principles of OOP are:

1. **Encapsulation**: This principle bundles data and the methods that operate on that data within a single unit or object, hiding the internal state and requiring all interaction to be performed through an object's methods. For example, a BankAccount class encapsulates the account balance as a private field and provides public methods like deposit() and withdraw() to interact with it. This prevents direct access to the balance and ensures all transactions go through proper validation.

2. **Inheritance**: This allows a class to inherit properties and methods from another class, promoting code reuse and establishing a relationship between parent and child classes. For instance, an Animal class might have basic properties like name and age, and methods like eat() and sleep(). Then, Dog and Cat classes can inherit from Animal and add their specific behaviors like bark() or meow().

3. **Polymorphism**: This enables objects to be treated as instances of their parent class while maintaining their own unique implementations. It allows the same interface to be used for different underlying forms. For example, a Shape interface might define an area() method, and different classes like Circle and Rectangle can implement this method differently while being used interchangeably in code that expects a Shape.

4. **Abstraction**: This principle hides complex implementation details and shows only the necessary features of an object. It reduces complexity and increases efficiency. For instance, a Car class might provide simple methods like start() and stop(), but hide the complex internal workings of the engine, transmission, and other mechanical systems. Users of the Car class don't need to understand how the engine works to drive the car.`;
  
  // Poor essay answer for question 2
  const poorEssayAnswer = `Programming can be done in different ways. Sometimes you write code that runs one after another. Other times you write code that can run at the same time. The first way is called synchronous and the second is called asynchronous.

Synchronous programming means the code runs in order. Each line must finish before the next one starts. This is like waiting in line at a store. You have to wait for the person in front of you to finish before you can go.

Asynchronous programming means code can run at the same time. This is like having multiple people working on different tasks at the same time. You don't have to wait for one thing to finish before starting another.

You use synchronous when you want things to happen in order. You use asynchronous when you want things to happen at the same time. For example, you might use synchronous for simple math problems. You might use asynchronous for things like loading pictures from the internet.`;
  
  // Submit answers for each question
  const answers = [
    { questionId: createdIds.questions[0], essayAnswer: excellentEssayAnswer },
    { questionId: createdIds.questions[1], essayAnswer: poorEssayAnswer },
    { questionId: createdIds.questions[2], selectedOptions: [2] } // Paris (index 2)
  ];
  
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    logInfo(`Submitting answer for question ${i + 1}...`);
    
    let submitData;
    if (answer.essayAnswer) {
      submitData = {
        questionId: answer.questionId,
        essayAnswer: answer.essayAnswer
      };
    } else {
      submitData = {
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions
      };
    }
    
    const submitAnswerCmd = `curl -s -X POST ${BASE_URL}/attempts/${createdIds.attempt}/responses \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer ${tokens.student}" \\
      -d '${JSON.stringify(submitData)}'`;
    
    const submitAnswerResult = executeCurl(submitAnswerCmd);
    if (!submitAnswerResult.success) {
      logError(`Failed to submit answer for question ${i + 1}`);
      logError(submitAnswerResult.error);
      continue;
    }
    
    const responseData = parseJsonResponse(submitAnswerResult.data);
    if (!responseData) {
      logError(`Invalid response for question ${i + 1}`);
      logError(submitAnswerResult.data);
      continue;
    }
    
    logSuccess(`Answer submitted for question ${i + 1}`);
    
    // Display scoring results for essay questions
    if (answer.essayAnswer) {
      logInfo(`Question ${i + 1} Scoring Results:`);
      logInfo(`  Score: ${responseData.score || 'N/A'}`);
      logInfo(`  Percentage: ${responseData.percentage || 'N/A'}%`);
      logInfo(`  Is Correct: ${responseData.isCorrect || 'N/A'}`);
      if (responseData.feedback) {
        logInfo(`  Feedback: ${responseData.feedback.substring(0, 100)}...`);
      }
      if (responseData.detailedAnalysis) {
        logInfo(`  Detailed Analysis: Available`);
      }
    }
  }
  
  // Step 9: Complete exam attempt
  logStep(9, 'Completing exam attempt');
  const completeAttemptCmd = `curl -s -X PUT ${BASE_URL}/attempts/${createdIds.attempt}/complete \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${tokens.student}"`;
  
  const completeAttemptResult = executeCurl(completeAttemptCmd);
  if (!completeAttemptResult.success) {
    logError('Failed to complete exam attempt');
    logError(completeAttemptResult.error);
  } else {
    logSuccess('Exam attempt completed successfully');
  }
  
  // Step 10: Get final results
  logStep(10, 'Retrieving final exam results');
  const getResultsCmd = `curl -s -X GET ${BASE_URL}/attempts/${createdIds.attempt} \\
    -H "Authorization: Bearer ${tokens.student}"`;
  
  const getResultsResult = executeCurl(getResultsCmd);
  if (!getResultsResult.success) {
    logError('Failed to get exam results');
    logError(getResultsResult.error);
  } else {
    const resultsData = parseJsonResponse(getResultsResult.data);
    if (resultsData) {
      logSuccess('Final Exam Results:');
      logInfo(`  Total Marks: ${resultsData.totalMarks || 'N/A'}`);
      logInfo(`  Obtained Marks: ${resultsData.obtainedMarks || 'N/A'}`);
      logInfo(`  Percentage: ${resultsData.percentage || 'N/A'}%`);
      logInfo(`  Status: ${resultsData.status || 'N/A'}`);
      logInfo(`  Is Passed: ${resultsData.isPassed || 'N/A'}`);
    }
  }
  
  // Step 11: Get detailed question responses
  logStep(11, 'Retrieving detailed question responses');
  const getResponsesCmd = `curl -s -X GET ${BASE_URL}/attempts/${createdIds.attempt}/responses \\
    -H "Authorization: Bearer ${tokens.student}"`;
  
  const getResponsesResult = executeCurl(getResponsesCmd);
  if (!getResponsesResult.success) {
    logError('Failed to get question responses');
    logError(getResponsesResult.error);
  } else {
    const responsesData = parseJsonResponse(getResponsesResult.data);
    if (responsesData && responsesData.length > 0) {
      logSuccess('Detailed Question Responses:');
      responsesData.forEach((response, index) => {
        logInfo(`Question ${index + 1}:`);
        logInfo(`  Score: ${response.score || 'N/A'}`);
        logInfo(`  Percentage: ${response.percentage || 'N/A'}%`);
        logInfo(`  Is Correct: ${response.isCorrect || 'N/A'}`);
        if (response.feedback) {
          logInfo(`  Feedback: ${response.feedback.substring(0, 150)}...`);
        }
      });
    }
  }
  
  log(`${colors.bright}${colors.green}🎉 TEST COMPLETED SUCCESSFULLY!${colors.reset}`, 'green');
  log(`${colors.bright}Created IDs for reference:${colors.reset}`, 'cyan');
  log(`  Questions: ${createdIds.questions.join(', ')}`, 'cyan');
  log(`  Exam: ${createdIds.exam}`, 'cyan');
  log(`  Booking: ${createdIds.booking}`, 'cyan');
  log(`  Attempt: ${createdIds.attempt}`, 'cyan');
}

// Run the test
runTest().catch(error => {
  logError('Test failed with error:');
  logError(error.message);
  process.exit(1);
}); 