const EssayScoringService = require('./src/services/essayScoringService');

async function debugEssayLayers() {
  const essayScoringService = new EssayScoringService();
  
  const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods together, inheritance allows classes to inherit from other classes, polymorphism enables different objects to respond to the same method call, and abstraction hides complex implementation details.";
  
  const testAnswers = [
    {
      name: "Poor/Incorrect",
      text: "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question."
    },
    {
      name: "Very Basic", 
      text: "OOP is programming. It has objects. Objects have data. That's all I know."
    },
    {
      name: "Basic",
      text: "Object-Oriented Programming is a way to write code using objects. Objects contain data and methods. It helps organize code better."
    },
    {
      name: "Good",
      text: "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. It includes concepts like classes, objects, inheritance, and polymorphism."
    },
    {
      name: "Very Good",
      text: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The main principles include encapsulation, inheritance, and polymorphism. Encapsulation bundles data and methods, inheritance allows code reuse, and polymorphism enables flexibility."
    },
    {
      name: "Excellent",
      text: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods together, inheritance allows classes to inherit from other classes, polymorphism enables different objects to respond to the same method call, and abstraction hides complex implementation details."
    }
  ];
  
  console.log('🔍 Debugging Essay Scoring Layers');
  console.log('=' .repeat(60));
  
  for (const testAnswer of testAnswers) {
    console.log(`\n📝 Testing: ${testAnswer.name}`);
    console.log(`Answer: ${testAnswer.text.substring(0, 100)}...`);
    
    try {
      // Test individual layers
      const gibberishScore = essayScoringService.detectGibberish(testAnswer.text);
      const offTopicScore = essayScoringService.detectCompletelyOffTopic(testAnswer.text, correctAnswer);
      
      console.log(`- Gibberish Score: ${gibberishScore.toFixed(3)}`);
      console.log(`- Off-Topic Score: ${offTopicScore.toFixed(3)}`);
      
      // Test full scoring
      const result = await essayScoringService.scoreEssay(testAnswer.text, correctAnswer, 15);
      
      console.log(`- Final Score: ${result.totalScore}/${result.maxMarks}`);
      console.log(`- Percentage: ${result.percentage}%`);
      console.log(`- Is Passed: ${result.isPassed}`);
      
      if (result.detailedBreakdown) {
        console.log(`- Content Accuracy: ${result.detailedBreakdown.contentAccuracy?.score || 0}/${result.detailedBreakdown.contentAccuracy?.maxScore || 0}`);
        console.log(`- Semantic Understanding: ${result.detailedBreakdown.semanticUnderstanding?.score || 0}/${result.detailedBreakdown.semanticUnderstanding?.maxScore || 0}`);
        console.log(`- Writing Quality: ${result.detailedBreakdown.writingQuality?.score || 0}/${result.detailedBreakdown.writingQuality?.maxScore || 0}`);
        console.log(`- Critical Thinking: ${result.detailedBreakdown.criticalThinking?.score || 0}/${result.detailedBreakdown.criticalThinking?.maxScore || 0}`);
        console.log(`- Technical Precision: ${result.detailedBreakdown.technicalPrecision?.score || 0}/${result.detailedBreakdown.technicalPrecision?.maxScore || 0}`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${testAnswer.name}:`, error.message);
    }
  }
}

debugEssayLayers(); 