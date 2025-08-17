const ExamService = require('./src/services/examService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const examService = new ExamService();

async function testEssayFix() {
  try {
    console.log('🧪 Testing Essay Fix...');
    
    // Get a question from the database
    const question = await prisma.question.findFirst({
      where: { type: 'ESSAY' },
      include: { options: true }
    });
    
    if (!question) {
      console.log('❌ No essay question found');
      return;
    }
    
    console.log(`📝 Question: ${question.text.substring(0, 100)}...`);
    console.log(`   Type: ${question.type}`);
    console.log(`   Options: ${question.options.length}`);
    
    const correctOption = question.options.find(option => option.isCorrect);
    if (correctOption) {
      console.log(`   ✅ Correct answer found: ${correctOption.text.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ No correct answer found`);
      return;
    }
    
    // Test the checkAnswer method
    console.log('\n🔍 Testing checkAnswer method...');
    const result = await examService.checkAnswer(question, [], correctOption.text);
    
    console.log('\n📊 Result:');
    console.log(`   Is Correct: ${result.isCorrect}`);
    console.log(`   Score: ${result.score}`);
    console.log(`   Feedback: ${result.feedback}`);
    console.log(`   Percentage: ${result.percentage}%`);
    
    if (result.detailedAnalysis) {
      console.log('\n📈 Detailed Analysis:');
      console.log(`   Content Accuracy: ${result.detailedAnalysis.contentAccuracy?.score || 0}`);
      console.log(`   Semantic Understanding: ${result.detailedAnalysis.semanticUnderstanding?.score || 0}`);
      console.log(`   Writing Quality: ${result.detailedAnalysis.writingQuality?.score || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEssayFix(); 