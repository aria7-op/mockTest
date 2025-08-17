const { PrismaClient } = require('@prisma/client');
const EssayScoringService = require('./src/services/essayScoringService');

const prisma = new PrismaClient();

async function testEssayScoringDirect() {
  try {
    console.log('🔍 Testing essay scoring service directly...');
    
    // Get the essay question and correct answer
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
    
    const correctOption = question.options.find(opt => opt.isCorrect);
    if (!correctOption) {
      console.log('❌ No correct answer found');
      return;
    }
    
    console.log('📝 Question:', question.text);
    console.log('📝 Correct answer:', correctOption.text);
    console.log('📝 Question marks:', question.marks);
    
    // Test with different quality answers
    const testAnswers = [
      {
        name: 'Poor/Incorrect',
        answer: 'I don\'t know what this is about. Random words: apple, car, tree.'
      },
      {
        name: 'Very Basic',
        answer: 'Sustainable development is about development that is sustainable.'
      },
      {
        name: 'Basic',
        answer: 'Sustainable development balances economic, social, and environmental needs.'
      },
      {
        name: 'Good',
        answer: 'Sustainable development is development that meets the needs of the present without compromising the ability of future generations to meet their own needs. It has three pillars: economic, social, and environmental.'
      },
      {
        name: 'Very Good',
        answer: 'Sustainable development is a comprehensive approach that balances economic growth, social equity, and environmental protection. The three pillars are economic sustainability, social sustainability, and environmental sustainability. This ensures long-term viability and benefits for future generations.'
      },
      {
        name: 'Excellent',
        answer: 'Sustainable development is a holistic development paradigm that integrates economic growth, social equity, and environmental protection. The three pillars are economic sustainability (ensuring economic prosperity), social sustainability (promoting social justice and equity), and environmental sustainability (protecting natural resources and ecosystems). This balanced approach ensures that current development needs are met while preserving the ability of future generations to meet their own needs.'
      }
    ];
    
    const essayScoringService = new EssayScoringService();
    
    for (const test of testAnswers) {
      console.log(`\n📝 Testing ${test.name} answer:`);
      console.log(`Answer: ${test.answer.substring(0, 100)}...`);
      
      const result = await essayScoringService.scoreEssay(
        test.answer,
        correctOption.text,
        question.marks
      );
      
      console.log(`📊 Score: ${result.totalScore}/${question.marks} (${result.percentage}%)`);
      console.log(`📊 Grade: ${result.grade}`);
      console.log(`📊 Feedback: ${typeof result.feedback === 'string' ? result.feedback : result.feedback?.join(', ') || 'No feedback'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEssayScoringDirect(); 