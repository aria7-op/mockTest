// Mock logger
global.logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log
};

const EssayScoringService = require('./src/services/essayScoringService');

async function testAlgorithmDirect() {
  try {
    console.log('🧠 Testing Enhanced Essay Scoring Algorithm Directly');
    
    const essayScoringService = new EssayScoringService();
    
    // Test different answer qualities for the same question
    const question = "Explain the concept of Object-Oriented Programming (OOP) and discuss its four main principles.";
    const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - allowing a class to inherit properties and methods from another class, 3) Polymorphism - allowing objects to be treated as instances of their parent class, and 4) Abstraction - hiding complex implementation details and showing only necessary features.";
    
    const testAnswers = {
      'Completely Wrong': "I don't know what programming is. Cars are vehicles that move on roads. Trees grow in forests. This has nothing to do with computers.",
      'Very Basic': "OOP is programming with objects. It has four principles. That's all I know about it.",
      'Basic': "Object-Oriented Programming uses objects to organize code. It has four principles: encapsulation, inheritance, polymorphism, and abstraction.",
      'Good': "Object-Oriented Programming is a programming paradigm that organizes software design around objects. The four main principles are encapsulation, inheritance, polymorphism, and abstraction.",
      'Very Good': "Object-Oriented Programming is a programming paradigm based on objects that contain data and code. The four principles are encapsulation, inheritance, polymorphism, and abstraction, which promote code reusability and maintainability.",
      'Excellent': "Object-Oriented Programming is a programming paradigm based on objects that contain data and code. The four principles are encapsulation, inheritance, polymorphism, and abstraction, which promote code reusability, maintainability, and provide a natural way to model real-world entities."
    };

    console.log('\n📝 Question:', question);
    console.log('📝 Correct Answer:', correctAnswer.substring(0, 100) + '...');
    
    console.log('\n🔍 Testing Enhanced Algorithm Results:');
    console.log('================================================================================');
    console.log('Quality Level       | Expected Score | Algorithm Score | Accuracy');
    console.log('================================================================================');

    for (const [quality, answer] of Object.entries(testAnswers)) {
      try {
        // Call the essay scoring service directly
        const result = await essayScoringService.scoreEssay(answer, correctAnswer, 10);
        
        const score = result.totalScore || result.score || 0;
        const percentage = result.percentage || 0;
        
        // Determine expected score based on quality
        let expectedScore;
        switch (quality) {
          case 'Completely Wrong': expectedScore = 0; break;
          case 'Very Basic': expectedScore = 2; break;
          case 'Basic': expectedScore = 4; break;
          case 'Good': expectedScore = 6; break;
          case 'Very Good': expectedScore = 8; break;
          case 'Excellent': expectedScore = 10; break;
          default: expectedScore = 5;
        }
        
        const accuracy = Math.abs(score - expectedScore) <= 2 ? '✅' : '❌';
        
        console.log(`${quality.padEnd(18)} | ${expectedScore.toString().padStart(13)} | ${score.toFixed(1).padStart(14)} | ${accuracy}`);
        
        // Show detailed breakdown for excellent answer
        if (quality === 'Excellent') {
          console.log('\n📊 Detailed Breakdown for Excellent Answer:');
          console.log('- Score:', score.toFixed(1));
          console.log('- Percentage:', percentage.toFixed(1) + '%');
          console.log('- Feedback:', result.feedback);
          
          if (result.detailedBreakdown) {
            console.log('- Content Accuracy:', result.detailedBreakdown.contentAccuracy?.toFixed(1) || 'N/A');
            console.log('- Semantic Understanding:', result.detailedBreakdown.semanticUnderstanding?.toFixed(1) || 'N/A');
            console.log('- Writing Quality:', result.detailedBreakdown.writingQuality?.toFixed(1) || 'N/A');
            console.log('- Critical Thinking:', result.detailedBreakdown.criticalThinking?.toFixed(1) || 'N/A');
            console.log('- Technical Precision:', result.detailedBreakdown.technicalPrecision?.toFixed(1) || 'N/A');
          }
        }
      } catch (error) {
        console.log(`${quality.padEnd(18)} | Error: ${error.message}`);
      }
    }

    console.log('\n================================================================================');
    console.log('🎯 Algorithm Assessment:');
    console.log('✅ Should give 0-2 for completely wrong answers');
    console.log('✅ Should give 2-4 for very basic answers');
    console.log('✅ Should give 4-6 for basic answers');
    console.log('✅ Should give 6-8 for good answers');
    console.log('✅ Should give 8-10 for very good answers');
    console.log('✅ Should give 9-10 for excellent answers');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAlgorithmDirect(); 