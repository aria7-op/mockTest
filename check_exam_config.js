const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExamConfig() {
  try {
    console.log('🔍 Checking exam configuration...\n');
    
    // Get all exams with their question counts
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        totalQuestions: true,
        multipleChoiceQuestionsCount: true,
        fillInTheBlankQuestionsCount: true,
        essayQuestionsCount: true,
        shortAnswerQuestionsCount: true,
        trueFalseQuestionsCount: true,
        matchingQuestionsCount: true,
        orderingQuestionsCount: true,
        isActive: true,
        examCategoryId: true
      }
    });

    console.log(`📊 Found ${exams.length} exams:\n`);

    for (const exam of exams) {
      console.log(`📝 Exam: ${exam.title}`);
      console.log(`   ID: ${exam.id}`);
      console.log(`   Total Questions: ${exam.totalQuestions}`);
      console.log(`   Multiple Choice: ${exam.multipleChoiceQuestionsCount}`);
      console.log(`   Fill in the Blank: ${exam.fillInTheBlankQuestionsCount}`);
      console.log(`   Essay: ${exam.essayQuestionsCount}`);
      console.log(`   Short Answer: ${exam.shortAnswerQuestionsCount}`);
      console.log(`   True/False: ${exam.trueFalseQuestionsCount}`);
      console.log(`   Matching: ${exam.matchingQuestionsCount}`);
      console.log(`   Ordering: ${exam.orderingQuestionsCount}`);
      console.log(`   Active: ${exam.isActive}`);
      console.log(`   Category ID: ${exam.examCategoryId}`);
      
      // Calculate expected total
      const calculatedTotal = (exam.multipleChoiceQuestionsCount || 0) + 
                             (exam.fillInTheBlankQuestionsCount || 0) + 
                             (exam.essayQuestionsCount || 0) + 
                             (exam.shortAnswerQuestionsCount || 0) + 
                             (exam.trueFalseQuestionsCount || 0) + 
                             (exam.matchingQuestionsCount || 0) + 
                             (exam.orderingQuestionsCount || 0);
      
      console.log(`   Calculated Total: ${calculatedTotal}`);
      console.log(`   Matches totalQuestions: ${calculatedTotal === exam.totalQuestions ? '✅' : '❌'}`);
      console.log('');
    }

    // Check if there are questions in the database
    const questionCounts = await prisma.question.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    console.log('📚 Questions available in database by type:');
    for (const count of questionCounts) {
      console.log(`   ${count.type}: ${count._count.type}`);
    }

    console.log('\n🔍 To fix the issue:');
    console.log('1. Check if the exam has the correct fillInTheBlankQuestionsCount value');
    console.log('2. Ensure there are enough FILL_IN_THE_BLANK questions in the database');
    console.log('3. Verify the exam is active and properly configured');

  } catch (error) {
    console.error('❌ Error checking exam config:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExamConfig(); 