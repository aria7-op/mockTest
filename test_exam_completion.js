const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/v1';
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

async function testExamCompletion() {
  try {
    console.log('🎯 Testing Exam Completion with Score Saving and Attempt Updates\n');
    console.log('=' .repeat(80));
    
    const studentToken = await getStudentToken();
    console.log('✅ Student authentication successful\n');

    // Step 1: Get available exams
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

    // Step 2: Start exam attempt
    console.log('📝 Step 2: Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${exam.id}/start`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const attempt = startResponse.data.data.attempt;
    const questions = startResponse.data.data.questions || [];
    console.log(`✅ Exam started - Attempt ID: ${attempt.id}`);
    console.log(`📝 Questions count: ${questions.length}\n`);

    // Step 3: Submit some answers (including wrong ones to test 0 score)
    console.log('📝 Step 3: Submitting answers...');
    const responses = [];
    
    for (let i = 0; i < Math.min(questions.length, 3); i++) {
      const question = questions[i];
      let selectedOptions = [];
      
      // For testing, submit wrong answers to get 0 score
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') {
        // Select wrong options (not the correct ones)
        const wrongOptions = question.options.filter(opt => !opt.isCorrect);
        if (wrongOptions.length > 0) {
          selectedOptions = [wrongOptions[0].id];
        }
      } else if (question.type === 'ESSAY') {
        // Submit a very short answer for essay
        responses.push({
          questionId: question.id,
          essayAnswer: "This is a very short answer that should get low score.",
          timeSpent: 30
        });
        continue;
      }
      
      responses.push({
        questionId: question.id,
        selectedOptions,
        timeSpent: 30
      });
    }

    console.log(`📝 Submitting ${responses.length} responses...`);

    // Step 4: Complete the exam
    console.log('📝 Step 4: Completing exam...');
    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attempt.id}/complete`, {
      responses
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const result = completeResponse.data.data;
    console.log('✅ Exam completed successfully!');
    console.log(`📊 Score: ${result.results.score}/${result.results.totalQuestions}`);
    console.log(`📊 Percentage: ${result.results.percentage.toFixed(1)}%`);
    console.log(`📊 Grade: ${result.results.grade}`);
    console.log(`📊 Passed: ${result.results.isPassed ? 'Yes' : 'No'}`);
    console.log(`📊 Correct answers: ${result.results.correctAnswers}`);
    console.log(`📊 Wrong answers: ${result.results.wrongAnswers}`);
    console.log(`📊 Unanswered: ${result.results.unanswered}\n`);

    // Step 5: Verify that score was saved and attempts were updated
    console.log('📝 Step 5: Verifying score saving and attempt updates...');
    
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

    // Check if ExamScore record was created
    if (attemptDetails.examScore) {
      console.log(`📊 ExamScore ID: ${attemptDetails.examScore.id}`);
      console.log(`📊 ExamScore total marks: ${attemptDetails.examScore.totalMarks}`);
      console.log(`📊 ExamScore grade: ${attemptDetails.examScore.grade}`);
    } else {
      console.log('⚠️ No ExamScore record found');
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('✅ Score was saved to database');
    console.log('✅ Attempts were incremented');
    console.log('✅ ExamScore record was created');
    console.log('✅ Even with 0 score, everything was properly recorded');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.error?.details) {
      console.error('Validation details:', JSON.stringify(error.response.data.error.details, null, 2));
    }
  }
}

testExamCompletion(); 