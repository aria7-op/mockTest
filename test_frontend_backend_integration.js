const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testFrontendBackendIntegration() {
  try {
    console.log('🔍 Testing Frontend-Backend Integration\n');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@mocktest.com',
      password: 'Student@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');

    // Get available tests
    const testsResponse = await axios.get(`${BASE_URL}/student/tests`, { headers });
    console.log('📚 Available tests:', testsResponse.data.data.tests.length);

    // Find the specific exam (Fa1)
    const exam = testsResponse.data.data.tests.find(t => t.title === 'Fa1');
    if (!exam) {
      console.log('❌ Exam "Fa1" not found');
      return;
    }

    console.log('🎯 Found exam:', {
      id: exam.id,
      title: exam.title,
      totalQuestions: exam.totalQuestions,
      multipleChoiceQuestionsCount: exam.multipleChoiceQuestionsCount,
      fillInTheBlankQuestionsCount: exam.fillInTheBlankQuestionsCount
    });

    // Start exam attempt
    console.log('\n🚀 Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/student/tests/${exam.id}/start`, {}, { headers });
    
    if (!startResponse.data.success) {
      console.log('❌ Failed to start exam:', startResponse.data.message);
      return;
    }

    const attemptId = startResponse.data.data.attempt.id;
    const questions = startResponse.data.data.questions || [];

    console.log('✅ Exam started successfully!');
    console.log('📝 Attempt ID:', attemptId);
    console.log('❓ Questions loaded:', questions.length);

    // Analyze question types
    const questionTypes = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Question Types Distribution:');
    Object.entries(questionTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n🔍 Expected vs Actual:');
    console.log('   Expected Total:', exam.totalQuestions);
    console.log('   Actual Total:', questions.length);
    console.log('   Expected Multiple Choice:', exam.multipleChoiceQuestionsCount);
    console.log('   Actual Multiple Choice:', questionTypes['MULTIPLE_CHOICE'] || 0);
    console.log('   Expected Fill in the Blank:', exam.fillInTheBlankQuestionsCount);
    console.log('   Actual Fill in the Blank:', questionTypes['FILL_IN_THE_BLANK'] || 0);

    if (questions.length !== exam.totalQuestions) {
      console.log('\n⚠️ WARNING: Question count mismatch!');
      console.log('   This indicates the backend question randomization service is not working properly');
    }

    // Test submitting answers
    console.log('\n📝 Testing answer submission...');
    
    const responses = questions.map((question, index) => {
      if (question.type === 'FILL_IN_THE_BLANK') {
        // For fill-in-the-blank, send sample text answers
        const sampleAnswers = question.options.map((opt, i) => `Sample Answer ${i + 1}`);
        return {
          questionId: question.id,
          selectedOptions: [],
          essayAnswer: sampleAnswers.join(' | '),
          timeSpent: 30
        };
      } else {
        // For multiple choice, send the first option
        return {
          questionId: question.id,
          selectedOptions: [question.options[0]?.id || ''],
          timeSpent: 30
        };
      }
    });

    console.log('📤 Submitting responses...');
    const submitResponse = await axios.post(
      `${BASE_URL}/exams/attempts/${attemptId}/complete`,
      { responses },
      { headers }
    );

    if (submitResponse.data.success) {
      console.log('✅ Exam submitted successfully!');
      console.log('📊 Results:', {
        totalQuestions: submitResponse.data.data.results.totalQuestions,
        correctAnswers: submitResponse.data.data.results.correctAnswers,
        score: submitResponse.data.data.results.score,
        percentage: submitResponse.data.data.results.percentage
      });
    } else {
      console.log('❌ Failed to submit exam:', submitResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendBackendIntegration(); 