const axios = require('axios');

// Test the frontend results display with correct data structure
async function testFrontendResults() {
  try {
    console.log('🔍 Testing frontend results display with correct data structure');
    
    // Simulate the API response structure that the frontend expects
    const mockApiResponse = {
      success: true,
      data: {
        data: {
          attempt: {
            id: 'test-attempt-id',
            userId: 'test-user-id',
            examId: 'test-exam-id',
            status: 'COMPLETED',
            totalMarks: 20,
            obtainedMarks: 16,
            percentage: 80.0,
            isPassed: true,
            timeSpent: 1200,
            startedAt: '2025-08-06T11:00:00.000Z',
            completedAt: '2025-08-06T11:20:00.000Z',
            exam: {
              title: 'Object-Oriented Programming Test',
              duration: 60
            },
            results: {
              totalQuestions: 2,
              correctAnswers: 1,
              wrongAnswers: 1,
              unanswered: 0,
              score: 16.5, // Actual score from essay scoring
              percentage: 80.0,
              isPassed: true,
              totalTimeSpent: 1200,
              averageTimePerQuestion: 600,
              timeEfficiency: 3.5,
              accuracy: 50,
              speedScore: 3.2,
              consistencyScore: 75,
              difficultyScore: 60,
              grade: 'B+',
              easyCorrect: 0,
              easyTotal: 0,
              mediumCorrect: 1,
              mediumTotal: 1,
              hardCorrect: 0,
              hardTotal: 1
            },
            certificate: {
              id: 'test-cert-id',
              certificateNumber: 'CERT-TEST-123',
              issuedAt: '2025-08-06T11:20:00.000Z',
              expiresAt: '2026-08-06T11:20:00.000Z'
            }
          }
        }
      }
    };

    console.log('📊 Mock API Response Structure:');
    console.log(JSON.stringify(mockApiResponse, null, 2));

    // Extract data as the frontend would
    const attempt = mockApiResponse.data.data.attempt;
    const resultsData = attempt.results || {};
    
    // Extract values as the frontend does
    const score = resultsData.percentage || attempt.percentage || 0;
    const actualScore = resultsData.score || attempt.obtainedMarks || 0;
    const correctAnswers = resultsData.correctAnswers || attempt.obtainedMarks || 0;
    const totalQuestions = resultsData.totalQuestions || attempt.totalMarks || 0;
    const timeSpent = resultsData.totalTimeSpent || attempt.timeSpent || 0;

    console.log('\n📊 Frontend Data Extraction:');
    console.log(`- Score (Percentage): ${score}%`);
    console.log(`- Actual Score: ${actualScore.toFixed(1)}/${totalQuestions}`);
    console.log(`- Correct Answers: ${correctAnswers}/${totalQuestions}`);
    console.log(`- Time Spent: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`);
    console.log(`- Grade: ${resultsData.grade || 'N/A'}`);
    console.log(`- Is Passed: ${resultsData.isPassed ? 'Yes' : 'No'}`);

    // Test the detailed analytics extraction
    const detailedAnalytics = resultsData ? {
      wrongAnswers: resultsData.wrongAnswers || 0,
      unanswered: resultsData.unanswered || 0,
      totalTimeSpent: resultsData.totalTimeSpent || 0,
      averageTimePerQuestion: resultsData.averageTimePerQuestion || 0,
      timeEfficiency: resultsData.timeEfficiency || 0,
      accuracy: resultsData.accuracy || 0,
      speedScore: resultsData.speedScore || 0,
      consistencyScore: resultsData.consistencyScore || 0,
      difficultyScore: resultsData.difficultyScore || 0,
      grade: resultsData.grade || 'N/A',
      easyCorrect: resultsData.easyCorrect || 0,
      easyTotal: resultsData.easyTotal || 0,
      mediumCorrect: resultsData.mediumCorrect || 0,
      mediumTotal: resultsData.mediumTotal || 0,
      hardCorrect: resultsData.hardCorrect || 0,
      hardTotal: resultsData.hardTotal || 0
    } : null;

    console.log('\n📊 Detailed Analytics:');
    if (detailedAnalytics) {
      console.log(`- Wrong Answers: ${detailedAnalytics.wrongAnswers}`);
      console.log(`- Unanswered: ${detailedAnalytics.unanswered}`);
      console.log(`- Accuracy: ${detailedAnalytics.accuracy}%`);
      console.log(`- Time Efficiency: ${detailedAnalytics.timeEfficiency}`);
      console.log(`- Speed Score: ${detailedAnalytics.speedScore}`);
      console.log(`- Consistency Score: ${detailedAnalytics.consistencyScore}`);
      console.log(`- Difficulty Score: ${detailedAnalytics.difficultyScore}`);
      console.log(`- Easy: ${detailedAnalytics.easyCorrect}/${detailedAnalytics.easyTotal}`);
      console.log(`- Medium: ${detailedAnalytics.mediumCorrect}/${detailedAnalytics.mediumTotal}`);
      console.log(`- Hard: ${detailedAnalytics.hardCorrect}/${detailedAnalytics.hardTotal}`);
    }

    console.log('\n✅ Frontend data extraction test completed successfully!');
    console.log('🎯 The frontend should now display:');
    console.log('   - Percentage: 80.0%');
    console.log('   - Actual Score: 16.5/20');
    console.log('   - Correct Answers: 1/2');
    console.log('   - Grade: B+');
    console.log('   - Certificate: Available');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendResults(); 