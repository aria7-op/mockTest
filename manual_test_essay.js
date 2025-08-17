const axios = require('axios');

// Configuration - UPDATE THESE VALUES
const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Get from admin login
const STUDENT_TOKEN = 'YOUR_STUDENT_TOKEN_HERE'; // Get from student login
const CATEGORY_ID = 'cmdyb4pji0000i2ovlel4fmju';

// Test data
const testEssayQuestion = {
  text: "Explain the concept of Object-Oriented Programming and its four main principles. Provide examples for each principle.",
  type: "ESSAY",
  difficulty: "MEDIUM",
  examCategoryId: CATEGORY_ID,
  marks: 10,
  timeLimit: 600,
  options: [
    {
      text: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of objects, which can contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit (class). Example: A BankAccount class with private balance and public deposit/withdraw methods. 2) Inheritance - creating new classes that are built upon existing classes. Example: Animal class with Dog and Cat subclasses inheriting common properties. 3) Polymorphism - allowing objects to be treated as instances of their parent class while maintaining their own unique behavior. Example: Different animals making different sounds through the same method call. 4) Abstraction - hiding complex implementation details and showing only necessary features. Example: A car's steering wheel interface hiding the complex steering mechanism.",
      isCorrect: true
    }
  ],
  explanation: "This question tests understanding of OOP fundamentals and ability to explain complex concepts with examples."
};

const testExam = {
  title: "Essay Scoring Test",
  description: "Test exam for essay scoring system",
  examCategoryId: CATEGORY_ID,
  duration: 30,
  totalMarks: 10,
  passingMarks: 6,
  price: 0,
  totalQuestions: 1,
  isActive: true,
  isPublic: true,
  allowRetakes: true,
  maxRetakes: 3,
  showResults: true,
  showAnswers: true,
  randomizeQuestions: false,
  randomizeOptions: false
};

// Test answers with different quality levels
const testAnswers = {
  excellent: `Object-Oriented Programming (OOP) is a programming paradigm that organizes code into objects that contain both data and code. The four main principles are:

1. Encapsulation: This bundles data and methods that operate on that data within a single unit called a class. For example, a BankAccount class might have private balance data and public deposit/withdraw methods that control access to the balance.

2. Inheritance: This allows new classes to be built upon existing classes, inheriting their properties and methods. For instance, an Animal class could have Dog and Cat subclasses that inherit common properties like name and age.

3. Polymorphism: This enables objects to be treated as instances of their parent class while maintaining their own unique behavior. Different animals can make different sounds through the same method call - a dog barks while a cat meows.

4. Abstraction: This hides complex implementation details and shows only necessary features. A car's steering wheel provides a simple interface that hides the complex steering mechanism underneath.`,

  good: `Object-Oriented Programming is a way of organizing code using objects. The four principles are:

1. Encapsulation: Putting data and methods together in a class. Example: A BankAccount class with balance and methods.

2. Inheritance: Making new classes from existing ones. Example: Animal class with Dog subclass.

3. Polymorphism: Objects can behave differently. Example: Different animals make different sounds.

4. Abstraction: Hiding complex details. Example: Car steering wheel hides the mechanism.`,

  mediocre: `OOP has four principles: encapsulation, inheritance, polymorphism, and abstraction. Encapsulation puts data together. Inheritance makes new classes. Polymorphism lets objects behave differently. Abstraction hides details.`,

  poor: `OOP is programming with objects. It has principles like encapsulation and inheritance.`
};

class ManualEssayTester {
  constructor() {
    this.questionId = null;
    this.examId = null;
    this.attemptId = null;
  }

  async runTest() {
    console.log('🔧 Manual Essay Scoring Test');
    console.log('=============================\n');

    console.log('⚠️  IMPORTANT: Update ADMIN_TOKEN and STUDENT_TOKEN before running!\n');

    try {
      // Step 1: Create question
      await this.createQuestion();

      // Step 2: Create exam
      await this.createExam();

      // Step 3: Book exam
      await this.bookExam();

      // Step 4: Start exam
      await this.startExam();

      // Step 5: Test different answer qualities
      await this.testAnswerQualities();

      console.log('\n✅ Test completed! Check the results above.\n');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async createQuestion() {
    console.log('📝 Step 1: Creating essay question...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/questions`,
        testEssayQuestion,
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.questionId = response.data.data.question.id;
        console.log(`✅ Created question with ID: ${this.questionId}\n`);
      } else {
        throw new Error(`Failed to create question: ${response.data.error?.message}`);
      }
    } catch (error) {
      throw new Error(`Error creating question: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createExam() {
    console.log('📚 Step 2: Creating exam...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/admin/exams`,
        testExam,
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.examId = response.data.data.exam.id;
        console.log(`✅ Created exam with ID: ${this.examId}\n`);
      } else {
        throw new Error(`Failed to create exam: ${response.data.error?.message}`);
      }
    } catch (error) {
      throw new Error(`Error creating exam: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async bookExam() {
    console.log('📅 Step 3: Booking exam...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/bookings`,
        {
          examId: this.examId,
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          notes: 'Test booking for essay scoring'
        },
        {
          headers: {
            'Authorization': `Bearer ${STUDENT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log(`✅ Booked exam with ID: ${response.data.data.booking.id}\n`);
      } else {
        throw new Error(`Failed to book exam: ${response.data.error?.message}`);
      }
    } catch (error) {
      throw new Error(`Error booking exam: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async startExam() {
    console.log('🎯 Step 4: Starting exam...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/exams/${this.examId}/start`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${STUDENT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.attemptId = response.data.data.attempt.id;
        console.log(`✅ Started exam attempt with ID: ${this.attemptId}\n`);
      } else {
        throw new Error(`Failed to start exam: ${response.data.error?.message}`);
      }
    } catch (error) {
      throw new Error(`Error starting exam: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async testAnswerQualities() {
    console.log('✍️ Step 5: Testing different answer qualities...\n');

    for (const [quality, answer] of Object.entries(testAnswers)) {
      console.log(`📝 Testing ${quality.toUpperCase()} answer:`);
      console.log(`Answer preview: ${answer.substring(0, 100)}...\n`);

      try {
        const response = await axios.post(
          `${BASE_URL}/exams/${this.attemptId}/questions/${this.questionId}/submit`,
          {
            questionId: this.questionId,
            essayAnswer: answer,
            timeSpent: Math.floor(Math.random() * 60) + 30
          },
          {
            headers: {
              'Authorization': `Bearer ${STUDENT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          const result = response.data.data.answerResult;
          console.log(`✅ ${quality.toUpperCase()} Answer Results:`);
          console.log(`   Score: ${result.score}/10 (${result.percentage}%)`);
          console.log(`   Passed: ${result.isCorrect ? 'Yes' : 'No'}`);
          console.log(`   Feedback: ${result.feedback}`);
          
          if (result.detailedAnalysis) {
            console.log(`   Detailed Analysis:`);
            console.log(`     - Keyword Analysis: ${result.detailedAnalysis.keywordAnalysis.keywordCoverage.toFixed(1)}% coverage`);
            console.log(`     - Semantic Similarity: ${result.detailedAnalysis.semanticSimilarity.similarity}%`);
            console.log(`     - Content Structure: ${result.detailedAnalysis.contentStructure.sentenceStructure}%`);
            console.log(`     - Language Quality: ${result.detailedAnalysis.languageQuality.grammar}% grammar, ${result.detailedAnalysis.languageQuality.vocabulary}% vocabulary`);
            console.log(`     - Coherence: ${result.detailedAnalysis.coherence.topicConsistency}% topic consistency`);
          }
        } else {
          console.log(`❌ Failed to submit ${quality} answer: ${response.data.error?.message}`);
        }
      } catch (error) {
        console.log(`❌ Error submitting ${quality} answer: ${error.response?.data?.error?.message || error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new ManualEssayTester();
  tester.runTest().catch(console.error);
}

module.exports = ManualEssayTester; 