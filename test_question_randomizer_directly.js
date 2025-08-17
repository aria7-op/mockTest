const questionRandomizationService = require('./src/services/questionRandomizationService');

async function testQuestionRandomizerDirectly() {
  try {
    console.log('🔍 Testing question randomizer directly');
    
    const examId = 'cmdyncpow000pi2x0kdykxugt';
    const examCategoryId = 'cmdyb4pji0000i2ovlel4fmju';
    
    const questions = await questionRandomizationService.generateRandomQuestions({
      examId,
      userId: 'test-user',
      questionCount: 2,
      examCategoryId,
      overlapPercentage: 10.0,
      essayQuestionsCount: 2,
      multipleChoiceQuestionsCount: 0,
      shortAnswerQuestionsCount: 0,
      fillInTheBlankQuestionsCount: 0,
      trueFalseQuestionsCount: 0,
      matchingQuestionsCount: 0,
      orderingQuestionsCount: 0
    });
    
    console.log(`📝 Generated ${questions.length} questions`);
    
    questions.forEach((question, index) => {
      console.log(`\n--- Question ${index + 1} ---`);
      console.log(`- ID: ${question.id}`);
      console.log(`- Type: ${question.type}`);
      console.log(`- Text: ${question.text.substring(0, 100)}...`);
      console.log(`- Marks: ${question.marks}`);
      console.log(`- Options Count: ${question.options ? question.options.length : 'NO OPTIONS'}`);
      
      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optIndex) => {
          console.log(`  Option ${optIndex + 1}:`);
          console.log(`    - ID: ${option.id}`);
          console.log(`    - Text: ${option.text.substring(0, 100)}...`);
          console.log(`    - Is Correct: ${option.isCorrect}`);
          console.log(`    - Is Correct Type: ${typeof option.isCorrect}`);
        });
        
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        console.log(`  Correct Options: ${correctOptions.length}`);
      } else {
        console.log('  ❌ NO OPTIONS FOUND');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testQuestionRandomizerDirectly(); 