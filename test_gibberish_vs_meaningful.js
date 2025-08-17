const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testGibberishVsMeaningful() {
  try {
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    console.log('🔍 Testing gibberish vs meaningful answers for exam:', examId);
    
    // 1. Get exam details
    console.log('\n1. Getting exam details...');
    const examResponse = await axios.get(`${BASE_URL}/exams/${examId}`, { headers });
    console.log('Exam:', examResponse.data.data?.exam?.title);
    
    // 2. Start exam attempt
    console.log('\n2. Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers });
    
    if (!startResponse.data.success) {
      console.log('❌ Failed to start exam:', startResponse.data.message);
      return;
    }
    
    const attemptId = startResponse.data.data.attempt.id;
    const questions = startResponse.data.data.questions;
    
    console.log(`✅ Started attempt: ${attemptId}`);
    console.log(`📝 Found ${questions.length} questions`);
    
    // 3. Find essay questions
    const essayQuestions = questions.filter(q => q.type === 'ESSAY');
    console.log(`📝 Found ${essayQuestions.length} essay questions`);
    
    // 4. Test with different types of answers
    console.log('\n3. Testing different answer types...');
    
    const testAnswers = [
      // Test 1: Pure gibberish
      {
        type: "GIBBERISH",
        answer: "aldbaslbsjadhadsaldas",
        expected: "Should get very low score (5% or less)"
      },
      // Test 2: Meaningful but wrong answer
      {
        type: "MEANINGFUL_WRONG",
        answer: "Artificial intelligence is a type of computer program that can think like humans. It uses algorithms and data to make decisions. AI is used in many applications like voice assistants and recommendation systems.",
        expected: "Should get moderate score (30-60%)"
      },
      // Test 3: Partially correct answer
      {
        type: "PARTIALLY_CORRECT",
        answer: "AI refers to simulation of human intelligence in machines. It helps with automation and productivity. However, I'm not sure about all the details.",
        expected: "Should get good score (60-80%)"
      },
      // Test 4: Correct answer
      {
        type: "CORRECT",
        answer: "AI refers to simulation of human intelligence in machines. Benefits: automation, healthcare, productivity. Challenges: job displacement, privacy, ethics.",
        expected: "Should get high score (80-100%)"
      }
    ];
    
    for (let i = 0; i < Math.min(essayQuestions.length, testAnswers.length); i++) {
      const question = essayQuestions[i];
      const testAnswer = testAnswers[i];
      
      console.log(`\n--- Test ${i + 1}: ${testAnswer.type} ---`);
      console.log(`Question: ${question.text.substring(0, 100)}...`);
      console.log(`Answer: ${testAnswer.answer}`);
      console.log(`Expected: ${testAnswer.expected}`);
      
      // Start a new attempt for each test
      const newStartResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers });
      const newAttemptId = newStartResponse.data.data.attempt.id;
      
      const responses = [{
        questionId: question.id,
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: testAnswer.answer
      }];
      
      // Complete the attempt
      const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${newAttemptId}/complete`, {
        responses: responses
      }, { headers });
      
      if (completeResponse.data.success) {
        const score = completeResponse.data.data?.score || 0;
        const percentage = completeResponse.data.data?.percentage || 0;
        console.log(`✅ Score: ${score}/${completeResponse.data.data?.maxMarks || 10} (${percentage}%)`);
        
        // Check if the score makes sense
        if (testAnswer.type === "GIBBERISH" && percentage > 10) {
          console.log(`⚠️  WARNING: Gibberish got ${percentage}% - should be much lower!`);
        } else if (testAnswer.type === "CORRECT" && percentage < 70) {
          console.log(`⚠️  WARNING: Correct answer got ${percentage}% - should be higher!`);
        } else {
          console.log(`✅ Score looks reasonable for ${testAnswer.type}`);
        }
      } else {
        console.log(`❌ Failed: ${completeResponse.data.message}`);
      }
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGibberishVsMeaningful(); 