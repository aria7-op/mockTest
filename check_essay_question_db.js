const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEssayQuestion() {
  try {
    console.log('🔍 Checking essay question in database...');
    
    // Get the essay question we're testing
    const question = await prisma.question.findUnique({
      where: { id: 'cmdzjd24a0014i2gkkkmof6zj' },
      include: {
        options: true
      }
    });
    
    if (!question) {
      console.log('❌ Question not found');
      return;
    }
    
    console.log('📝 Question:', question.text);
    console.log('📝 Type:', question.type);
    console.log('📝 Marks:', question.marks);
    console.log('📝 Options:');
    
    question.options.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.text} (isCorrect: ${option.isCorrect})`);
    });
    
    // Check if any option is marked as correct
    const correctOption = question.options.find(opt => opt.isCorrect);
    console.log('✅ Correct option found:', correctOption ? 'Yes' : 'No');
    
    if (correctOption) {
      console.log('📝 Correct answer text:', correctOption.text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEssayQuestion(); 