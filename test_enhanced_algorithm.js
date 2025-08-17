const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function testEnhancedAlgorithm() {
  try {
    console.log('🧠 Testing Enhanced Essay Scoring Algorithm');
    
    // Login as student
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    // Find an exam with essay questions
    const examsResponse = await axios.get(`${BASE_URL}/exams`, { headers: studentHeaders });
    const exam = examsResponse.data.data.find(e => e.id);
    
    if (!exam) {
      console.log('❌ No exams found');
      return;
    }
    
    console.log(`📝 Using exam: ${exam.title}`);
    
    // Test different answer qualities
    const testAnswers = {
      'Completely Wrong': "I don't know what programming is. Cars are vehicles that move on roads. Trees grow in forests. This has nothing to do with computers.",
      'Very Basic': "OOP is programming with objects. It has four principles. That's all I know about it.",
      'Basic': "Object-Oriented Programming uses objects to organize code. It has four principles: encapsulation, inheritance, polymorphism, and abstraction.",
      'Good': "Object-Oriented Programming is a programming paradigm that organizes software design around objects. The four main principles are encapsulation, inheritance, polymorphism, and abstraction.",
      'Very Good': "Object-Oriented Programming is a programming paradigm based on objects that contain data and code. The four principles are encapsulation, inheritance, polymorphism, and abstraction, which promote code reusability and maintainability.",
      'Excellent': "Object-Oriented Programming is a programming paradigm based on objects that contain data and code. The four principles are encapsulation, inheritance, polymorphism, and abstraction, which promote code reusability, maintainability, and provide a natural way to model real-world entities."
    };

    console.log('\n🔍 Testing Enhanced Algorithm Results:');
    console.log('================================================================================');
    console.log('Quality Level       | Expected Score | Algorithm Score | Accuracy');
    console.log('================================================================================');

    for (const [quality, answer] of Object.entries(testAnswers)) {
      try {
        // Start a fresh attempt
        const startResponse = await axios.post(`${BASE_URL}/exams/${exam.id}/start`, {}, { headers: studentHeaders });
        
        if (startResponse.data.success) {
          const attemptId = startResponse.data.data.attempt.id;
          const questions = startResponse.data.data.questions;
          
          if (questions.length === 0) {
            console.log(`${quality.padEnd(18)} | No questions in exam`);
            continue;
          }
          
          // Submit the test answer
          const responses = questions.map(question => ({
            questionId: question.id,
            selectedOptions: [],
            essayAnswer: answer,
            timeSpent: 60
          }));
          
          const completeResponse = await axios.post(
            `${BASE_URL}/exams/attempts/${attemptId}/complete`,
            { responses },
            { headers: studentHeaders }
          );
          
          if (completeResponse.data.success) {
            const score = completeResponse.data.data.results.score;
            const percentage = completeResponse.data.data.results.percentage;
            
            // Determine expected score based on quality
            let expectedScore;
            switch (quality) {
              case 'Completely Wrong': expectedScore = 0; break;
              case 'Very Basic': expectedScore = 2; break;
              case 'Basic': expectedScore = 4; break;
              case 'Good': expectedScore = 6; break;
              case 'Very Good': expectedScore = 8; break;
              case 'Excellent': expectedScore = 10; break;
              default: expectedScore = 5;
            }
            
            const accuracy = Math.abs(score - expectedScore) <= 2 ? '✅' : '❌';
            
            console.log(`${quality.padEnd(18)} | ${expectedScore.toString().padStart(13)} | ${score.toFixed(1).padStart(14)} | ${accuracy}`);
            
            // Show detailed breakdown for excellent answer
            if (quality === 'Excellent') {
              console.log('\n📊 Detailed Breakdown for Excellent Answer:');
              console.log('- Score:', score.toFixed(1));
              console.log('- Percentage:', percentage.toFixed(1) + '%');
              console.log('- Grade:', completeResponse.data.data.results.grade);
              console.log('- Accuracy:', completeResponse.data.data.results.accuracy + '%');
            }
          } else {
            console.log(`${quality.padEnd(18)} | Error: ${completeResponse.data.error?.message || 'Unknown error'}`);
          }
        } else {
          console.log(`${quality.padEnd(18)} | Error: Could not start exam attempt`);
        }
      } catch (error) {
        console.log(`${quality.padEnd(18)} | Error: ${error.message}`);
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

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEnhancedAlgorithm(); 