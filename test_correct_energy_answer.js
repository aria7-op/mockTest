const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testCorrectEnergyAnswer() {
  try {
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🔍 Testing correct energy answer for exam:', examId);
    
    // Start exam attempt
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers });
    
    if (!startResponse.data.success) {
      console.log('❌ Failed to start exam:', startResponse.data.message);
      return;
    }
    
    const attemptId = startResponse.data.data.attempt.id;
    const questions = startResponse.data.data.questions;
    const essayQuestions = questions.filter(q => q.type === 'ESSAY');
    
    console.log(`✅ Started attempt: ${attemptId}`);
    console.log(`📝 Found ${essayQuestions.length} essay questions`);
    
    // Test with a correct answer about renewable and non-renewable energy
    const correctEnergyAnswer = `Renewable energy sources include solar, wind, hydroelectric, geothermal, and biomass. These sources are naturally replenished and environmentally friendly. Non-renewable energy sources include fossil fuels like coal, oil, and natural gas, which are finite and polluting. Renewable energy is more important for the future as it reduces carbon emissions and provides sustainable power.`;
    
    console.log('\n--- Testing Correct Energy Answer ---');
    console.log(`Question: ${essayQuestions[0].text}`);
    console.log(`Correct Answer: ${essayQuestions[0].options[0].text.substring(0, 200)}...`);
    console.log(`Student Answer: ${correctEnergyAnswer}`);
    console.log('Expected: Should get high score (80-100%) because it correctly explains renewable and non-renewable energy');
    
    const responses = [{
      questionId: essayQuestions[0].id,
      selectedOptions: [],
      timeSpent: 30,
      essayAnswer: correctEnergyAnswer
    }];
    
    // Complete the attempt
    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
      responses: responses
    }, { headers });
    
    if (completeResponse.data.success) {
      console.log('\n✅ Exam completed successfully');
      
      // Get detailed results
      const resultsResponse = await axios.get(`${BASE_URL}/exams/attempts/${attemptId}`, { headers });
      
      if (resultsResponse.data.success && resultsResponse.data.data.responses && resultsResponse.data.data.responses.length > 0) {
        const response = resultsResponse.data.data.responses[0];
        console.log('\n📊 DETAILED SCORING BREAKDOWN:');
        console.log(`Score: ${response.score}/${response.question.marks} (${response.percentage}%)`);
        console.log(`Feedback: ${response.feedback}`);
        if (response.detailedAnalysis) {
          console.log(`Detailed Analysis:`, JSON.stringify(response.detailedAnalysis, null, 2));
        }
      }
    } else {
      console.log(`❌ Failed: ${completeResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCorrectEnergyAnswer(); 