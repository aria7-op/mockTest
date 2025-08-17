const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api/v1';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@mocktest.com',
  password: 'Admin@123'
};

async function testExamCompletionWebSocket() {
  console.log('🎓 TESTING EXAM COMPLETION WEBSOCKET NOTIFICATIONS');
  console.log('=================================================');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('1. Make sure your FRONTEND is open at http://localhost:3000');
  console.log('2. Make sure you are LOGGED IN as admin@mocktest.com');
  console.log('3. Keep the notification dropdown CLOSED');
  console.log('4. Watch for exam completion and certificate notifications');
  console.log('5. This will simulate completing an exam and generating a certificate');
  console.log('');
  console.log('Press ENTER when ready to start the exam completion test...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  console.log('🚀 Starting Exam Completion Test');
  console.log('================================');
  console.log('');

  try {
    // 1. Login to get token
    console.log('🔐 Authenticating...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log(`✅ Logged in as: ${loginResponse.data.data.user.firstName} (${loginResponse.data.data.user.role})`);
    console.log('');

    // 2. Check for existing exams
    console.log('📚 Checking for available exams...');
    
    const examsResponse = await axios.get(`${API_BASE}/exams`, { headers });
    
    if (!examsResponse.data.success || examsResponse.data.data.length === 0) {
      console.log('❌ No exams found. Creating a test exam...');
      
      // Create a simple test exam
      const testExam = {
        title: 'WebSocket Test Exam',
        description: 'A test exam for WebSocket notification testing',
        duration: 30,
        totalQuestions: 5,
        passingScore: 60,
        isActive: true,
        examCategoryId: null, // We'll handle this if needed
        instructions: 'This is a test exam for WebSocket notifications',
        rules: 'Complete all questions to test notifications'
      };

      try {
        const createExamResponse = await axios.post(`${API_BASE}/admin/exams`, testExam, { headers });
        console.log('✅ Test exam created successfully!');
      } catch (createError) {
        console.log('❌ Failed to create test exam. Will try to find existing exams in database...');
        
        // Try to find any exam in the database directly
        const existingExams = await prisma.exam.findMany({
          where: { isActive: true },
          take: 1
        });
        
        if (existingExams.length === 0) {
          throw new Error('No exams available and cannot create one');
        }
      }
    }

    // 3. Get available exams again
    const availableExamsResponse = await axios.get(`${API_BASE}/exams`, { headers });
    const availableExams = availableExamsResponse.data.data || [];
    
    if (availableExams.length === 0) {
      throw new Error('No exams available for testing');
    }

    const testExam = availableExams[0];
    console.log(`📖 Using exam: "${testExam.title}"`);
    console.log('');

    // 4. Create a mock exam attempt completion
    console.log('✍️  Simulating exam completion...');
    console.log('This will directly trigger the exam completion notification system.');
    
    // Create a mock attempt in the database
    const mockAttempt = await prisma.examAttempt.create({
      data: {
        examId: testExam.id,
        userId: userId,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    console.log(`📝 Created mock exam attempt: ${mockAttempt.id}`);

    // Now simulate completing the attempt by calling the completion endpoint
    console.log('🏁 Completing the exam attempt...');
    
    // Create some mock responses
    const mockResponses = [
      {
        questionId: 'mock-question-1',
        selectedOptions: ['mock-option-1'],
        timeSpent: 30,
        isCorrect: true
      },
      {
        questionId: 'mock-question-2', 
        selectedOptions: ['mock-option-2'],
        timeSpent: 25,
        isCorrect: true
      },
      {
        questionId: 'mock-question-3',
        selectedOptions: ['mock-option-3'],
        timeSpent: 40,
        isCorrect: false
      }
    ];

    try {
      // This should trigger the exam completion notification
      const completionResponse = await axios.post(
        `${API_BASE}/attempts/${mockAttempt.id}/complete`,
        { responses: mockResponses },
        { headers }
      );

      if (completionResponse.data.success) {
        console.log('✅ Exam completed successfully!');
        console.log(`📊 Score: ${completionResponse.data.data.percentage}%`);
        console.log(`🎯 Passed: ${completionResponse.data.data.isPassed ? 'Yes' : 'No'}`);
        
        console.log('');
        console.log('📡 Expected WebSocket notifications:');
        console.log('   - Exam completion notification');
        if (completionResponse.data.data.certificate) {
          console.log('   - Certificate ready notification');
        }
        console.log('⏳ Waiting 5 seconds for notifications to process...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log('❌ Exam completion failed:', completionResponse.data.message);
      }
    } catch (completionError) {
      console.log('❌ Exam completion API failed:', completionError.response?.data?.message || completionError.message);
      
      // Try direct service call instead
      console.log('🔧 Attempting direct notification service call...');
      
      try {
        // Send notification directly via test endpoint
        await axios.post(
          `${API_BASE}/notifications/test`,
          {
            type: 'EXAM_COMPLETED',
            title: '🎓 Exam Completed!',
            message: `You have successfully completed the exam "${testExam.title}"`,
            priority: 'high',
            userId: userId
          },
          { headers }
        );

        console.log('✅ Direct exam completion notification sent!');

        // Also send certificate notification
        await axios.post(
          `${API_BASE}/notifications/test`,
          {
            type: 'CERTIFICATE_READY',
            title: '🏆 Certificate Ready!',
            message: `Your certificate for "${testExam.title}" is ready for download`,
            priority: 'high',
            userId: userId
          },
          { headers }
        );

        console.log('✅ Direct certificate ready notification sent!');
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (directError) {
        console.log('❌ Direct notification failed:', directError.response?.data?.message || directError.message);
      }
    }

    // Clean up the mock attempt
    console.log('🧹 Cleaning up mock data...');
    await prisma.examAttempt.delete({
      where: { id: mockAttempt.id }
    });

    console.log('');
    console.log('🎯 WHAT YOU SHOULD SEE IN FRONTEND:');
    console.log('===================================');
    console.log('✅ Exam completion notification appears');
    console.log('✅ Certificate ready notification appears (if passed)');
    console.log('✅ Badge count increases');
    console.log('✅ Toast notifications slide in');
    console.log('✅ Browser notifications appear (if permission granted)');
    console.log('✅ All happens INSTANTLY via WebSocket');
    console.log('');
    console.log('🔍 DEBUG TIPS:');
    console.log('==============');
    console.log('• Check browser console for notification logs');
    console.log('• Check Network tab for WebSocket activity');
    console.log('• Verify notifications appear in dropdown');
    console.log('');
    console.log('🎉 Exam completion WebSocket test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Test interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

testExamCompletionWebSocket();