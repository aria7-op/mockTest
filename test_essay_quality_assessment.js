const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:5000/api/v1';
const EXAM_ID = 'cmdyncpow000pi2x0kdykxugt';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

const prisma = new PrismaClient();

async function testEssayQualityAssessment() {
  try {
    console.log('🧪 Testing Essay Quality Assessment (Not Length-Based)...');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }

    const token = loginResponse.data.data.accessToken;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test different quality answers
    const testAnswers = [
      {
        name: "Perfect Answer (Comprehensive)",
        answer: "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.",
        expectedScore: "High (90%+)"
      },
      {
        name: "Good Answer (Concise but Accurate)",
        answer: "OOP organizes code around objects containing data and methods. The four principles are: 1) Encapsulation - bundling data with methods that operate on it, 2) Inheritance - creating new classes from existing ones, 3) Polymorphism - allowing objects to take multiple forms, 4) Abstraction - hiding complex details. Example: A Car class encapsulates engine data, inherits from Vehicle, uses polymorphism for different car types, and abstracts engine complexity.",
        expectedScore: "Medium-High (70-85%)"
      },
      {
        name: "Basic Answer (Correct but Simple)",
        answer: "OOP has four principles: encapsulation, inheritance, polymorphism, and abstraction. Objects contain data and methods. Inheritance lets classes share properties. Polymorphism allows different forms. Abstraction hides complexity.",
        expectedScore: "Medium (50-70%)"
      },
      {
        name: "Weak Answer (Vague)",
        answer: "OOP is programming with objects. It has four principles. Objects contain data. Inheritance shares properties. Polymorphism allows different forms. Abstraction hides details.",
        expectedScore: "Low (30-50%)"
      },
      {
        name: "Off-Topic Answer (Wrong Subject)",
        answer: "HTML is used for web pages. CSS makes them look good. JavaScript adds interactivity. Websites have buttons and forms. Programming is writing code for computers.",
        expectedScore: "Very Low (15-30%)"
      }
    ];

    for (const testCase of testAnswers) {
      console.log(`\n📝 Testing: ${testCase.name}`);
      console.log(`   Expected: ${testCase.expectedScore}`);
      console.log(`   Answer Length: ${testCase.answer.length} characters`);
      
      // Start exam attempt
      const startResponse = await axios.post(`${BASE_URL}/exams/${EXAM_ID}/start`, {}, { headers });
      
      if (!startResponse.data.success) {
        console.log(`   ❌ Failed to start exam: ${startResponse.data.message}`);
        continue;
      }

      const attemptId = startResponse.data.data.attempt.id;
      const questions = startResponse.data.data.questions;
      
      // Submit with this test answer
      const responses = questions.map(question => ({
        questionId: question.id,
        selectedOptions: [],
        essayAnswer: testCase.answer,
        timeSpent: 120
      }));

      const submitResponse = await axios.post(`${BASE_URL}/exams/attempts/${attemptId}/complete`, {
        responses: responses
      }, { headers });

      if (submitResponse.data.success) {
        const result = submitResponse.data.data;
        console.log(`   ✅ Score: ${result.attempt.obtainedMarks}/${result.attempt.totalMarks} (${result.attempt.percentage}%)`);
        console.log(`   📊 Grade: ${result.results?.grade || 'N/A'}`);
        console.log(`   🎯 Passed: ${result.attempt.isPassed}`);
        
        // Check if score matches expectation
        const percentage = result.attempt.percentage;
        let assessment = "";
        if (percentage >= 90) assessment = "✅ Excellent - High quality answer";
        else if (percentage >= 70) assessment = "✅ Good - Quality answer";
        else if (percentage >= 50) assessment = "⚠️ Basic - Simple but correct";
        else if (percentage >= 30) assessment = "❌ Weak - Vague answer";
        else assessment = "❌ Poor - Off-topic or incorrect";
        
        console.log(`   📈 Assessment: ${assessment}`);
      } else {
        console.log(`   ❌ Failed to submit: ${submitResponse.data.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEssayQualityAssessment(); 