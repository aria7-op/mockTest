const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
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

// Test answers
const excellentAnswer = `Object-Oriented Programming (OOP) is a programming paradigm that organizes code into objects that contain both data and code. The four main principles are:

1. Encapsulation: This bundles data and methods that operate on that data within a single unit called a class. For example, a BankAccount class might have private balance data and public deposit/withdraw methods that control access to the balance.

2. Inheritance: This allows new classes to be built upon existing classes, inheriting their properties and methods. For instance, an Animal class could have Dog and Cat subclasses that inherit common properties like name and age.

3. Polymorphism: This enables objects to be treated as instances of their parent class while maintaining their own unique behavior. Different animals can make different sounds through the same method call - a dog barks while a cat meows.

4. Abstraction: This hides complex implementation details and shows only necessary features. A car's steering wheel provides a simple interface that hides the complex steering mechanism underneath.`;

const poorAnswer = `OOP is programming with objects. It has principles like encapsulation and inheritance.`;

class StepByStepTester {
  constructor() {
    this.questionId = null;
    this.examId = null;
    this.bookingId = null;
    this.attemptId = null;
  }

  async runTest() {
    console.log('🔧 Step-by-Step Essay Scoring Test');
    console.log('===================================\n');

    try {
      // Step 1: Get admin token (you'll need to provide this)
      console.log('📋 Step 1: Please provide admin token from admin login');
      console.log('   Go to admin login and copy the token\n');
      
      // Step 2: Get student token (you'll need to provide this)
      console.log('📋 Step 2: Please provide student token from student login');
      console.log('   Go to student login and copy the token\n');

      // Step 3: Create question
      await this.createQuestion();

      // Step 4: Create exam
      await this.createExam();

      // Step 5: Book exam
      await this.bookExam();

      // Step 6: Start exam
      await this.startExam();

      // Step 7: Submit excellent answer
      await this.submitExcellentAnswer();

      // Step 8: Submit poor answer
      await this.submitPoorAnswer();

      console.log('\n✅ Test completed! Check the results above.\n');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async createQuestion() {
    console.log('📝 Step 3: Creating essay question...');
    console.log('   Question text: Explain the concept of Object-Oriented Programming...');
    
    // You'll need to manually create this question in the admin panel
    console.log('   Please create this question manually in the admin panel:');
    console.log('   - Go to Admin > Questions > Add Question');
    console.log('   - Type: ESSAY');
    console.log('   - Text: "Explain the concept of Object-Oriented Programming and its four main principles. Provide examples for each principle."');
    console.log('   - Category: Use the category ID: ' + CATEGORY_ID);
    console.log('   - Marks: 10');
    console.log('   - Add correct answer in the options section\n');
    
    console.log('   After creating, please provide the question ID:');
    // In a real scenario, you would get this from the API response
    console.log('   Question ID: (copy from admin panel)\n');
  }

  async createExam() {
    console.log('📚 Step 4: Creating exam...');
    console.log('   Please create this exam manually in the admin panel:');
    console.log('   - Go to Admin > Exams > Add Exam');
    console.log('   - Title: "Essay Scoring Test"');
    console.log('   - Category: Use the category ID: ' + CATEGORY_ID);
    console.log('   - Duration: 30 minutes');
    console.log('   - Total Marks: 10');
    console.log('   - Passing Marks: 6');
    console.log('   - Total Questions: 1');
    console.log('   - Add the essay question you created\n');
    
    console.log('   After creating, please provide the exam ID:');
    console.log('   Exam ID: (copy from admin panel)\n');
  }

  async bookExam() {
    console.log('📅 Step 5: Booking exam...');
    console.log('   Please book the exam manually as a student:');
    console.log('   - Go to Student > Available Tests');
    console.log('   - Find "Essay Scoring Test"');
    console.log('   - Click "Book Test"');
    console.log('   - Schedule it for now or 5 minutes from now\n');
    
    console.log('   After booking, please provide the booking ID:');
    console.log('   Booking ID: (copy from student panel)\n');
  }

  async startExam() {
    console.log('🎯 Step 6: Starting exam...');
    console.log('   Please start the exam manually as a student:');
    console.log('   - Go to Student > Available Tests');
    console.log('   - Find "Essay Scoring Test"');
    console.log('   - Click "Start Test"\n');
    
    console.log('   After starting, please provide the attempt ID:');
    console.log('   Attempt ID: (copy from exam interface)\n');
  }

  async submitExcellentAnswer() {
    console.log('✍️ Step 7: Submitting excellent answer...');
    console.log('   In the exam interface, submit this excellent answer:');
    console.log('   ===================================================');
    console.log(excellentAnswer);
    console.log('   ===================================================\n');
    
    console.log('   Expected results for excellent answer:');
    console.log('   - Score: 8-10/10 (80-100%)');
    console.log('   - High keyword coverage');
    console.log('   - High semantic similarity');
    console.log('   - Good structure and coherence\n');
  }

  async submitPoorAnswer() {
    console.log('✍️ Step 8: Submitting poor answer...');
    console.log('   In the exam interface, submit this poor answer:');
    console.log('   ===================================================');
    console.log(poorAnswer);
    console.log('   ===================================================\n');
    
    console.log('   Expected results for poor answer:');
    console.log('   - Score: 2-4/10 (20-40%)');
    console.log('   - Low keyword coverage');
    console.log('   - Low semantic similarity');
    console.log('   - Poor structure and coherence\n');
  }

  // Helper method to test with actual API calls (if you have tokens)
  async testWithAPI(adminToken, studentToken) {
    console.log('🔧 Testing with API calls...\n');
    
    const adminHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };
    
    const studentHeaders = {
      'Authorization': `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Create question
      console.log('📝 Creating question via API...');
      const questionResponse = await axios.post(
        `${BASE_URL}/admin/questions`,
        testEssayQuestion,
        { headers: adminHeaders }
      );
      
      if (questionResponse.data.success) {
        this.questionId = questionResponse.data.data.question.id;
        console.log(`✅ Created question: ${this.questionId}`);
      }

      // Create exam
      console.log('📚 Creating exam via API...');
      const examResponse = await axios.post(
        `${BASE_URL}/admin/exams`,
        testExam,
        { headers: adminHeaders }
      );
      
      if (examResponse.data.success) {
        this.examId = examResponse.data.data.exam.id;
        console.log(`✅ Created exam: ${this.examId}`);
      }

      // Book exam
      console.log('📅 Booking exam via API...');
      const bookingResponse = await axios.post(
        `${BASE_URL}/bookings`,
        {
          examId: this.examId,
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          notes: 'Test booking for essay scoring'
        },
        { headers: studentHeaders }
      );
      
      if (bookingResponse.data.success) {
        this.bookingId = bookingResponse.data.data.booking.id;
        console.log(`✅ Booked exam: ${this.bookingId}`);
      }

      // Start exam
      console.log('🎯 Starting exam via API...');
      const startResponse = await axios.post(
        `${BASE_URL}/exams/${this.examId}/start`,
        {},
        { headers: studentHeaders }
      );
      
      if (startResponse.data.success) {
        this.attemptId = startResponse.data.data.attempt.id;
        console.log(`✅ Started exam: ${this.attemptId}`);
      }

      // Submit excellent answer
      console.log('✍️ Submitting excellent answer...');
      const excellentResponse = await axios.post(
        `${BASE_URL}/exams/${this.attemptId}/questions/${this.questionId}/submit`,
        {
          questionId: this.questionId,
          essayAnswer: excellentAnswer,
          timeSpent: 300
        },
        { headers: studentHeaders }
      );
      
      if (excellentResponse.data.success) {
        const result = excellentResponse.data.data.answerResult;
        console.log(`✅ Excellent answer results:`);
        console.log(`   Score: ${result.score}/10 (${result.percentage}%)`);
        console.log(`   Feedback: ${result.feedback}`);
      }

      // Submit poor answer
      console.log('✍️ Submitting poor answer...');
      const poorResponse = await axios.post(
        `${BASE_URL}/exams/${this.attemptId}/questions/${this.questionId}/submit`,
        {
          questionId: this.questionId,
          essayAnswer: poorAnswer,
          timeSpent: 60
        },
        { headers: studentHeaders }
      );
      
      if (poorResponse.data.success) {
        const result = poorResponse.data.data.answerResult;
        console.log(`✅ Poor answer results:`);
        console.log(`   Score: ${result.score}/10 (${result.percentage}%)`);
        console.log(`   Feedback: ${result.feedback}`);
      }

    } catch (error) {
      console.error('❌ API test failed:', error.response?.data || error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new StepByStepTester();
  
  console.log('Choose your testing method:');
  console.log('1. Manual testing (follow the steps)');
  console.log('2. API testing (if you have tokens)');
  console.log('3. Exit');
  
  // For now, run manual test
  tester.runTest().catch(console.error);
}

module.exports = StepByStepTester; 