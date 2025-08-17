const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_TOKEN = 'your_admin_token_here'; // You'll need to get this from admin login
const STUDENT_TOKEN = 'your_student_token_here'; // You'll need to get this from student login

// Test data
const testQuestions = JSON.parse(fs.readFileSync('./test_questions.json', 'utf8'));
const categoryId = 'cmdyb4pji0000i2ovlel4fmju';

// API headers
const adminHeaders = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

const studentHeaders = {
  'Authorization': `Bearer ${STUDENT_TOKEN}`,
  'Content-Type': 'application/json'
};

class EssayScoringTester {
  constructor() {
    this.createdQuestions = [];
    this.createdExam = null;
    this.booking = null;
    this.attempt = null;
  }

  async runTest() {
    try {
      console.log('🚀 Starting Essay Scoring System Test...\n');

      // Step 1: Create questions
      await this.createQuestions();

      // Step 2: Create exam
      await this.createExam();

      // Step 3: Book exam for student
      await this.bookExam();

      // Step 4: Start exam attempt
      await this.startExam();

      // Step 5: Submit answers and test scoring
      await this.submitAnswers();

      // Step 6: Complete exam and get results
      await this.completeExam();

      console.log('✅ Test completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async createQuestions() {
    console.log('📝 Creating test questions...');
    
    for (const questionData of testQuestions.questions) {
      try {
        const response = await axios.post(
          `${BASE_URL}/admin/questions`,
          questionData,
          { headers: adminHeaders }
        );

        if (response.data.success) {
          this.createdQuestions.push(response.data.data.question);
          console.log(`✅ Created question: ${questionData.text.substring(0, 50)}...`);
        } else {
          console.error('❌ Failed to create question:', response.data.error);
        }
      } catch (error) {
        console.error('❌ Error creating question:', error.response?.data || error.message);
      }
    }
    
    console.log(`📊 Created ${this.createdQuestions.length} questions\n`);
  }

  async createExam() {
    console.log('📚 Creating test exam...');
    
    const examData = {
      title: 'Advanced Programming Concepts Test',
      description: 'A comprehensive test covering OOP, data structures, and programming fundamentals',
      examCategoryId: categoryId,
      duration: 60, // 60 minutes
      totalMarks: 26, // Sum of all question marks
      passingMarks: 15, // 60% threshold
      price: 0, // Free test
      totalQuestions: 5,
      isActive: true,
      isPublic: true,
      allowRetakes: true,
      maxRetakes: 3,
      showResults: true,
      showAnswers: true,
      randomizeQuestions: false,
      randomizeOptions: false
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/exams`,
        examData,
        { headers: adminHeaders }
      );

      if (response.data.success) {
        this.createdExam = response.data.data.exam;
        console.log(`✅ Created exam: ${this.createdExam.title} (ID: ${this.createdExam.id})\n`);
      } else {
        console.error('❌ Failed to create exam:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error creating exam:', error.response?.data || error.message);
    }
  }

  async bookExam() {
    console.log('📅 Booking exam for student...');
    
    const bookingData = {
      examId: this.createdExam.id,
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      notes: 'Test booking for essay scoring system'
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/bookings`,
        bookingData,
        { headers: studentHeaders }
      );

      if (response.data.success) {
        this.booking = response.data.data.booking;
        console.log(`✅ Booked exam: Booking ID ${this.booking.id}\n`);
      } else {
        console.error('❌ Failed to book exam:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error booking exam:', error.response?.data || error.message);
    }
  }

  async startExam() {
    console.log('🎯 Starting exam attempt...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/exams/${this.createdExam.id}/start`,
        {},
        { headers: studentHeaders }
      );

      if (response.data.success) {
        this.attempt = response.data.data.attempt;
        console.log(`✅ Started exam attempt: ${this.attempt.id}\n`);
      } else {
        console.error('❌ Failed to start exam:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error starting exam:', error.response?.data || error.message);
    }
  }

  async submitAnswers() {
    console.log('✍️ Submitting test answers...');
    
    // Test answers - some good, some mediocre, some poor
    const testAnswers = {
      // Essay 1 - Good answer
      [this.createdQuestions[0].id]: `Object-Oriented Programming (OOP) is a programming paradigm that organizes code into objects that contain both data and code. The four main principles are:

1. Encapsulation: This bundles data and methods that operate on that data within a single unit called a class. For example, a BankAccount class might have private balance data and public deposit/withdraw methods that control access to the balance.

2. Inheritance: This allows new classes to be built upon existing classes, inheriting their properties and methods. For instance, an Animal class could have Dog and Cat subclasses that inherit common properties like name and age.

3. Polymorphism: This enables objects to be treated as instances of their parent class while maintaining their own unique behavior. Different animals can make different sounds through the same method call - a dog barks while a cat meows.

4. Abstraction: This hides complex implementation details and shows only necessary features. A car's steering wheel provides a simple interface that hides the complex steering mechanism underneath.`,

      // Essay 2 - Mediocre answer
      [this.createdQuestions[1].id]: `A stack is LIFO and a queue is FIFO. Stack example: plates. Queue example: people in line.`,

      // Multiple choice - Correct
      [this.createdQuestions[2].id]: [this.createdQuestions[2].options[3].id], // character

      // Short answer - Correct
      [this.createdQuestions[3].id]: 'O(log n)',

      // Fill in the blank - Correct
      [this.createdQuestions[4].id]: ['database', 'rows', 'columns']
    };

    // Submit each answer
    for (const [questionId, answer] of Object.entries(testAnswers)) {
      try {
        const question = this.createdQuestions.find(q => q.id === questionId);
        const isEssay = question.type === 'ESSAY';
        const isShortAnswer = question.type === 'SHORT_ANSWER';
        
        const responseData = {
          questionId,
          timeSpent: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
        };

        if (isEssay || isShortAnswer) {
          responseData.essayAnswer = answer;
        } else {
          responseData.selectedOptions = Array.isArray(answer) ? answer : [answer];
        }

        const response = await axios.post(
          `${BASE_URL}/exams/${this.attempt.id}/questions/${questionId}/submit`,
          responseData,
          { headers: studentHeaders }
        );

        if (response.data.success) {
          const result = response.data.data.answerResult;
          console.log(`✅ Submitted ${question.type} answer:`);
          console.log(`   Score: ${result.score}/${question.marks} (${result.percentage}%)`);
          console.log(`   Feedback: ${result.feedback}`);
          
          if (result.detailedAnalysis) {
            console.log(`   Detailed Analysis:`, JSON.stringify(result.detailedAnalysis, null, 2));
          }
        } else {
          console.error(`❌ Failed to submit answer for question ${questionId}:`, response.data.error);
        }
      } catch (error) {
        console.error(`❌ Error submitting answer for question ${questionId}:`, error.response?.data || error.message);
      }
    }
    
    console.log('');
  }

  async completeExam() {
    console.log('🏁 Completing exam...');
    
    try {
      const response = await axios.post(
        `${BASE_URL}/exams/${this.attempt.id}/complete`,
        {},
        { headers: studentHeaders }
      );

      if (response.data.success) {
        const results = response.data.data.results;
        console.log('🎉 Exam completed successfully!');
        console.log(`📊 Final Results:`);
        console.log(`   Total Score: ${results.totalScore}/${results.maxMarks}`);
        console.log(`   Percentage: ${results.percentage}%`);
        console.log(`   Grade: ${results.grade}`);
        console.log(`   Passed: ${results.passed ? 'Yes' : 'No'}`);
        console.log(`   Correct Answers: ${results.correctAnswers}/${results.totalQuestions}`);
        console.log(`   Time Spent: ${results.totalTimeSpent} seconds`);
        
        if (results.questionBreakdown) {
          console.log('\n📋 Question Breakdown:');
          results.questionBreakdown.forEach((q, index) => {
            console.log(`   Q${index + 1}: ${q.score}/${q.maxMarks} (${q.percentage}%) - ${q.feedback}`);
          });
        }
      } else {
        console.error('❌ Failed to complete exam:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error completing exam:', error.response?.data || error.message);
    }
  }
}

// Run the test
async function main() {
  console.log('🔧 Essay Scoring System Test Script');
  console.log('=====================================\n');
  
  console.log('⚠️  IMPORTANT: Before running this script:');
  console.log('1. Make sure the backend server is running on localhost:5000');
  console.log('2. Update ADMIN_TOKEN and STUDENT_TOKEN with valid tokens');
  console.log('3. Ensure the category ID exists in the database\n');
  
  const tester = new EssayScoringTester();
  await tester.runTest();
}

// Check if running directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EssayScoringTester; 