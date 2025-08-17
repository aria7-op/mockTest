const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEssayQuestions() {
  try {
    console.log('🔍 Debugging essay questions...');
    
    // Get the specific questions from the exam
    const questionIds = ['cmdytvbr40005i2i6ie4qf45z', 'cmdytzbmw0005i21mrq6oh600'];
    
    for (const questionId of questionIds) {
      console.log(`\n📝 Question ID: ${questionId}`);
      
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          options: true
        }
      });
      
      if (question) {
        console.log(`   Text: ${question.text.substring(0, 100)}...`);
        console.log(`   Type: ${question.type}`);
        console.log(`   Options count: ${question.options.length}`);
        
        for (const option of question.options) {
          console.log(`   Option ID: ${option.id}`);
          console.log(`   Option text: ${option.text.substring(0, 50)}...`);
          console.log(`   isCorrect: ${option.isCorrect}`);
          console.log(`   ---`);
        }
      } else {
        console.log(`   ❌ Question not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugEssayQuestions(); 