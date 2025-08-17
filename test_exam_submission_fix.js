const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function testExamSubmissionFix() {
  try {
    console.log('🧪 Testing Exam Submission Fix...');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }

    const token = loginResponse.data.data.accessToken;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Get available exams
    const examsResponse = await axios.get(`${BASE_URL}/exams/available`, { headers });
    const exams = examsResponse.data.data.exams || [];

    if (exams.length === 0) {
      console.log('⚠️ No available exams found');
      return;
    }

    const exam = exams[0];
    console.log(`📝 Using exam: ${exam.title} (${exam.id})`);

    // Start exam attempt
    const startResponse = await axios.post(`${BASE_URL}/exams/${exam.id}/start`, {}, { headers });
    
    if (!startResponse.data.success) {
      throw new Error(`Failed to start exam: ${startResponse.data.message}`);
    }

    const attemptId = startResponse.data.data.attempt.id;
    const questions = startResponse.data.data.questions;
    
    console.log(`✅ Exam started. Attempt ID: ${attemptId}`);
    console.log(`📝 Questions received: ${questions.length}`);

    // Create test responses with proper string format
    const responses = questions.map((question, index) => {
      if (question.type === 'ESSAY' || question.type === 'SHORT_ANSWER') {
        return {
          questionId: question.id,
          selectedOptions: [],
          essayAnswer: `Test answer for question ${index + 1}`,
          timeSpent: 60
        };
      } else if (question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') {
        // Select the first option (index 0) and convert to string
        return {
          questionId: question.id,
          selectedOptions: ['0'], // String format
          timeSpent: 30
        };
      } else {
        return {
          questionId: question.id,
          selectedOptions: ['0'], // String format
          timeSpent: 20
        };
      }
    });

    console.log('📊 Test responses created:');
    responses.forEach((response, index) => {
      console.log(`   Question ${index + 1}: selectedOptions = [${response.selectedOptions.join(', ')}] (type: ${typeof response.selectedOptions[0]})`);
    });

    // Submit the exam
    console.log('\n📤 Submitting exam...');
    const submitResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: responses
    }, { headers });

    if (submitResponse.data.success) {
      console.log('✅ Exam submitted successfully!');
      console.log('📊 Results:');
      console.log(`   Total Marks: ${submitResponse.data.data.attempt.totalMarks}`);
      console.log(`   Obtained Marks: ${submitResponse.data.data.attempt.obtainedMarks}`);
      console.log(`   Percentage: ${submitResponse.data.data.attempt.percentage}%`);
      console.log(`   Passed: ${submitResponse.data.data.attempt.isPassed}`);
      
      console.log('\n🎉 Exam submission fix is working correctly!');
      console.log('✅ String conversion for selectedOptions is working');
      console.log('✅ Backend validation accepts the data');
      console.log('✅ Exam completion process works');
    } else {
      console.log('❌ Exam submission failed:', submitResponse.data.message);
      if (submitResponse.data.error && submitResponse.data.error.details) {
        console.log('📋 Validation errors:');
        submitResponse.data.error.details.forEach(detail => {
          console.log(`   - ${detail.path.join('.')}: ${detail.message}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testExamSubmissionFix(); 