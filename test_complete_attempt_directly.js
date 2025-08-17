const examService = require('./src/services/examService');

async function testCompleteAttemptDirectly() {
  try {
    console.log('🔍 Testing completeExamAttempt directly');
    
    const attemptId = 'cmdzm5de10007i2evv1e7zi8q'; // From previous test
    const userId = 'cmdw3a9w30003i2jiq5yeaei0';
    
    const responses = [
      {
        questionId: 'cmdzjd20t000ki2gkjbho9uca',
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features."
      },
      {
        questionId: 'cmdyqh5fe0005i207du7wh5i9',
        selectedOptions: [],
        timeSpent: 30,
        essayAnswer: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features."
      }
    ];
    
    console.log('📝 Calling completeExamAttempt with responses...');
    console.log('📋 Responses:', JSON.stringify(responses, null, 2));
    
    const result = await examService.completeExamAttempt(attemptId, userId, responses);
    
    console.log('\n📊 RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCompleteAttemptDirectly(); 