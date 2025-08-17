const EssayScoringService = require('./src/services/essayScoringService');

async function debugExcellentAnswer() {
  try {
    console.log('🔍 Debugging excellent answer scoring');
    
    const essayScoringService = new EssayScoringService();
    
    const excellentAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, providing data hiding and access control, 2) Inheritance - creating new classes that are built upon existing classes, enabling code reuse and establishing relationships between classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, allowing objects to be treated as instances of their parent class, and 4) Abstraction - hiding complex implementation details and showing only necessary features, reducing complexity and improving maintainability. OOP promotes code reusability, maintainability, scalability, and provides a natural way to model real-world entities in software development.";
    
    const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.";
    
    const maxMarks = 10;
    const question = {
      id: 'test-question',
      text: 'Explain the concept of Object-Oriented Programming and its four main principles.',
      type: 'ESSAY',
      difficulty: 'MEDIUM',
      marks: maxMarks
    };
    
    console.log('📝 Excellent Answer Length:', excellentAnswer.length);
    console.log('📝 Correct Answer Length:', correctAnswer.length);
    console.log('📝 Max Marks:', maxMarks);
    
    // Test gibberish detection first
    const gibberishScore = essayScoringService.detectGibberish(excellentAnswer);
    console.log('📊 Gibberish Score:', gibberishScore);
    
    if (gibberishScore > 0.7) {
      console.log('❌ Excellent answer is being detected as gibberish!');
    } else {
      console.log('✅ Excellent answer is not detected as gibberish');
    }
    
    // Test off-topic detection
    const offTopicScore = essayScoringService.detectCompletelyOffTopic(excellentAnswer, correctAnswer);
    console.log('📊 Off-Topic Score:', offTopicScore);
    
    if (offTopicScore > 0.9) {
      console.log('❌ Excellent answer is being detected as off-topic!');
    } else {
      console.log('✅ Excellent answer is not detected as off-topic');
    }
    
    // Test the full scoring
    const result = await essayScoringService.scoreEssay(excellentAnswer, correctAnswer, maxMarks, question);
    
    console.log('\n📊 EXCELLENT ANSWER SCORING RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.isPassed) {
      console.log('\n🎉 SUCCESS! Excellent answer is being scored correctly!');
    } else {
      console.log('\n⚠️  Excellent answer is not being scored correctly.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugExcellentAnswer(); 