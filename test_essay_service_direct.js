const EssayScoringService = require('./src/services/essayScoringService');

const essayScoringService = new EssayScoringService();

async function testEssayServiceDirect() {
  try {
    console.log('🧪 Testing Essay Scoring Service Directly...');
    
    // Test data
    const studentAnswer = "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.";
    
    const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.";
    
    const maxMarks = 10;
    const questionData = {
      id: 'test-question-1',
      text: 'Explain the concept of Object-Oriented Programming (OOP) and discuss its four main principles with examples.',
      type: 'ESSAY',
      difficulty: 'MEDIUM'
    };
    
    console.log('\n📝 Student Answer Length:', studentAnswer.length);
    console.log('📝 Correct Answer Length:', correctAnswer.length);
    console.log('📝 Max Marks:', maxMarks);
    
    // Test the essay scoring service
    console.log('\n🔍 Running essay scoring...');
    const result = await essayScoringService.scoreEssay(studentAnswer, correctAnswer, maxMarks, questionData);
    
    console.log('\n📊 Essay Scoring Results:');
    console.log('   Total Score:', result.totalScore);
    console.log('   Max Marks:', result.maxMarks);
    console.log('   Percentage:', result.percentage + '%');
    console.log('   Is Passed:', result.isPassed);
    console.log('   Grade:', result.grade);
    console.log('   Band:', result.band);
    console.log('   Assessment:', result.assessment);
    
    if (result.detailedBreakdown) {
      console.log('\n📈 Detailed Breakdown:');
      console.log('   Content Accuracy:', result.detailedBreakdown.contentAccuracy?.score || 0, '/', result.detailedBreakdown.contentAccuracy?.maxScore || 0);
      console.log('   Semantic Understanding:', result.detailedBreakdown.semanticUnderstanding?.score || 0, '/', result.detailedBreakdown.semanticUnderstanding?.maxScore || 0);
      console.log('   Writing Quality:', result.detailedBreakdown.writingQuality?.score || 0, '/', result.detailedBreakdown.writingQuality?.maxScore || 0);
      console.log('   Critical Thinking:', result.detailedBreakdown.criticalThinking?.score || 0, '/', result.detailedBreakdown.criticalThinking?.maxScore || 0);
      console.log('   Technical Precision:', result.detailedBreakdown.technicalPrecision?.score || 0, '/', result.detailedBreakdown.technicalPrecision?.maxScore || 0);
    }
    
    if (result.feedback) {
      console.log('\n💬 Feedback:');
      console.log('   ', result.feedback);
    }
    
    // Test with a different answer (partial match)
    console.log('\n🧪 Testing with partial answer...');
    const partialAnswer = "OOP is about objects and classes. It has four principles: encapsulation, inheritance, polymorphism, and abstraction.";
    
    const partialResult = await essayScoringService.scoreEssay(partialAnswer, correctAnswer, maxMarks, questionData);
    
    console.log('\n📊 Partial Answer Results:');
    console.log('   Total Score:', partialResult.totalScore);
    console.log('   Percentage:', partialResult.percentage + '%');
    console.log('   Is Passed:', partialResult.isPassed);
    console.log('   Grade:', partialResult.grade);
    
  } catch (error) {
    console.error('❌ Error testing essay service:', error);
  }
}

// Run the test
testEssayServiceDirect(); 