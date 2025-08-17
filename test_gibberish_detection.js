const EssayScoringService = require('./src/services/essayScoringService');

async function testGibberishDetection() {
  try {
    console.log('🔍 Testing gibberish detection');
    
    const essayScoringService = new EssayScoringService();
    
    const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.";
    
    console.log('📝 Testing correct answer:');
    console.log(correctAnswer.substring(0, 100) + '...');
    
    const gibberishScore = essayScoringService.detectGibberish(correctAnswer);
    console.log('📊 Gibberish Score:', gibberishScore);
    
    if (gibberishScore > 0.7) {
      console.log('❌ ERROR: Correct answer is being detected as gibberish!');
    } else {
      console.log('✅ Correct answer is not detected as gibberish');
    }
    
    // Test with actual gibberish
    const gibberishText = "asdfasdfasdf asdfasdf asdfasdf asdfasdf asdfasdf asdfasdf";
    console.log('\n📝 Testing gibberish text:');
    console.log(gibberishText);
    
    const gibberishScore2 = essayScoringService.detectGibberish(gibberishText);
    console.log('📊 Gibberish Score:', gibberishScore2);
    
    if (gibberishScore2 > 0.7) {
      console.log('✅ Gibberish correctly detected');
    } else {
      console.log('❌ Gibberish not detected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGibberishDetection(); 