const { PrismaClient } = require('@prisma/client');
const logger = require('./src/config/logger');

const prisma = new PrismaClient();

async function fixEssayQuestions() {
  try {
    console.log('🔍 Finding all essay questions in the database...');
    
    // Find all essay questions
    const essayQuestions = await prisma.question.findMany({
      where: {
        type: 'ESSAY'
      },
      include: {
        options: true,
        exam_categories: true
      }
    });

    console.log(`📝 Found ${essayQuestions.length} essay questions`);

    if (essayQuestions.length === 0) {
      console.log('✅ No essay questions found to fix');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;

    for (const question of essayQuestions) {
      console.log(`\n🔧 Processing question: ${question.text.substring(0, 100)}...`);
      console.log(`   ID: ${question.id}`);
      console.log(`   Category: ${question.exam_categories.name}`);
      console.log(`   Current options: ${question.options.length}`);

      // Check if this question already has a correct answer option
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      
      if (hasCorrectAnswer) {
        console.log(`   ⏭️  Skipped - already has correct answer`);
        skippedCount++;
        continue;
      }

      // For essay questions, we need to create a correct answer option
      // Since we don't have the original correct answer, we'll create a placeholder
      // that can be updated later by the admin
      
      const correctAnswerText = `[CORRECT ANSWER NEEDED] - ${question.text.substring(0, 50)}...`;
      
      try {
        await prisma.questionOption.create({
          data: {
            questionId: question.id,
            text: correctAnswerText,
            isCorrect: true,
            sortOrder: 0
          }
        });

        console.log(`   ✅ Fixed - added correct answer option`);
        fixedCount++;

      } catch (error) {
        console.log(`   ❌ Error fixing question: ${error.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total essay questions: ${essayQuestions.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Skipped (already correct): ${skippedCount}`);
    console.log(`   Failed: ${essayQuestions.length - fixedCount - skippedCount}`);

    if (fixedCount > 0) {
      console.log(`\n⚠️  IMPORTANT: ${fixedCount} questions were fixed with placeholder correct answers.`);
      console.log(`   Please update these questions with proper correct answers:`);
      
      const fixedQuestions = essayQuestions.filter(q => 
        !q.options.some(option => option.isCorrect)
      );
      
      for (const question of fixedQuestions) {
        console.log(`   - Question ID: ${question.id}`);
        console.log(`   - Text: ${question.text.substring(0, 100)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Error fixing essay questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixEssayQuestions(); 