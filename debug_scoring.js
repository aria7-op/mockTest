// Debug script to understand scoring issues
const EssayScoringService = require('./src/services/essayScoringService');

// Mock logger
global.logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log
};

async function debugScoring() {
  console.log('🔍 Debugging Essay Scoring Algorithm\n');
  
  const essayScoringService = new EssayScoringService();
  
  const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - allowing a class to inherit properties and methods from another class, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features.";
  
  const excellentAnswer = "Object-Oriented Programming (OOP) represents a revolutionary paradigm shift in software development that fundamentally transforms how we conceptualize, design, and implement software systems. Rather than viewing programs as a series of procedural steps, OOP introduces a more intuitive, real-world modeling approach centered around objects - sophisticated entities that encapsulate both state (data) and behavior (methods) within cohesive, well-defined boundaries. This paradigm provides an elegant solution to the complexity challenges inherent in modern software development by offering powerful mechanisms for code organization, reuse, and maintenance. The four fundamental principles of OOP form a comprehensive framework that guides effective software design: 1) Encapsulation - This cornerstone principle establishes the foundation for data protection and controlled access by bundling data and the methods that operate on that data within a single, cohesive unit (class). It implements the principle of information hiding, preventing direct access to an object's internal state and enforcing controlled access through well-defined, carefully designed interfaces. This mechanism not only protects data integrity but also provides a clear contract for how objects can interact, reducing coupling and enhancing maintainability. 2) Inheritance - This powerful mechanism enables the creation of hierarchical class relationships, allowing specialized classes to inherit properties and methods from more general base classes. It promotes extensive code reuse by establishing an 'is-a' relationship between classes, enabling developers to build upon existing functionality while adding specialized features. This principle supports the development of complex, scalable systems by providing a structured approach to code organization and extension. 3) Polymorphism - This sophisticated principle enables objects of different classes to be treated as objects of a common superclass, providing remarkable flexibility in method implementation. It allows the same interface to be used for different underlying forms, making code more adaptable, extensible, and maintainable. Polymorphism supports the development of flexible, robust systems that can easily accommodate new requirements and changes. 4) Abstraction - This essential principle simplifies complex systems by hiding intricate implementation details and exposing only the necessary features to users. It focuses on essential characteristics while concealing unnecessary complexity, making systems more understandable and manageable. Abstraction enables developers to work with high-level concepts without being overwhelmed by low-level implementation details.";
  
  console.log('📝 Testing Excellent Answer...\n');
  
  try {
    const result = await essayScoringService.scoreEssay(
      excellentAnswer, 
      correctAnswer, 
      10
    );
    
    console.log('📊 FULL RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 KEY METRICS:');
    console.log(`- Total Score: ${result.totalScore}`);
    console.log(`- Percentage: ${result.percentage}%`);
    console.log(`- Grade: ${result.grade}`);
    console.log(`- Is Passed: ${result.isPassed}`);
    
    if (result.detailedBreakdown) {
      console.log('\n📋 DETAILED BREAKDOWN:');
      console.log(`- Content Accuracy: ${result.detailedBreakdown.contentAccuracy?.score || 'N/A'}`);
      console.log(`- Semantic Understanding: ${result.detailedBreakdown.semanticUnderstanding?.score || 'N/A'}`);
      console.log(`- Writing Quality: ${result.detailedBreakdown.writingQuality?.score || 'N/A'}`);
      console.log(`- Critical Thinking: ${result.detailedBreakdown.criticalThinking?.score || 'N/A'}`);
      console.log(`- Technical Precision: ${result.detailedBreakdown.technicalPrecision?.score || 'N/A'}`);
      console.log(`- Bonus Points: ${result.detailedBreakdown.bonusPoints || 'N/A'}`);
      console.log(`- Penalties: ${result.detailedBreakdown.penalties || 'N/A'}`);
      console.log(`- Gibberish Penalty: ${result.detailedBreakdown.gibberishPenalty || 'N/A'}`);
      console.log(`- Off Topic Penalty: ${result.detailedBreakdown.offTopicPenalty || 'N/A'}`);
    }
    
    console.log('\n💬 FEEDBACK:');
    console.log(result.feedback || 'No feedback available');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugScoring().catch(console.error); 