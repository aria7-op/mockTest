const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'admin1@mocktest.com',
  password: 'Admin@123'
};

const STUDENT_CREDENTIALS = {
  email: 'student1@example.com',
  password: 'Admin@123'
};

let adminToken = null;
let studentToken = null;

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(data && { data })
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${url} failed:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  
  const response = await makeRequest('POST', '/api/v1/auth/login', ADMIN_CREDENTIALS);
  
  if (response.success && response.data.accessToken) {
    adminToken = response.data.accessToken;
    console.log('✅ Admin login successful');
    console.log('👤 Admin user:', response.data.user.firstName, response.data.user.lastName);
    return true;
  } else {
    console.log('❌ Admin login failed');
    console.log('Response:', response);
    return false;
  }
};

const testStudentLogin = async () => {
  console.log('\n🔐 Testing Student Login...');
  
  const response = await makeRequest('POST', '/api/v1/auth/login', STUDENT_CREDENTIALS);
  
  if (response.success && response.data.accessToken) {
    studentToken = response.data.accessToken;
    console.log('✅ Student login successful');
    console.log('👤 Student user:', response.data.user.firstName, response.data.user.lastName);
    return true;
  } else {
    console.log('❌ Student login failed');
    console.log('Response:', response);
    return false;
  }
};

const testCreateExamWithDistribution = async () => {
  console.log('\n📝 Testing Exam Creation with Question Distribution...');
  
  if (!adminToken) {
    console.log('❌ Admin token not available');
    return null;
  }
  
  // Get exam categories first
  const categoriesResponse = await makeRequest('GET', '/api/v1/exam-categories', null, adminToken);
  
  if (!categoriesResponse.success || !categoriesResponse.data) {
    console.log('❌ Failed to get exam categories');
    console.log('Response:', categoriesResponse);
    return null;
  }
  
  // Find a category with enough questions for our distribution
  let selectedCategory = null;
  let bestCategory = null;
  let maxQuestions = 0;
  
  for (const category of categoriesResponse.data) {
    if (category._count && category._count.questions > maxQuestions) {
      maxQuestions = category._count.questions;
      bestCategory = category;
    }
  }
  
  // Use the category with the most questions
  selectedCategory = bestCategory;
  console.log('📚 Using exam category:', selectedCategory.name, `(${selectedCategory._count.questions} questions)`);
  
  // Get questions from this category to see the actual distribution
  const questionsResponse = await makeRequest('GET', `/api/v1/questions?examCategoryId=${selectedCategory.id}&limit=200`, null, adminToken);
  
  if (!questionsResponse.success) {
    console.log('❌ Failed to get questions for category');
    console.log('Questions response:', questionsResponse);
    return null;
  }
  
  console.log('🔍 Full questions response structure:', JSON.stringify(questionsResponse, null, 2));
  
  const questions = questionsResponse.data?.questions || questionsResponse.data || [];
  console.log('📊 Raw questions response:', {
    success: questionsResponse.success,
    dataLength: questionsResponse.data?.questions?.length || 0,
    directDataLength: questionsResponse.data?.length || 0,
    pagination: questionsResponse.data?.pagination,
    message: questionsResponse.data?.message,
    questionsType: typeof questions,
    questionsLength: questions.length
  });
  
  const questionsByType = {};
  questions.forEach(q => {
    questionsByType[q.type] = (questionsByType[q.type] || 0) + 1;
  });
  
  console.log('📊 Available questions by type:', questionsByType);
  
  // Create a realistic distribution based on available questions
  const availableMCQ = questionsByType['MULTIPLE_CHOICE'] || 0;
  const availableFillInBlank = questionsByType['FILL_IN_THE_BLANK'] || 0;
  const availableEssay = questionsByType['ESSAY'] || 0;
  const availableShortAnswer = questionsByType['SHORT_ANSWER'] || 0;
  
  // Calculate realistic distribution (use 80% of available questions to ensure randomization)
  const mcqCount = Math.min(40, Math.floor(availableMCQ * 0.8));
  const fillInBlankCount = Math.min(30, Math.floor(availableFillInBlank * 0.8));
  const essayCount = Math.min(10, Math.floor(availableEssay * 0.8));
  const shortAnswerCount = Math.min(20, Math.floor(availableShortAnswer * 0.8));
  
  const totalQuestions = mcqCount + fillInBlankCount + essayCount + shortAnswerCount;
  
  console.log('📊 Creating exam with realistic distribution:', {
    totalQuestions,
    multipleChoice: mcqCount,
    fillInTheBlank: fillInBlankCount,
    essay: essayCount,
    shortAnswer: shortAnswerCount
  });
  
  // Create exam with specific question distribution
  const examData = {
    title: 'Test Exam with Realistic Question Distribution',
    description: 'This exam tests the question distribution system with available questions',
    examCategoryId: selectedCategory.id,
    duration: 60, // 60 minutes
    totalMarks: totalQuestions * 2, // 2 marks per question
    totalQuestions: totalQuestions,
    passingMarks: Math.floor(totalQuestions * 1.2), // 60% passing
    price: 0,
    currency: 'USD',
    isPublic: true,
    isActive: true,
    allowRetakes: false,
    maxRetakes: 1,
    showResults: true,
    showAnswers: false,
    randomizeQuestions: true,
    randomizeOptions: true,
    questionOverlapPercentage: 10.0,
    instructions: 'Answer all questions carefully',
    rules: 'No cheating allowed',
    // Question type distribution based on available questions
    multipleChoiceQuestionsCount: mcqCount,
    fillInTheBlankQuestionsCount: fillInBlankCount,
    essayQuestionsCount: essayCount,
    shortAnswerQuestionsCount: shortAnswerCount,
    trueFalseQuestionsCount: 0,
    matchingQuestionsCount: 0,
    orderingQuestionsCount: 0
  };
  
  const examResponse = await makeRequest('POST', '/api/v1/admin/exams', examData, adminToken);
  
  if (examResponse.success) {
    console.log('✅ Exam created successfully');
    console.log('📋 Exam ID:', examResponse.data.exam.id);
    console.log('📊 Exam distribution:', {
      totalQuestions: examResponse.data.exam.totalQuestions,
      multipleChoice: examResponse.data.exam.multipleChoiceQuestionsCount,
      fillInTheBlank: examResponse.data.exam.fillInTheBlankQuestionsCount,
      essay: examResponse.data.exam.essayQuestionsCount,
      shortAnswer: examResponse.data.exam.shortAnswerQuestionsCount
    });
    return examResponse.data.exam;
  } else {
    console.log('❌ Exam creation failed');
    console.log('Response:', examResponse);
    return null;
  }
};

const testStartExamAttempt = async (examId) => {
  console.log('\n🎯 Testing Exam Attempt Start...');
  
  if (!studentToken) {
    console.log('❌ Student token not available');
    return null;
  }
  
  console.log('🚀 Starting exam attempt for exam:', examId);
  
  const attemptResponse = await makeRequest('POST', `/api/v1/exams/${examId}/start`, {}, studentToken);
  
  if (attemptResponse.success) {
    console.log('✅ Exam attempt started successfully');
    console.log('📝 Attempt ID:', attemptResponse.data.attempt.id);
    console.log('📊 Questions received:', attemptResponse.data.questions.length);
    
    // Analyze question distribution
    const questionTypes = {};
    attemptResponse.data.questions.forEach(q => {
      questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
    });
    
    console.log('📊 Question type distribution:', questionTypes);
    
    // Get the exam details to know the expected distribution
    const examDetails = attemptResponse.data.exam;
    const expectedTotal = examDetails.totalQuestions;
    const expectedMCQ = examDetails.multipleChoiceQuestionsCount || 0;
    const expectedFillInBlank = examDetails.fillInTheBlankQuestionsCount || 0;
    const expectedEssay = examDetails.essayQuestionsCount || 0;
    const expectedShortAnswer = examDetails.shortAnswerQuestionsCount || 0;
    
    const actualMCQ = questionTypes['MULTIPLE_CHOICE'] || 0;
    const actualFillInBlank = questionTypes['FILL_IN_THE_BLANK'] || 0;
    const actualEssay = questionTypes['ESSAY'] || 0;
    const actualShortAnswer = questionTypes['SHORT_ANSWER'] || 0;
    
    console.log('🔍 Distribution Verification:');
    console.log(`   MCQ: Expected ${expectedMCQ}, Got ${actualMCQ} - ${actualMCQ === expectedMCQ ? '✅' : '❌'}`);
    console.log(`   Fill in Blank: Expected ${expectedFillInBlank}, Got ${actualFillInBlank} - ${actualFillInBlank === expectedFillInBlank ? '✅' : '❌'}`);
    console.log(`   Essay: Expected ${expectedEssay}, Got ${actualEssay} - ${actualEssay === expectedEssay ? '✅' : '❌'}`);
    console.log(`   Short Answer: Expected ${expectedShortAnswer}, Got ${actualShortAnswer} - ${actualShortAnswer === expectedShortAnswer ? '✅' : '❌'}`);
    console.log(`   Total: Expected ${expectedTotal}, Got ${attemptResponse.data.questions.length} - ${attemptResponse.data.questions.length === expectedTotal ? '✅' : '❌'}`);
    
    // Calculate accuracy percentage
    const totalExpected = expectedMCQ + expectedFillInBlank + expectedEssay + expectedShortAnswer;
    const totalActual = actualMCQ + actualFillInBlank + actualEssay + actualShortAnswer;
    const accuracy = totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0;
    
    console.log(`📊 Overall Accuracy: ${accuracy.toFixed(1)}%`);
    
    if (accuracy >= 95) {
      console.log('🎉 Excellent! Question distribution is working perfectly!');
    } else if (accuracy >= 80) {
      console.log('✅ Good! Question distribution is working well.');
    } else {
      console.log('⚠️  Question distribution needs improvement.');
    }
    
    return attemptResponse.data;
  } else {
    console.log('❌ Exam attempt start failed');
    return null;
  }
};

const testQuestionDatabase = async () => {
  console.log('\n🗄️ Testing Question Database...');
  
  if (!adminToken) {
    console.log('❌ Admin token not available');
    return;
  }
  
  // Get questions from the first category
  const categoriesResponse = await makeRequest('GET', '/api/v1/exam-categories', null, adminToken);
  
  if (!categoriesResponse.success || !categoriesResponse.data) {
    console.log('❌ Failed to get exam categories');
    return;
  }
  
  const category = categoriesResponse.data[0];
  
  // Get questions by category
  const questionsResponse = await makeRequest('GET', `/api/v1/questions?examCategoryId=${category.id}&limit=100`, null, adminToken);
  
  if (questionsResponse.success) {
    const questions = questionsResponse.data.questions || [];
    console.log(`📚 Found ${questions.length} questions in category: ${category.name}`);
    
    // Group questions by type
    const questionsByType = {};
    questions.forEach(q => {
      questionsByType[q.type] = (questionsByType[q.type] || 0) + 1;
    });
    
    console.log('📊 Available questions by type:', questionsByType);
    
    // Check if we have enough questions for the distribution
    const mcqCount = questionsByType['MULTIPLE_CHOICE'] || 0;
    const fillInBlankCount = questionsByType['FILL_IN_THE_BLANK'] || 0;
    
    console.log('🔍 Question Availability Check:');
    console.log(`   MCQ: Need 40, Have ${mcqCount} - ${mcqCount >= 40 ? '✅' : '❌'}`);
    console.log(`   Fill in Blank: Need 60, Have ${fillInBlankCount} - ${fillInBlankCount >= 60 ? '✅' : '❌'}`);
    
    if (mcqCount < 40 || fillInBlankCount < 60) {
      console.log('⚠️  WARNING: Not enough questions available for the specified distribution!');
      console.log('   This will cause the system to return fewer questions than expected.');
    }
  } else {
    console.log('❌ Failed to get questions');
    console.log('Response:', questionsResponse);
  }
};

// Main test execution
const runTests = async () => {
  console.log('🧪 Starting Question Distribution System Tests...\n');
  
  try {
    // Test admin login
    const adminLoginSuccess = await testAdminLogin();
    if (!adminLoginSuccess) {
      console.log('❌ Cannot proceed without admin access');
      return;
    }
    
    // Test student login
    const studentLoginSuccess = await testStudentLogin();
    if (!studentLoginSuccess) {
      console.log('❌ Cannot proceed without student access');
      return;
    }
    
    // Test question database
    await testQuestionDatabase();
    
    // Test exam creation with distribution
    const exam = await testCreateExamWithDistribution();
    if (!exam) {
      console.log('❌ Cannot proceed without exam creation');
      return;
    }
    
    // Test starting exam attempt
    const attemptData = await testStartExamAttempt(exam.id);
    if (!attemptData) {
      console.log('❌ Cannot verify question distribution without exam attempt');
      return;
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Admin login: ✅');
    console.log('   - Student login: ✅');
    console.log('   - Exam creation: ✅');
    console.log('   - Question distribution: Check results above');
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
  }
};

// Run the tests
runTests(); 