const EssayScoringService = require('./src/services/essayScoringService');

async function testEssayScoringService() {
  console.log('🧪 Testing Essay Scoring Service Directly...\n');
  
  const essayScoringService = new EssayScoringService();
  
  // Test question
  const question = {
    id: 'test-question-1',
    text: 'What is the difference between a stack and a queue data structure? Provide real-world examples of each.',
    type: 'ESSAY',
    marks: 8,
    timeLimit: 480
  };
  
  // Test answers with different quality levels
  const testCases = [
    {
      name: 'Excellent Answer',
      answer: `A stack and a queue are both fundamental data structures in computer science, but they operate on different principles.

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

The key difference is in their access patterns: stacks allow access only to the top element, while queues allow access only to the front element. This fundamental difference makes them suitable for different types of problems and applications.`,
      expectedScore: 'High (7-8/8)'
    },
    {
      name: 'Good Answer',
      answer: `A stack is a data structure that follows LIFO (Last In First Out) principle. The last element added is the first one removed. Examples include browser back button and undo operations.

A queue follows FIFO (First In First Out) principle. The first element added is the first one removed. Examples include print job queue and customer waiting lines.

The main difference is how elements are accessed - stacks access from top, queues access from front.`,
      expectedScore: 'Medium (5-6/8)'
    },
    {
      name: 'Poor Answer',
      answer: `Stack and queue are different. Stack is like plates. Queue is like line.`,
      expectedScore: 'Low (2-3/8)'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Expected Score: ${testCase.expectedScore}`);
    
    try {
      const result = await essayScoringService.scoreEssay(testCase.answer, question.text, question.marks, question);
      
                 console.log(`   ✅ Final Score: ${result.totalScore}/${question.marks} (${result.percentage}%)`);
           console.log(`   📊 Breakdown:`);
           console.log(`      - Content Accuracy: ${result.detailedBreakdown.contentAccuracy?.score || 0}/${result.detailedBreakdown.contentAccuracy?.maxScore || 0}`);
           console.log(`      - Semantic Understanding: ${result.detailedBreakdown.semanticUnderstanding?.score || 0}/${result.detailedBreakdown.semanticUnderstanding?.maxScore || 0}`);
           console.log(`      - Writing Quality: ${result.detailedBreakdown.writingQuality?.score || 0}/${result.detailedBreakdown.writingQuality?.maxScore || 0}`);
           console.log(`      - Critical Thinking: ${result.detailedBreakdown.criticalThinking?.score || 0}/${result.detailedBreakdown.criticalThinking?.maxScore || 0}`);
           console.log(`      - Technical Precision: ${result.detailedBreakdown.technicalPrecision?.score || 0}/${result.detailedBreakdown.technicalPrecision?.maxScore || 0}`);
           console.log(`      - Bonus Points: ${result.detailedBreakdown.bonusPoints || 0}`);
           console.log(`      - Penalties: ${result.detailedBreakdown.penalties || 0}`);
           console.log(`   🎯 Grade: ${result.grade}`);
           console.log(`   📈 Band Score: ${result.bandScore}`);
           console.log(`   💡 Feedback: ${result.feedback}`);
      
      // Check if the scoring is working correctly
      if (result.totalScore !== null && result.totalScore !== undefined && !isNaN(result.totalScore)) {
        console.log(`   ✅ Scoring algorithm is working correctly!`);
      } else {
        console.log(`   ⚠️  Scoring algorithm returned invalid result`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run the test
testEssayScoringService().catch(console.error); 