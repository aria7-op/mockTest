const axios = require('axios');

async function testEssayScoring() {
  console.log('🧪 Testing Essay Scoring with Direct Question Response...\n');
  
  // First, let's create a new exam attempt with the essay question
  const examId = 'cmdyncpow000pi2x0kdykxugt';
  const essayQuestionId = 'cmdyn9xa10009i2x0xvimgd59';
  
  try {
    // Start a new exam attempt
    console.log('📚 Starting new exam attempt...');
    const startResponse = await axios.post(`http://localhost:5000/api/v1/exams/${examId}/start`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWR3M2E5dzMwMDAzaTJqaXE1eWVhZWkwIiwiaWF0IjoxNzU0NDA0OTg2LCJleHAiOjE3NTUwMDk3ODZ9.kdU2dHDPze-pbZSxDvc-yxbOHecc4iGoVtYc--wOBC4'
      }
    });

    if (!startResponse.data.success) {
      console.log('❌ Failed to start exam:', startResponse.data.error?.message);
      return;
    }

    const attemptId = startResponse.data.data.attempt.id;
    console.log(`✅ Exam started. Attempt ID: ${attemptId}`);

    // Test essay answer
    const essayAnswer = `A stack and a queue are both fundamental data structures in computer science, but they operate on different principles.

A stack follows the Last-In-First-Out (LIFO) principle, meaning the last element added is the first one to be removed. Think of it like a stack of plates - you can only add or remove from the top. In programming, stacks are commonly used for function call management, undo operations, and parsing expressions.

A queue follows the First-In-First-Out (FIFO) principle, meaning the first element added is the first one to be removed. It's like a line of people waiting - the first person to join the line is the first to be served. Queues are essential for task scheduling, print job management, and breadth-first search algorithms.

Real-world examples of stacks include:
- Browser back button functionality
- Text editor undo/redo operations
- Function call stack in programming languages

Real-world examples of queues include:
- Print job queue in office printers
- Customer service call waiting lines
- Task scheduling in operating systems

The key difference is in their access patterns: stacks allow access only to the top element, while queues allow access only to the front element. This fundamental difference makes them suitable for different types of problems and applications.`;

    console.log('📝 Submitting essay answer...');
    const response = await axios.post(`http://localhost:5000/api/v1/exams/attempts/${attemptId}/responses`, {
      questionId: essayQuestionId,
      essayAnswer: essayAnswer,
      timeSpent: 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWR3M2E5dzMwMDAzaTJqaXE1eWVhZWkwIiwiaWF0IjoxNzU0NDA0OTg2LCJleHAiOjE3NTUwMDk3ODZ9.kdU2dHDPze-pbZSxDvc-yxbOHecc4iGoVtYc--wOBC4'
      }
    });

    if (response.data.success) {
      const result = response.data.data;
      console.log('✅ Essay scored successfully!');
      console.log(`📊 Score: ${result.score}/${result.marksObtained}`);
      console.log(`📈 Percentage: ${result.percentage}%`);
      console.log(`💡 Feedback: ${result.feedback}`);
      
      if (result.detailedAnalysis) {
        console.log('🔍 Detailed Analysis:');
        console.log(`   - Keywords: ${result.detailedAnalysis.keywordScore}%`);
        console.log(`   - Semantic: ${result.detailedAnalysis.semanticScore}%`);
        console.log(`   - Structure: ${result.detailedAnalysis.structureScore}%`);
        console.log(`   - Language: ${result.detailedAnalysis.languageScore}%`);
        console.log(`   - Coherence: ${result.detailedAnalysis.coherenceScore}%`);
      }
    } else {
      console.log('❌ Essay scoring failed:', response.data.error?.message);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data?.error?.message || error.message);
  }
}

testEssayScoring(); 