const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEssayQuestions() {
  try {
    console.log('🔍 Checking essay questions in database');
    
    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    // Get the exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examCategory: true
      }
    });
    
    console.log(`📊 Exam: ${exam.title}`);
    console.log(`📊 Category: ${exam.examCategory.name}`);
    console.log(`📊 Category ID: ${exam.examCategoryId}`);
    
    // Get all essay questions for this category
    const essayQuestions = await prisma.question.findMany({
      where: {
        examCategoryId: exam.examCategoryId,
        type: 'ESSAY',
        isActive: true
      },
      include: {
        options: true
      }
    });
    
    console.log(`\n📝 Found ${essayQuestions.length} essay questions`);
    
    essayQuestions.forEach((question, index) => {
      console.log(`\n--- Question ${index + 1} ---`);
      console.log(`- ID: ${question.id}`);
      console.log(`- Text: ${question.text.substring(0, 100)}...`);
      console.log(`- Marks: ${question.marks}`);
      console.log(`- Options: ${question.options.length}`);
      
      question.options.forEach((option, optIndex) => {
        console.log(`  Option ${optIndex + 1}:`);
        console.log(`    - ID: ${option.id}`);
        console.log(`    - Text: ${option.text.substring(0, 100)}...`);
        console.log(`    - Is Correct: ${option.isCorrect}`);
      });
      
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      console.log(`- Correct Options: ${correctOptions.length}`);
    });
    
    // Check if there are any questions with correct options
    const questionsWithCorrectOptions = essayQuestions.filter(q => 
      q.options.some(opt => opt.isCorrect)
    );
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total essay questions: ${essayQuestions.length}`);
    console.log(`- Questions with correct options: ${questionsWithCorrectOptions.length}`);
    console.log(`- Questions without correct options: ${essayQuestions.length - questionsWithCorrectOptions.length}`);
    
    if (questionsWithCorrectOptions.length === 0) {
      console.log('\n⚠️  WARNING: No essay questions have correct options set!');
      console.log('This is why the scoring is failing.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEssayQuestions(); 