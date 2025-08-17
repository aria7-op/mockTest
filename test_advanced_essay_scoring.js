const EssayScoringService = require('./src/services/essayScoringService');

async function testAdvancedEssayScoring() {
  console.log('🎯 Testing Advanced IELTS/TOEFL-Level Essay Scoring System\n');

  const essayScoringService = new EssayScoringService();

  // Test question
  const question = {
    id: 'advanced-test-question-1',
    text: 'Explain the fundamental differences between stack and queue data structures, their operational principles, and provide real-world applications for each. Discuss their time complexity and when to use one over the other.',
    type: 'ESSAY',
    marks: 10,
    timeLimit: 600
  };

  // Comprehensive test cases
  const testCases = [
    {
      name: '🏆 Expert Level Answer (IELTS 9.0 / TOEFL 30)',
      answer: `Stack and queue are fundamental data structures that operate on different principles, each serving distinct computational needs.

A stack follows the Last-In-First-Out (LIFO) principle, meaning the most recently added element is the first one to be removed. This behavior mimics a stack of plates - you can only add or remove from the top. The stack supports two primary operations: push (add element) and pop (remove element), both operating in O(1) time complexity. Additionally, peek operation allows viewing the top element without removing it.

In contrast, a queue operates on the First-In-First-Out (FIFO) principle, where the first element added is the first one to be removed. This resembles a line of people waiting for service - the first person to join is the first to be served. Queue operations include enqueue (add element) and dequeue (remove element), both maintaining O(1) time complexity.

Real-world applications of stacks include:
- Function call management in programming languages, where each function call is pushed onto the call stack
- Undo/redo operations in text editors and graphic design software
- Expression evaluation and parsing in compilers
- Browser back button functionality, maintaining navigation history
- Memory management in operating systems

Queue applications include:
- Print job management in office environments
- Task scheduling in operating systems and CPU management
- Breadth-first search algorithms in graph traversal
- Customer service call waiting systems
- Network packet routing and buffering

The choice between stack and queue depends on the specific problem requirements. Use a stack when you need to reverse order or implement backtracking functionality. Choose a queue when maintaining order is crucial, such as in scheduling systems or when implementing breadth-first algorithms.

Both data structures can be implemented using arrays or linked lists, with linked list implementations offering dynamic memory allocation advantages. The space complexity for both is O(n) where n is the number of elements stored.`,
      expectedScore: '9-10/10 (A+)',
      expectedBand: '9.0 (Expert User)'
    },
    {
      name: '📚 Advanced Level Answer (IELTS 7.5 / TOEFL 25)',
      answer: `Stack and queue are both linear data structures but they operate on completely different principles.

A stack uses LIFO (Last In First Out) principle. The last element added is the first one removed. Think of it like a stack of books - you can only add or remove from the top. Stack operations include push (add) and pop (remove), both with O(1) time complexity.

A queue uses FIFO (First In First Out) principle. The first element added is the first one removed. It's like a line of people - first person to join is first to be served. Queue operations are enqueue (add) and dequeue (remove), also O(1) time complexity.

Real-world examples of stacks:
- Browser back button (navigation history)
- Undo operations in text editors
- Function call stack in programming

Real-world examples of queues:
- Print job queue
- Customer waiting lines
- Task scheduling in computers

The main difference is access pattern: stacks access from top, queues access from front. Choose stack for reverse order needs, queue for maintaining order.`,
      expectedScore: '7-8/10 (A-)',
      expectedBand: '7.5 (Good User)'
    },
    {
      name: '📖 Intermediate Level Answer (IELTS 6.0 / TOEFL 20)',
      answer: `Stack and queue are different data structures.

Stack is LIFO - Last In First Out. The last thing you put in is the first thing that comes out. Like a stack of plates, you add and remove from the top.

Queue is FIFO - First In First Out. The first thing you put in is the first thing that comes out. Like a line of people waiting.

Stack examples: browser back button, undo in text editor.
Queue examples: print queue, people waiting in line.

They are different because stack takes from top, queue takes from front.`,
      expectedScore: '5-6/10 (B)',
      expectedBand: '6.0 (Competent User)'
    },
    {
      name: '📝 Basic Level Answer (IELTS 4.5 / TOEFL 15)',
      answer: `Stack and queue are data structures.

Stack is like plates. You put on top and take from top.

Queue is like line. First person goes first.

They are different.`,
      expectedScore: '3-4/10 (C)',
      expectedBand: '4.5 (Limited User)'
    },
    {
      name: '❌ Poor Level Answer (IELTS 3.0 / TOEFL 10)',
      answer: `Stack and queue different.`,
      expectedScore: '1-2/10 (D)',
      expectedBand: '3.0 (Extremely Limited User)'
    }
  ];

  console.log(`📋 Question: ${question.text}\n`);
  console.log(`🎯 Maximum Marks: ${question.marks}\n`);

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Expected Score: ${testCase.expectedScore}`);
    console.log(`   Expected Band: ${testCase.expectedBand}`);
    console.log(`   Answer Length: ${testCase.answer.length} characters`);

    try {
      const result = await essayScoringService.scoreEssay(testCase.answer, question.text, question.marks, question);

      console.log(`\n   ✅ Final Score: ${result.totalScore}/${question.marks} (${result.percentage}%)`);
      console.log(`   🎯 Grade: ${result.grade}`);
      console.log(`   📈 Band Score: ${result.bandScore}`);
      console.log(`   ✅ Passed: ${result.isPassed ? 'Yes' : 'No'}`);
      
      console.log(`\n   📊 Detailed Breakdown:`);
      console.log(`      - Content Accuracy: ${result.detailedBreakdown.contentAccuracy?.score || 0}/${result.detailedBreakdown.contentAccuracy?.maxScore || 0} (${Math.round((result.detailedBreakdown.contentAccuracy?.score || 0) / (result.detailedBreakdown.contentAccuracy?.maxScore || 1) * 100)}%)`);
      console.log(`      - Semantic Understanding: ${result.detailedBreakdown.semanticUnderstanding?.score || 0}/${result.detailedBreakdown.semanticUnderstanding?.maxScore || 0} (${Math.round((result.detailedBreakdown.semanticUnderstanding?.score || 0) / (result.detailedBreakdown.semanticUnderstanding?.maxScore || 1) * 100)}%)`);
      console.log(`      - Writing Quality: ${result.detailedBreakdown.writingQuality?.score || 0}/${result.detailedBreakdown.writingQuality?.maxScore || 0} (${Math.round((result.detailedBreakdown.writingQuality?.score || 0) / (result.detailedBreakdown.writingQuality?.maxScore || 1) * 100)}%)`);
      console.log(`      - Critical Thinking: ${result.detailedBreakdown.criticalThinking?.score || 0}/${result.detailedBreakdown.criticalThinking?.maxScore || 0} (${Math.round((result.detailedBreakdown.criticalThinking?.score || 0) / (result.detailedBreakdown.criticalThinking?.maxScore || 1) * 100)}%)`);
      console.log(`      - Technical Precision: ${result.detailedBreakdown.technicalPrecision?.score || 0}/${result.detailedBreakdown.technicalPrecision?.maxScore || 0} (${Math.round((result.detailedBreakdown.technicalPrecision?.score || 0) / (result.detailedBreakdown.technicalPrecision?.maxScore || 1) * 100)}%)`);
      console.log(`      - Bonus Points: +${result.detailedBreakdown.bonusPoints || 0}`);
      console.log(`      - Penalties: -${result.detailedBreakdown.penalties || 0}`);

      if (result.ieltsMetrics) {
        console.log(`\n   🎓 IELTS Metrics:`);
        console.log(`      - Task Response: ${Math.round(result.ieltsMetrics.taskResponse * 100)}%`);
        console.log(`      - Coherence & Cohesion: ${Math.round(result.ieltsMetrics.coherenceCohesion * 100)}%`);
        console.log(`      - Lexical Resource: ${Math.round(result.ieltsMetrics.lexicalResource * 100)}%`);
        console.log(`      - Grammatical Range: ${Math.round(result.ieltsMetrics.grammaticalRange * 100)}%`);
      }

      if (result.toeflMetrics) {
        console.log(`\n   🎓 TOEFL Metrics:`);
        console.log(`      - Integrated Skills: ${Math.round(result.toeflMetrics.integratedSkills * 100)}%`);
        console.log(`      - Independent Writing: ${Math.round(result.toeflMetrics.independentWriting * 100)}%`);
        console.log(`      - Language Use: ${Math.round(result.toeflMetrics.languageUse * 100)}%`);
        console.log(`      - Topic Development: ${Math.round(result.toeflMetrics.topicDevelopment * 100)}%`);
      }

      console.log(`\n   💡 Feedback: ${result.feedback}`);

      // Performance analysis
      const performance = result.percentage >= 90 ? '🏆 Exceptional' :
                         result.percentage >= 80 ? '🌟 Outstanding' :
                         result.percentage >= 70 ? '✅ Very Good' :
                         result.percentage >= 60 ? '👍 Good' :
                         result.percentage >= 50 ? '⚠️  Satisfactory' :
                         result.percentage >= 40 ? '❌ Poor' : '💥 Fail';
      
      console.log(`\n   ${performance} Performance Level`);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('🎉 Advanced Essay Scoring Test Completed!');
  console.log('✨ The algorithm now provides IELTS/TOEFL-level assessment with:');
  console.log('   - Multi-dimensional content analysis');
  console.log('   - Advanced semantic understanding');
  console.log('   - Professional writing quality assessment');
  console.log('   - Critical thinking evaluation');
  console.log('   - Technical precision analysis');
  console.log('   - Sophisticated bonus/penalty system');
  console.log('   - IELTS/TOEFL band scoring');
  console.log('   - Comprehensive feedback generation');
}

// Run the comprehensive test
testAdvancedEssayScoring().catch(console.error); 