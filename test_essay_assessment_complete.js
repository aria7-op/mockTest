const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@mocktest.com';
const ADMIN_PASSWORD = 'Admin@123';
const CATEGORY_ID = 'cmdyb4pji0000i2ovlel4fmju';

// Test data for essay questions
const essayQuestions = [
  {
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
  },
  {
    text: "What is the difference between a stack and a queue data structure? Provide real-world examples of each.",
    type: "ESSAY",
    difficulty: "EASY",
    examCategoryId: CATEGORY_ID,
    marks: 8,
    timeLimit: 480,
    options: [
      {
        text: "A stack is a LIFO (Last In, First Out) data structure where elements are added and removed from the same end. Real-world example: A stack of plates where you add and remove from the top. A queue is a FIFO (First In, First Out) data structure where elements are added at one end and removed from the other end. Real-world example: A line of people waiting for a movie ticket where the first person in line gets served first. Stacks are used in function call management, undo operations, and browser history. Queues are used in task scheduling, print spooling, and breadth-first search algorithms.",
        isCorrect: true
      }
    ],
    explanation: "This question evaluates understanding of basic data structures and ability to provide practical examples."
  }
];

// Student answers to test different scoring scenarios
const studentAnswers = [
  {
    // Good answer - should score high
    answer: "Object-Oriented Programming is a programming paradigm that uses objects to design applications. The four main principles are: 1) Encapsulation - this means bundling data and methods together in a class. For example, a BankAccount class would have private balance data and public methods like deposit() and withdraw(). 2) Inheritance - this allows new classes to inherit properties from existing classes. For instance, we could have an Animal class and then Dog and Cat classes that inherit from it. 3) Polymorphism - this means objects can be treated as instances of their parent class while having their own behavior. Like different animals making different sounds when we call the same method. 4) Abstraction - this hides complex details and shows only what's necessary. Like a car's steering wheel - you don't need to know how the steering mechanism works inside."
  },
  {
    // Poor answer - should score low
    answer: "OOP is programming with objects. There are four principles but I don't remember them all. Objects can contain data and code. Classes are used to create objects. This is used in many programming languages."
  },
  {
    // Medium answer - should score medium
    answer: "Object-Oriented Programming uses objects to organize code. The main principles include encapsulation which bundles data and methods together. Inheritance allows classes to inherit from other classes. Polymorphism lets objects behave differently. Abstraction hides complexity. Examples include classes in Java and C++."
  }
];

class EssayAssessmentTester {
  constructor() {
    this.adminToken = null;
    this.studentToken = null;
    this.createdQuestions = [];
    this.createdExam = null;
    this.booking = null;
    this.attempt = null;
  }

  async runTest() {
    try {
      console.log(colors.cyan.bold('🚀 Starting Comprehensive Essay Assessment Test...\n'));

      // Step 1: Login as admin
      await this.loginAsAdmin();

      // Step 2: Create essay questions
      await this.createEssayQuestions();

      // Step 3: Create exam
      await this.createExam();

      // Step 4: Test essay scoring directly
      await this.testEssayScoringDirectly();

      // Step 5: Book exam for student
      await this.bookExam();

      // Step 6: Start exam attempt
      await this.startExam();

      // Step 7: Submit different quality answers and test scoring
      await this.submitDifferentAnswers();

      // Step 8: Complete exam and get results
      await this.completeExam();

      console.log(colors.green.bold('\n✅ Comprehensive Essay Assessment Test Completed Successfully!'));
    } catch (error) {
      console.error(colors.red.bold('❌ Test failed:'), error.message);
      if (error.response) {
        console.error(colors.red('Response data:'), error.response.data);
      }
    }
  }

  async loginAsAdmin() {
    console.log(colors.yellow('🔐 Logging in as admin...'));
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (response.data.success) {
        this.adminToken = response.data.data.accessToken;
        console.log(colors.green('✅ Admin login successful'));
        console.log(colors.gray(`   Token: ${this.adminToken.substring(0, 20)}...`));
      } else {
        throw new Error('Admin login failed: ' + response.data.error?.message);
      }
    } catch (error) {
      throw new Error(`Admin login failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createEssayQuestions() {
    console.log(colors.yellow('\n📝 Creating essay questions...'));
    
    for (const questionData of essayQuestions) {
      try {
        const response = await axios.post(
          `${BASE_URL}/admin/questions`,
          questionData,
          { 
            headers: {
              'Authorization': `Bearer ${this.adminToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          this.createdQuestions.push(response.data.data.question);
          console.log(colors.green(`✅ Created essay question: ${questionData.text.substring(0, 60)}...`));
        } else {
          console.error(colors.red('❌ Failed to create question:', response.data.error));
        }
      } catch (error) {
        console.error(colors.red('❌ Error creating question:', error.response?.data?.error?.message || error.message));
      }
    }
    
    console.log(colors.cyan(`📊 Created ${this.createdQuestions.length} essay questions`));
  }

  async createExam() {
    console.log(colors.yellow('\n📚 Creating test exam...'));
    
    const examData = {
      title: 'Advanced Essay Assessment Test',
      description: 'A comprehensive test to evaluate essay scoring algorithms with multiple analysis layers',
      examCategoryId: CATEGORY_ID,
      duration: 120, // 2 hours
      totalMarks: 18, // Sum of essay question marks
      passingMarks: 11, // 60% threshold
      price: 0, // Free test
      totalQuestions: 2,
      isActive: true,
      isPublic: true,
      allowRetakes: true,
      maxRetakes: 3,
      instructions: 'This exam tests your understanding of programming concepts through essay questions. The system will analyze your answers using advanced algorithms including keyword analysis, semantic similarity, content structure, language quality, and coherence.',
      tags: ['essay', 'programming', 'assessment', 'advanced']
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/exams`,
        examData,
        { 
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.createdExam = response.data.data.exam;
        console.log(colors.green(`✅ Created exam: ${this.createdExam.title}`));
        console.log(colors.gray(`   Exam ID: ${this.createdExam.id}`));
      } else {
        throw new Error('Failed to create exam: ' + response.data.error?.message);
      }
    } catch (error) {
      throw new Error(`Exam creation failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Add questions to exam
    console.log(colors.yellow('   Adding questions to exam...'));
    for (const question of this.createdQuestions) {
      try {
        const response = await axios.post(
          `${BASE_URL}/admin/exams/${this.createdExam.id}/questions`,
          { questionId: question.id },
          { 
            headers: {
              'Authorization': `Bearer ${this.adminToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          console.log(colors.green(`   ✅ Added question: ${question.text.substring(0, 40)}...`));
        } else {
          console.error(colors.red(`   ❌ Failed to add question: ${response.data.error?.message}`));
        }
      } catch (error) {
        console.error(colors.red(`   ❌ Error adding question: ${error.response?.data?.error?.message || error.message}`));
      }
    }
  }

  async testEssayScoringDirectly() {
    console.log(colors.yellow('\n🧪 Testing Essay Scoring Service Directly...'));
    
    const EssayScoringService = require('./src/services/essayScoringService');
    const essayScoringService = new EssayScoringService();

    for (let i = 0; i < this.createdQuestions.length; i++) {
      const question = this.createdQuestions[i];
      const correctAnswer = question.options.find(opt => opt.isCorrect)?.text || '';
      
      console.log(colors.cyan(`\n   Testing Question ${i + 1}: ${question.text.substring(0, 50)}...`));
      
      for (let j = 0; j < studentAnswers.length; j++) {
        const studentAnswer = studentAnswers[j];
        const answerQuality = j === 0 ? 'Good' : j === 1 ? 'Poor' : 'Medium';
        
        console.log(colors.gray(`     Testing ${answerQuality} answer...`));
        
        try {
          const result = await essayScoringService.scoreEssay(
            studentAnswer.answer,
            correctAnswer,
            question.marks,
            question
          );

          console.log(colors.green(`       ✅ Score: ${result.totalScore}/${result.maxMarks} (${result.percentage}%)`));
          console.log(colors.gray(`       📊 Breakdown:`));
          console.log(colors.gray(`         - Keywords: ${result.detailedBreakdown.keywordAnalysis.keywordCoverage.toFixed(1)}%`));
          console.log(colors.gray(`         - Semantic: ${result.detailedBreakdown.semanticSimilarity.similarity}%`));
          console.log(colors.gray(`         - Structure: ${result.detailedBreakdown.contentStructure.sentenceStructure}%`));
          console.log(colors.gray(`         - Language: ${result.detailedBreakdown.languageQuality.grammar}%`));
          console.log(colors.gray(`         - Coherence: ${result.detailedBreakdown.coherence.topicConsistency}%`));
          
          if (result.feedback.length > 0) {
            console.log(colors.yellow(`       💡 Feedback: ${result.feedback[0]}`));
          }
        } catch (error) {
          console.error(colors.red(`       ❌ Scoring failed: ${error.message}`));
        }
      }
    }
  }

  async bookExam() {
    console.log(colors.yellow('\n📅 Booking exam for student...'));
    
    // First, let's create a student user or use existing one
    const studentData = {
      email: 'student@test.com',
      password: 'Student@123',
      firstName: 'Test',
      lastName: 'Student',
      role: 'STUDENT'
    };

    try {
      // Try to create student user
      const createResponse = await axios.post(
        `${BASE_URL}/auth/register`,
        studentData
      );

      if (createResponse.data.success) {
        console.log(colors.green('✅ Created test student user'));
      } else {
        console.log(colors.yellow('⚠️  Student user might already exist'));
      }
    } catch (error) {
      console.log(colors.yellow('⚠️  Student user might already exist'));
    }

    // Login as student
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: studentData.email,
        password: studentData.password
      });

      if (loginResponse.data.success) {
        this.studentToken = loginResponse.data.data.accessToken;
        console.log(colors.green('✅ Student login successful'));
      } else {
        throw new Error('Student login failed');
      }
    } catch (error) {
      throw new Error(`Student login failed: ${error.response?.data?.error?.message || error.message}`);
    }

    // Book the exam
    const bookingData = {
      examId: this.createdExam.id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      notes: 'Test booking for essay assessment'
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/bookings`,
        bookingData,
        { 
          headers: {
            'Authorization': `Bearer ${this.studentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.booking = response.data.data.booking;
        console.log(colors.green(`✅ Booked exam: ${this.booking.id}`));
      } else {
        throw new Error('Failed to book exam: ' + response.data.error?.message);
      }
    } catch (error) {
      throw new Error(`Exam booking failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async startExam() {
    console.log(colors.yellow('\n🎯 Starting exam attempt...'));
    
    try {
      const response = await axios.post(
        `${BASE_URL}/exams/${this.createdExam.id}/start`,
        {},
        { 
          headers: {
            'Authorization': `Bearer ${this.studentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.attempt = response.data.data.attempt;
        console.log(colors.green(`✅ Started exam attempt: ${this.attempt.id}`));
        console.log(colors.gray(`   Status: ${this.attempt.status}`));
        console.log(colors.gray(`   Questions: ${this.attempt.questions?.length || 0}`));
      } else {
        throw new Error('Failed to start exam: ' + response.data.error?.message);
      }
    } catch (error) {
      throw new Error(`Exam start failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async submitDifferentAnswers() {
    console.log(colors.yellow('\n📝 Submitting different quality answers...'));
    
    if (!this.attempt || !this.attempt.questions) {
      console.error(colors.red('❌ No questions found in attempt'));
      return;
    }

    for (let i = 0; i < this.attempt.questions.length; i++) {
      const question = this.attempt.questions[i];
      const studentAnswer = studentAnswers[i % studentAnswers.length]; // Cycle through different answers
      const answerQuality = (i % studentAnswers.length) === 0 ? 'Good' : (i % studentAnswers.length) === 1 ? 'Poor' : 'Medium';
      
      console.log(colors.cyan(`   Submitting ${answerQuality} answer for question ${i + 1}...`));
      
      try {
        const response = await axios.post(
          `${BASE_URL}/attempts/${this.attempt.id}/responses`,
          {
            questionId: question.id,
            essayAnswer: studentAnswer.answer,
            timeSpent: 300 // 5 minutes
          },
          { 
            headers: {
              'Authorization': `Bearer ${this.studentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          const result = response.data.data;
          console.log(colors.green(`     ✅ Submitted successfully`));
          console.log(colors.gray(`     📊 Score: ${result.score}/${question.marks}`));
          console.log(colors.gray(`     💬 Feedback: ${result.feedback}`));
          
          if (result.detailedAnalysis) {
            console.log(colors.gray(`     🔍 Detailed Analysis:`));
            console.log(colors.gray(`       - Keywords: ${result.detailedAnalysis.keywordAnalysis?.keywordCoverage?.toFixed(1) || 'N/A'}%`));
            console.log(colors.gray(`       - Semantic: ${result.detailedAnalysis.semanticSimilarity?.similarity || 'N/A'}%`));
            console.log(colors.gray(`       - Structure: ${result.detailedAnalysis.contentStructure?.sentenceStructure || 'N/A'}%`));
          }
        } else {
          console.error(colors.red(`     ❌ Submission failed: ${response.data.error?.message}`));
        }
      } catch (error) {
        console.error(colors.red(`     ❌ Error submitting answer: ${error.response?.data?.error?.message || error.message}`));
      }
    }
  }

  async completeExam() {
    console.log(colors.yellow('\n🏁 Completing exam...'));
    
    try {
      const response = await axios.post(
        `${BASE_URL}/attempts/${this.attempt.id}/complete`,
        {},
        { 
          headers: {
            'Authorization': `Bearer ${this.studentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const results = response.data.data;
        console.log(colors.green(`✅ Exam completed successfully!`));
        console.log(colors.cyan(`📊 Final Results:`));
        console.log(colors.gray(`   Total Score: ${results.totalScore}/${results.maxMarks}`));
        console.log(colors.gray(`   Percentage: ${results.percentage}%`));
        console.log(colors.gray(`   Grade: ${results.grade}`));
        console.log(colors.gray(`   Passed: ${results.isPassed ? 'Yes' : 'No'}`));
        console.log(colors.gray(`   Correct Answers: ${results.correctAnswers}`));
        console.log(colors.gray(`   Wrong Answers: ${results.wrongAnswers}`));
        console.log(colors.gray(`   Time Spent: ${results.totalTimeSpent} seconds`));
        
        if (results.questionScores) {
          console.log(colors.cyan(`\n📝 Question-by-Question Analysis:`));
          results.questionScores.forEach((score, index) => {
            const question = this.attempt.questions[index];
            console.log(colors.gray(`   Q${index + 1}: ${score.score}/${question.marks} (${((score.score/question.marks)*100).toFixed(1)}%)`));
            if (score.feedback) {
              console.log(colors.yellow(`      💡 ${score.feedback}`));
            }
          });
        }
      } else {
        throw new Error('Failed to complete exam: ' + response.data.error?.message);
      }
    } catch (error) {
      throw new Error(`Exam completion failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// Run the test
async function main() {
  console.log(colors.cyan.bold('🧪 ESSAY ASSESSMENT SYSTEM TEST'));
  console.log(colors.gray('Testing advanced essay scoring with multiple analysis layers\n'));
  
  const tester = new EssayAssessmentTester();
  await tester.runTest();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = EssayAssessmentTester; 