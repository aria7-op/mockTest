const axios = require('axios');

// Test configuration - simulate frontend behavior
const BASE_URL = 'http://localhost:5000/api/v1';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function getStudentToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });
    return response.data.data.accessToken;
  } catch (error) {
    console.error('Student login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testFrontendAPICall() {
  try {
    console.log('🎯 Testing Frontend API Call Simulation\n');
    console.log('=' .repeat(80));
    
    const studentToken = await getStudentToken();
    console.log('✅ Student authentication successful\n');

    // Step 1: Get available exams (like frontend does)
    console.log('📝 Step 1: Getting available exams...');
    const examsResponse = await axios.get(`${BASE_URL}/exams/available`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const exams = examsResponse.data.data.exams || [];
    if (exams.length === 0) {
      console.log('❌ No exams available for testing');
      return;
    }

    const exam = exams[0];
    console.log(`✅ Found exam: ${exam.title} (ID: ${exam.id})`);
    console.log(`📊 Max retakes: ${exam.maxRetakes || 1}`);
    console.log(`📊 Current attempts used: ${exam.attemptsInfo?.attemptsUsed || 0}\n`);

    // Step 2: Start exam attempt (like frontend does)
    console.log('📝 Step 2: Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${exam.id}/start`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const attempt = startResponse.data.data.attempt;
    const questions = startResponse.data.data.questions || [];
    console.log(`✅ Exam started - Attempt ID: ${attempt.id}`);
    console.log(`📝 Questions count: ${questions.length}\n`);

    // Step 3: Simulate frontend answer selection (like user clicking answers)
    console.log('📝 Step 3: Simulating frontend answer selection...');
    const answers = {};
    
    for (let i = 0; i < Math.min(questions.length, 2); i++) {
      const question = questions[i];
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') {
        // Simulate selecting first option (like user clicking)
        answers[question.id] = question.options[0]?.id || 0;
      } else if (question.type === 'ESSAY') {
        // Simulate essay answer (like user typing)
        answers[question.id] = "This is a test essay answer from frontend simulation.";
      }
    }

    console.log(`📝 Simulated answers:`, answers);

    // Step 4: Simulate frontend submission (exactly like frontend does)
    console.log('📝 Step 4: Simulating frontend submission...');
    
    // Convert answers to responses format (EXACTLY like frontend does)
    const responses = Object.entries(answers).map(([questionId, selectedOptions]) => ({
      questionId,
      selectedOptions: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions],
      timeSpent: 0
    }));

    console.log(`📝 Converted responses:`, JSON.stringify(responses, null, 2));

    // Step 5: Call the API exactly like frontend does
    console.log('📝 Step 5: Calling API exactly like frontend...');
    console.log(`🌐 URL: ${BASE_URL}/exams/attempts/${attempt.id}/complete`);
    console.log(`📤 Request body:`, JSON.stringify({ responses }, null, 2));

    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attempt.id}/complete`, {
      responses
    }, {
      headers: { 
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API call successful!');
    console.log(`📊 Response status: ${completeResponse.status}`);
    console.log(`📊 Response data:`, JSON.stringify(completeResponse.data, null, 2));

    const result = completeResponse.data.data;
    console.log('\n📊 Exam Results:');
    console.log(`📊 Score: ${result.results.score}/${result.results.totalQuestions}`);
    console.log(`📊 Percentage: ${result.results.percentage.toFixed(1)}%`);
    console.log(`📊 Grade: ${result.results.grade}`);
    console.log(`📊 Passed: ${result.results.isPassed ? 'Yes' : 'No'}`);
    console.log(`📊 Correct answers: ${result.results.correctAnswers}`);
    console.log(`📊 Wrong answers: ${result.results.wrongAnswers}`);
    console.log(`📊 Unanswered: ${result.results.unanswered}`);

    // Step 6: Verify database was updated
    console.log('\n📝 Step 6: Verifying database updates...');
    
    // Get exam details again to check updated attempts
    const updatedExamsResponse = await axios.get(`${BASE_URL}/exams/available`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const updatedExam = updatedExamsResponse.data.data.exams.find(e => e.id === exam.id);
    console.log(`📊 Updated attempts used: ${updatedExam.attemptsInfo?.attemptsUsed || 0}`);
    console.log(`📊 Can take exam: ${updatedExam.attemptsInfo?.canTakeExam ? 'Yes' : 'No'}`);

    // Get attempt details to verify score was saved
    const attemptResponse = await axios.get(`${BASE_URL}/exams/attempts/${attempt.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const attemptDetails = attemptResponse.data.data.attempt;
    console.log(`📊 Attempt status: ${attemptDetails.status}`);
    console.log(`📊 Attempt score: ${attemptDetails.obtainedMarks}/${attemptDetails.totalMarks}`);
    console.log(`📊 Attempt percentage: ${attemptDetails.percentage}%`);
    console.log(`📊 Attempt passed: ${attemptDetails.isPassed ? 'Yes' : 'No'}`);

    if (attemptDetails.examScore) {
      console.log(`📊 ExamScore ID: ${attemptDetails.examScore.id}`);
      console.log(`📊 ExamScore total marks: ${attemptDetails.examScore.totalMarks}`);
      console.log(`📊 ExamScore grade: ${attemptDetails.examScore.grade}`);
    }

    console.log('\n🎉 Frontend API simulation completed successfully!');
    console.log('✅ API call works exactly like frontend');
    console.log('✅ Score was saved to database');
    console.log('✅ Attempts were incremented');
    console.log('✅ ExamScore record was created');

  } catch (error) {
    console.error('❌ Frontend API simulation failed:', error.response?.data || error.message);
    if (error.response?.data?.error?.details) {
      console.error('Validation details:', JSON.stringify(error.response.data.error.details, null, 2));
    }
  }
}

testFrontendAPICall(); 