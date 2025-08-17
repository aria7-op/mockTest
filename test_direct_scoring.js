// Direct test of the enhanced essay scoring algorithm
const EssayScoringService = require('./src/services/essayScoringService');

// Mock logger
global.logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log
};

async function testDirectScoring() {
  console.log('🧠 Testing Enhanced Essay Scoring Algorithm Directly\n');
  
  const essayScoringService = new EssayScoringService();
  
  const question = "Explain the concept of Object-Oriented Programming (OOP) and discuss its four main principles.";
  const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - allowing a class to inherit properties and methods from another class, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features.";
  
  const testAnswers = [
    {
      quality: "Completely Wrong",
      answer: "OOP is about cooking food and making recipes. You put ingredients together and mix them up. The four principles are: salt, pepper, oil, and water. This is how you make good food in the kitchen."
    },
    {
      quality: "Very Basic", 
      answer: "OOP is programming with objects. Objects have data. There are four principles but I don't remember them all. Maybe inheritance and something else."
    },
    {
      quality: "Basic",
      answer: "Object-Oriented Programming is a way to organize code using objects. Objects contain data and functions. The four principles are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation means putting data and functions together. Inheritance means one class can use another class's features."
    },
    {
      quality: "Good",
      answer: "Object-Oriented Programming (OOP) is a programming paradigm that organizes code around objects rather than actions. Objects are instances of classes that contain both data (attributes) and code (methods). The four fundamental principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, providing data hiding and protection. 2) Inheritance - allowing a class to inherit properties and methods from a parent class, promoting code reuse. 3) Polymorphism - the ability to present the same interface for different underlying forms, allowing flexibility in method implementation. 4) Abstraction - hiding complex implementation details and showing only necessary features to the user."
    },
    {
      quality: "Very Good",
      answer: "Object-Oriented Programming (OOP) is a sophisticated programming paradigm that fundamentally changes how we think about and structure code. Instead of focusing on procedures and functions, OOP centers around objects - instances of classes that encapsulate both data and behavior. This approach provides a more intuitive way to model real-world entities and their interactions. The four core principles form the foundation of OOP: 1) Encapsulation - This principle bundles data and the methods that operate on that data within a single unit (class), providing data hiding and protection. It prevents direct access to an object's internal state and enforces controlled access through well-defined interfaces. 2) Inheritance - This powerful mechanism allows a class to inherit properties and methods from a parent class, promoting code reuse and establishing hierarchical relationships. It enables the creation of specialized classes that extend the functionality of more general base classes. 3) Polymorphism - This principle allows objects of different classes to be treated as objects of a common superclass, providing flexibility in method implementation. It enables the same interface to be used for different underlying forms, making code more adaptable and extensible. 4) Abstraction - This principle hides complex implementation details and shows only the necessary features to the user. It simplifies complex systems by focusing on essential characteristics while hiding unnecessary complexity."
    },
    {
      quality: "Excellent",
      answer: "Object-Oriented Programming (OOP) represents a revolutionary paradigm shift in software development that fundamentally transforms how we conceptualize, design, and implement software systems. Rather than viewing programs as a series of procedural steps, OOP introduces a more intuitive, real-world modeling approach centered around objects - sophisticated entities that encapsulate both state (data) and behavior (methods) within cohesive, well-defined boundaries. This paradigm provides an elegant solution to the complexity challenges inherent in modern software development by offering powerful mechanisms for code organization, reuse, and maintenance. The four fundamental principles of OOP form a comprehensive framework that guides effective software design: 1) Encapsulation - This cornerstone principle establishes the foundation for data protection and controlled access by bundling data and the methods that operate on that data within a single, cohesive unit (class). It implements the principle of information hiding, preventing direct access to an object's internal state and enforcing controlled access through well-defined, carefully designed interfaces. This mechanism not only protects data integrity but also provides a clear contract for how objects can interact, reducing coupling and enhancing maintainability. 2) Inheritance - This powerful mechanism enables the creation of hierarchical class relationships, allowing specialized classes to inherit properties and methods from more general base classes. It promotes extensive code reuse by establishing an 'is-a' relationship between classes, enabling developers to build upon existing functionality while adding specialized features. This principle supports the development of complex, scalable systems by providing a structured approach to code organization and extension. 3) Polymorphism - This sophisticated principle enables objects of different classes to be treated as objects of a common superclass, providing remarkable flexibility in method implementation. It allows the same interface to be used for different underlying forms, making code more adaptable, extensible, and maintainable. Polymorphism supports the development of flexible, robust systems that can easily accommodate new requirements and changes. 4) Abstraction - This essential principle simplifies complex systems by hiding intricate implementation details and exposing only the necessary features to users. It focuses on essential characteristics while concealing unnecessary complexity, making systems more understandable and manageable. Abstraction enables developers to work with high-level concepts without being overwhelmed by low-level implementation details."
    }
  ];
  
  console.log(`📝 Question: ${question}`);
  console.log(`📝 Correct Answer: ${correctAnswer.substring(0, 100)}...\n`);
  
  console.log('🔍 Testing Enhanced Algorithm Results:');
  console.log('================================================================================');
  console.log('Quality Level       | Expected Score | Algorithm Score | Accuracy');
  console.log('================================================================================');
  
  for (const testCase of testAnswers) {
    try {
      const result = await essayScoringService.scoreEssay(
        testCase.answer, 
        correctAnswer, 
        10
      );
      
      const score = result.totalScore || result.score || 0;
      const percentage = result.percentage || 0;
      
      // Determine if the score is in the expected range
      let expectedRange = '';
      let isAccurate = false;
      
      switch (testCase.quality) {
        case 'Completely Wrong':
          expectedRange = '0-2';
          isAccurate = score >= 0 && score <= 2;
          break;
        case 'Very Basic':
          expectedRange = '2-4';
          isAccurate = score >= 2 && score <= 4;
          break;
        case 'Basic':
          expectedRange = '4-6';
          isAccurate = score >= 4 && score <= 6;
          break;
        case 'Good':
          expectedRange = '6-8';
          isAccurate = score >= 6 && score <= 8;
          break;
        case 'Very Good':
          expectedRange = '8-10';
          isAccurate = score >= 8 && score <= 10;
          break;
        case 'Excellent':
          expectedRange = '9-10';
          isAccurate = score >= 9 && score <= 10;
          break;
      }
      
      const accuracy = isAccurate ? '✅' : '❌';
      
      console.log(`${testCase.quality.padEnd(17)} | ${expectedRange.padStart(14)} | ${score.toFixed(1).padStart(14)} | ${accuracy}`);
      
      // Show detailed breakdown for Excellent answer
      if (testCase.quality === 'Excellent') {
        console.log(`\n📊 Detailed Breakdown for ${testCase.quality} Answer:`);
        console.log(`- Score: ${score.toFixed(1)}`);
        console.log(`- Percentage: ${percentage.toFixed(1)}%`);
        console.log(`- Feedback: ${result.feedback || 'No feedback available'}`);
        
        if (result.detailedBreakdown) {
          console.log(`- Content Accuracy: ${result.detailedBreakdown.contentAccuracy?.score?.toFixed(1) || 'N/A'}`);
          console.log(`- Semantic Understanding: ${result.detailedBreakdown.semanticUnderstanding?.score?.toFixed(1) || 'N/A'}`);
          console.log(`- Writing Quality: ${result.detailedBreakdown.writingQuality?.score?.toFixed(1) || 'N/A'}`);
          console.log(`- Critical Thinking: ${result.detailedBreakdown.criticalThinking?.score?.toFixed(1) || 'N/A'}`);
          console.log(`- Technical Precision: ${result.detailedBreakdown.technicalPrecision?.score?.toFixed(1) || 'N/A'}`);
        }
      }
      
    } catch (error) {
      console.log(`${testCase.quality.padEnd(17)} | Error: ${error.message}`);
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
}

testDirectScoring().catch(console.error); 