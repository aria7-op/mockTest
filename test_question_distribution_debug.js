// Test script to debug question distribution issue
console.log('🔍 Question Distribution Debug Script\n');

// Simulate the exam configuration that should be working
const examConfig = {
  totalQuestions: 18,
  multipleChoiceQuestionsCount: 10,
  fillInTheBlankQuestionsCount: 8,
  essayQuestionsCount: 0,
  shortAnswerQuestionsCount: 0,
  trueFalseQuestionsCount: 0,
  matchingQuestionsCount: 0,
  orderingQuestionsCount: 0
};

console.log('📊 Expected Exam Configuration:');
console.log(`   Total Questions: ${examConfig.totalQuestions}`);
console.log(`   Multiple Choice: ${examConfig.multipleChoiceQuestionsCount}`);
console.log(`   Fill in the Blank: ${examConfig.fillInTheBlankQuestionsCount}`);
console.log(`   Essay: ${examConfig.essayQuestionsCount}`);
console.log(`   Short Answer: ${examConfig.shortAnswerQuestionsCount}`);
console.log(`   True/False: ${examConfig.trueFalseQuestionsCount}`);
console.log(`   Matching: ${examConfig.matchingQuestionsCount}`);
console.log(`   Ordering: ${examConfig.orderingQuestionsCount}`);

// Calculate expected total
const expectedTotal = examConfig.multipleChoiceQuestionsCount + 
                     examConfig.fillInTheBlankQuestionsCount + 
                     examConfig.essayQuestionsCount + 
                     examConfig.shortAnswerQuestionsCount + 
                     examConfig.trueFalseQuestionsCount + 
                     examConfig.matchingQuestionsCount + 
                     examConfig.orderingQuestionsCount;

console.log(`\n✅ Expected Total: ${expectedTotal}`);
console.log(`   Matches totalQuestions: ${expectedTotal === examConfig.totalQuestions ? '✅' : '❌'}`);

console.log('\n🔍 Potential Issues:');
console.log('1. Exam table might have fillInTheBlankQuestionsCount = 0');
console.log('2. Questions in database might not be properly categorized as FILL_IN_THE_BLANK');
console.log('3. Question randomization service might be filtering out certain question types');
console.log('4. Database connection issue preventing proper question retrieval');

console.log('\n🛠️ To Fix:');
console.log('1. Check exam table: SELECT * FROM exam WHERE id = "your_exam_id"');
console.log('2. Verify fillInTheBlankQuestionsCount = 8');
console.log('3. Check questions table: SELECT type, COUNT(*) FROM question GROUP BY type');
console.log('4. Ensure questions have type = "FILL_IN_THE_BLANK"');
console.log('5. Check if exam is active: isActive = true');

console.log('\n📝 Quick Database Check Commands:');
console.log('-- Check exam configuration:');
console.log('   SELECT id, title, totalQuestions, multipleChoiceQuestionsCount, fillInTheBlankQuestionsCount FROM exam;');
console.log('\n-- Check available questions by type:');
console.log('   SELECT type, COUNT(*) as count FROM question GROUP BY type;');
console.log('\n-- Check specific exam questions:');
console.log('   SELECT q.type, COUNT(*) as count FROM question q JOIN exam_question eq ON q.id = eq.questionId WHERE eq.examId = "your_exam_id" GROUP BY q.type;'); 