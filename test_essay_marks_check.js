const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEssayMarks() {
  try {
    console.log('🔍 Checking Essay Question Marks...');
    
    // Get essay questions from the database
    const essayQuestions = await prisma.question.findMany({
      where: { type: 'ESSAY' },
      include: { options: true },
      take: 5
    });
    
    console.log(`\n📝 Found ${essayQuestions.length} essay questions:`);
    
    essayQuestions.forEach((question, index) => {
      console.log(`\n${index + 1}. Question ID: ${question.id}`);
      console.log(`   Text: ${question.text.substring(0, 100)}...`);
      console.log(`   Marks: ${question.marks}`);
      console.log(`   Options: ${question.options.length}`);
      
      const correctOption = question.options.find(option => option.isCorrect);
      if (correctOption) {
        console.log(`   Correct Answer Length: ${correctOption.text.length} characters`);
      } else {
        console.log(`   ❌ No correct answer found`);
      }
    });
    
    // Check the specific exam questions
    console.log('\n🔍 Checking specific exam questions...');
    const examQuestions = [
      'cmdytvbr40005i2i6ie4qf45z',
      'cmdytzbmw0005i21mrq6oh600'
    ];
    
    for (const questionId of examQuestions) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true }
      });
      
      if (question) {
        console.log(`\n📝 Question ID: ${questionId}`);
        console.log(`   Text: ${question.text.substring(0, 100)}...`);
        console.log(`   Type: ${question.type}`);
        console.log(`   Marks: ${question.marks}`);
        console.log(`   Options: ${question.options.length}`);
        
        const correctOption = question.options.find(option => option.isCorrect);
        if (correctOption) {
          console.log(`   Correct Answer Length: ${correctOption.text.length} characters`);
        } else {
          console.log(`   ❌ No correct answer found`);
        }
      } else {
        console.log(`\n❌ Question not found: ${questionId}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkEssayMarks(); 