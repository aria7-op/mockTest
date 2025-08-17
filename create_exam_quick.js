const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function createExam() {
  try {
    // Login as super admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mocktest.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    // Create exam with the specified category ID
    const examData = {
      title: 'Quick Test Exam',
      description: 'A test exam created quickly',
      examCategoryId: 'cmdyb4pji0000i2ovlel4fmju',
      duration: 30,
      totalQuestions: 5,
      totalMarks: 100,
      passingMarks: 50,
      price: 9.99,
      currency: 'USD',
      isPublic: true,
      isActive: true,
      // Question type distribution
      essayQuestionsCount: 2,
      multipleChoiceQuestionsCount: 2,
      shortAnswerQuestionsCount: 1,
      fillInTheBlankQuestionsCount: 0,
      trueFalseQuestionsCount: 0,
      matchingQuestionsCount: 0,
      orderingQuestionsCount: 0
    };

    const examResponse = await axios.post(`${BASE_URL}/admin/exams`, examData, { headers });
    
    if (examResponse.data.success) {
      console.log('✅ Exam created successfully!');
      console.log('Exam ID:', examResponse.data.data.id);
      console.log('Exam Title:', examResponse.data.data.title);
      console.log('Category ID:', examResponse.data.data.examCategoryId);
      console.log('Question Distribution:');
      console.log('- Essay:', examResponse.data.data.essayQuestionsCount);
      console.log('- Multiple Choice:', examResponse.data.data.multipleChoiceQuestionsCount);
      console.log('- Short Answer:', examResponse.data.data.shortAnswerQuestionsCount);
    } else {
      console.log('❌ Failed to create exam:', examResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createExam(); 