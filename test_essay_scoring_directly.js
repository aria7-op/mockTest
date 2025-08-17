const EssayScoringService = require('./src/services/essayScoringService');

async function testEssayScoringDirectly() {
  try {
    console.log('🔍 Testing essay scoring service directly');
    
    // Instantiate the essay scoring service
    const essayScoringService = new EssayScoringService();
    
    // Test with exact correct answer
    const studentAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.";
    
    const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.";
    
    const maxMarks = 10;
    const question = {
      id: 'test-question',
      text: 'Explain the concept of Object-Oriented Programming and its four main principles.',
      type: 'ESSAY',
      difficulty: 'MEDIUM',
      marks: maxMarks
    };
    
    console.log('📝 Student Answer:', studentAnswer.substring(0, 100) + '...');
    console.log('📝 Correct Answer:', correctAnswer.substring(0, 100) + '...');
    console.log('📝 Max Marks:', maxMarks);
    
    const result = await essayScoringService.scoreEssay(studentAnswer, correctAnswer, maxMarks, question);
    
    console.log('\n📊 ESSAY SCORING RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.isPassed) {
      console.log('\n🎉 SUCCESS! Essay scoring is working correctly!');
    } else {
      console.log('\n⚠️  Essay scoring needs adjustment.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEssayScoringDirectly(); 