const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllEssayQuestions() {
  try {
    console.log('🔧 Fixing all essay questions in the database...');
    
    // Find all essay questions
    const essayQuestions = await prisma.question.findMany({
      where: {
        type: 'ESSAY'
      },
      include: {
        options: true
      }
    });

    console.log(`📝 Found ${essayQuestions.length} essay questions`);

    let fixedCount = 0;

    for (const question of essayQuestions) {
      console.log(`\n🔧 Processing: ${question.text.substring(0, 80)}...`);
      console.log(`   ID: ${question.id}`);
      console.log(`   Options: ${question.options.length}`);

      // Check if any option is already marked as correct
      const hasCorrectOption = question.options.some(option => option.isCorrect);
      
      if (hasCorrectOption) {
        console.log(`   ⏭️  Already has correct answer`);
        continue;
      }

      // Mark the first option as correct for all essay questions
      if (question.options.length > 0) {
        const firstOption = question.options[0];
        
        await prisma.questionOption.update({
          where: { id: firstOption.id },
          data: {
            isCorrect: true
          }
        });

        console.log(`   ✅ Marked first option as correct`);
        fixedCount++;
      } else {
        console.log(`   ❌ No options found`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total essay questions: ${essayQuestions.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Already correct: ${essayQuestions.length - fixedCount}`);

  } catch (error) {
    console.error('❌ Error fixing essay questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixAllEssayQuestions(); 