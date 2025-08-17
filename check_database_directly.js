const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseDirectly() {
  try {
    console.log('🔍 Checking database directly');
    
    const questionId = 'cmdyqgdot0005i2btrbjhyh3j';
    
    // Get the question directly from database
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true
      }
    });
    
    if (question) {
      console.log(`📝 Question: ${question.text.substring(0, 100)}...`);
      console.log(`📝 Type: ${question.type}`);
      console.log(`📝 Options: ${question.options.length}`);
      
      question.options.forEach((option, index) => {
        console.log(`\n  Option ${index + 1}:`);
        console.log(`    - ID: ${option.id}`);
        console.log(`    - Text: ${option.text.substring(0, 100)}...`);
        console.log(`    - Is Correct: ${option.isCorrect}`);
        console.log(`    - Is Correct Type: ${typeof option.isCorrect}`);
      });
      
      // Check with raw SQL
      console.log('\n🔍 Checking with raw SQL...');
      const rawOptions = await prisma.$queryRaw`
        SELECT id, text, "isCorrect", "sortOrder" 
        FROM question_options 
        WHERE "questionId" = ${questionId}
        ORDER BY "sortOrder"
      `;
      
      console.log('Raw SQL Results:');
      rawOptions.forEach((option, index) => {
        console.log(`  Option ${index + 1}:`);
        console.log(`    - ID: ${option.id}`);
        console.log(`    - Text: ${option.text.substring(0, 100)}...`);
        console.log(`    - Is Correct: ${option.isCorrect}`);
        console.log(`    - Is Correct Type: ${typeof option.isCorrect}`);
      });
    } else {
      console.log('❌ Question not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseDirectly(); 