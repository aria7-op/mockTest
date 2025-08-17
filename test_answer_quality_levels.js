const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function testAnswerQualityLevels() {
  try {
    console.log('🔍 Testing essay scoring with different answer quality levels');
    
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@example.com',
      password: 'Admin@123'
    });

    const studentToken = studentLoginResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    
    const examId = 'cmdyncpow000pi2x0kdykxugt';
    
    // Start a fresh attempt
    console.log('🚀 Starting fresh exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
    
    if (startResponse.data.success) {
      const questions = startResponse.data.data.questions;
      const attemptId = startResponse.data.data.attempt.id;
      
      console.log(`📝 Fresh attempt started: ${attemptId}`);
      console.log(`📝 Questions: ${questions.length}`);
      
      // Get correct answer from database for the first question
      const question = questions[0];
      console.log(`\n📝 Question: ${(question.text || question.question || '').substring(0, 100)}...`);
      
      const dbQuestion = await prisma.question.findUnique({
        where: { id: question.id },
        include: { options: true }
      });
      
      const correctOption = dbQuestion.options.find(opt => opt.isCorrect);
      const correctAnswer = correctOption ? correctOption.text : "This is a test answer.";
      
      console.log(`📝 Correct answer from DB: ${correctAnswer.substring(0, 100)}...`);
      
      // Generate topic-appropriate answers based on the actual question
      const questionText = question.text || question.question || '';
      const generateTopicAnswers = (questionText, correctAnswer) => {
        const questionLower = questionText.toLowerCase();
        
        // Detect topic and generate appropriate answers
        if (questionLower.includes('photosynthesis') || questionLower.includes('plant')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "Photosynthesis is about plants making food. That's all I know.",
            'Basic': "Photosynthesis is when plants use sunlight to make food. It involves chlorophyll and produces oxygen.",
            'Good': "Photosynthesis is a process where plants convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll. It's important for providing oxygen and food.",
            'Very Good': "Photosynthesis is a fundamental biological process where plants convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll. It's crucial for maintaining oxygen levels and providing energy for the food chain.",
            'Excellent': "Photosynthesis is a complex and essential biological process where plants convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll. It's fundamentally important because it provides oxygen for all living organisms, produces food for the entire food chain, and maintains the carbon cycle in our ecosystem."
          };
        }
        
        if (questionLower.includes('water cycle') || questionLower.includes('water')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "Water cycle is about water moving around. That's all I know.",
            'Basic': "Water cycle involves evaporation, condensation, and precipitation. It's important for water distribution.",
            'Good': "Water cycle is a process where water evaporates, condenses, and precipitates. It's important for distributing freshwater and regulating temperature.",
            'Very Good': "Water cycle is a fundamental natural process where water evaporates, condenses, and precipitates. It's crucial for distributing freshwater globally and regulating Earth's temperature.",
            'Excellent': "Water cycle is a complex and essential natural process where water evaporates, condenses, and precipitates. It's fundamentally important because it distributes freshwater globally, regulates Earth's temperature, and maintains the balance of water on our planet."
          };
        }
        
        if (questionLower.includes('sustainable development') || questionLower.includes('development')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "Sustainable development is about development. It has three pillars. That's all I know.",
            'Basic': "Sustainable development balances economic growth with environmental protection. The three pillars are economic, social, and environmental.",
            'Good': "Sustainable development is a development approach that meets present needs without compromising future generations. The three pillars are economic development, social equity, and environmental protection.",
            'Very Good': "Sustainable development is a comprehensive approach that balances economic growth, social equity, and environmental protection. The three pillars work together to ensure long-term prosperity.",
            'Excellent': "Sustainable development is a holistic development paradigm that integrates economic growth, social equity, and environmental protection to meet present needs while ensuring future generations can meet their own needs."
          };
        }
        
        if (questionLower.includes('oop') || questionLower.includes('object') || questionLower.includes('programming')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "OOP is programming. It has objects. That's all I know.",
            'Basic': "Object-Oriented Programming uses objects to organize code. It has four principles: encapsulation, inheritance, polymorphism, and abstraction.",
            'Good': "Object-Oriented Programming is a programming paradigm that organizes software design around objects. The four main principles are encapsulation, inheritance, polymorphism, and abstraction.",
            'Very Good': "Object-Oriented Programming is a programming paradigm based on objects that contain data and code. The four principles are encapsulation, inheritance, polymorphism, and abstraction, which promote code reusability and maintainability.",
            'Excellent': "Object-Oriented Programming is a programming paradigm based on objects that contain data and code. The four principles are encapsulation, inheritance, polymorphism, and abstraction, which promote code reusability, maintainability, and provide a natural way to model real-world entities."
          };
        }
        
        if (questionLower.includes('stack') || questionLower.includes('queue') || questionLower.includes('data structure')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "Stack and queue are data structures. That's all I know.",
            'Basic': "Stack is LIFO and queue is FIFO. They're different ways to organize data.",
            'Good': "A stack is a Last-In-First-Out (LIFO) data structure where elements are added and removed from the top, while a queue is a First-In-First-Out (FIFO) data structure where elements are added at the rear and removed from the front.",
            'Very Good': "A stack is a Last-In-First-Out (LIFO) data structure where elements are added and removed from the top, while a queue is a First-In-First-Out (FIFO) data structure where elements are added at the rear and removed from the front. Stacks are used for function calls, queues for task scheduling.",
            'Excellent': "A stack is a Last-In-First-Out (LIFO) data structure where elements are added and removed from the top, while a queue is a First-In-First-Out (FIFO) data structure where elements are added at the rear and removed from the front. Stacks are used for function calls and undo operations, queues for task scheduling and print spooling."
          };
        }
        
        // Handle simple questions like "how are youuu..."
        if (questionLower.includes('how are you') || questionLower.includes('how') && questionLower.length < 50) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "I am fine. That's all I can say.",
            'Basic': "I am doing well, thank you for asking. I feel good today.",
            'Good': "I am doing well, thank you for asking. I feel good today and I hope you are also doing fine.",
            'Very Good': "I am doing well, thank you for asking. I feel good today and I hope you are also doing fine. It's nice to be asked about my well-being.",
            'Excellent': "I am doing well, thank you for asking. I feel good today and I hope you are also doing fine. It's nice to be asked about my well-being and I appreciate your concern."
          };
        }
        
        if (questionLower.includes('artificial intelligence') || questionLower.includes('ai')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "AI is about machines being smart. That's all I know.",
            'Basic': "Artificial Intelligence is when machines simulate human intelligence. It's used in automation and healthcare.",
            'Good': "Artificial Intelligence refers to the simulation of human intelligence in machines. It provides benefits like automation, healthcare improvements, and product recommendations.",
            'Very Good': "Artificial Intelligence is the simulation of human intelligence in machines. It provides significant benefits including automation, healthcare advancements, and enhanced product recommendations.",
            'Excellent': "Artificial Intelligence is the simulation of human intelligence in machines, enabling them to perform tasks that typically require human cognition. It provides substantial benefits including automation, healthcare improvements, and enhanced product recommendations."
          };
        }
        
        if (questionLower.includes('weather') || questionLower.includes('climate')) {
          return {
            'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
            'Very Basic': "Weather and climate are about the atmosphere. That's all I know.",
            'Basic': "Weather is short-term conditions and climate is long-term patterns. They're different but related.",
            'Good': "Weather refers to short-term atmospheric conditions like temperature and precipitation, while climate represents long-term weather patterns over decades. Weather changes daily, climate changes slowly.",
            'Very Good': "Weather refers to short-term atmospheric conditions including temperature, humidity, and precipitation, while climate represents long-term weather patterns over decades or centuries. Weather is variable and immediate, climate is stable and predictable.",
            'Excellent': "Weather refers to short-term atmospheric conditions including temperature, humidity, precipitation, and wind patterns, while climate represents long-term weather patterns over decades or centuries. Weather is highly variable and immediate, climate is relatively stable and predictable, providing the foundation for understanding environmental systems."
          };
        }
        
        // Default generic answers
        return {
          'Poor/Incorrect': "I don't know what this is about. Random words: apple, car, tree. This has nothing to do with the question.",
          'Very Basic': "This concept is about this concept. It has some important aspects. That's all I know.",
          'Basic': "This concept involves some processes. It's important for various reasons.",
          'Good': "This concept is a comprehensive concept that involves various processes. It's important because it affects many aspects of our world.",
          'Very Good': "This concept is a fundamental concept that involves various processes. It's crucial because it provides essential functions and maintains balance in the system.",
          'Excellent': "This concept is a complex and essential concept that involves various processes. It's fundamentally important because it provides critical functions, maintains balance, and supports various systems that depend on it."
        };
      };
      
      const answerQualityLevels = generateTopicAnswers(questionText, correctAnswer);
      
      const results = {};
      
      // Test each quality level
      for (const [quality, answer] of Object.entries(answerQualityLevels)) {
        console.log(`\n📝 Testing ${quality} answer...`);
        console.log(`Answer: ${answer.substring(0, 100)}...`);
        
        // Start a new attempt for each test
        const startResponse2 = await axios.post(`${BASE_URL}/exams/${examId}/start`, {}, { headers: studentHeaders });
        const attemptId2 = startResponse2.data.data.attempt.id;
        
        const response = await axios.post(`${BASE_URL}/exams/attempts/${attemptId2}/complete`, {
          responses: [{
            questionId: question.id,
            selectedOptions: [],
            timeSpent: 30,
            essayAnswer: answer
          }]
        }, { headers: studentHeaders });
        
        const result = response.data.data;
        const resultsData = result?.results || result;
        results[quality] = {
          score: resultsData?.score || 0,
          percentage: resultsData?.percentage || 0,
          correctAnswers: resultsData?.correctAnswers || 0,
          wrongAnswers: resultsData?.wrongAnswers || 0,
          isPassed: resultsData?.isPassed || false
        };
        
        console.log(`📊 ${quality} Result:`);
        console.log(`  - Score: ${results[quality].score}`);
        console.log(`  - Percentage: ${results[quality].percentage}%`);
        console.log(`  - Correct: ${results[quality].correctAnswers}`);
        console.log(`  - Wrong: ${results[quality].wrongAnswers}`);
        console.log(`  - Passed: ${results[quality].isPassed}`);
      }
      
      // Summary
      console.log('\n📊 SUMMARY OF ALL QUALITY LEVELS:');
      console.log('='.repeat(80));
      console.log('Quality Level'.padEnd(20) + 'Score'.padEnd(10) + 'Percentage'.padEnd(12) + 'Correct'.padEnd(10) + 'Passed');
      console.log('='.repeat(80));
      
      for (const [quality, result] of Object.entries(results)) {
        console.log(
          quality.padEnd(20) + 
          result.score.toString().padEnd(10) + 
          result.percentage.toString().padEnd(12) + 
          result.correctAnswers.toString().padEnd(10) + 
          result.isPassed.toString()
        );
      }
      
      // Analysis
      console.log('\n📊 ANALYSIS:');
      const scores = Object.values(results).map(r => r.percentage);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const scoreRange = maxScore - minScore;
      
      console.log(`Score range: ${minScore}% - ${maxScore}% (${scoreRange}% difference)`);
      
      if (scoreRange > 30) {
        console.log('✅ Essay scoring is properly distinguishing between different answer qualities!');
      } else if (scoreRange > 15) {
        console.log('⚠️  Essay scoring is partially distinguishing between answer qualities.');
      } else {
        console.log('❌ Essay scoring is not properly distinguishing between answer qualities.');
      }
      
      // Check if scores increase with quality
      const qualityOrder = ['Poor/Incorrect', 'Very Basic', 'Basic', 'Good', 'Very Good', 'Excellent'];
      let isIncreasing = true;
      let prevScore = -1;
      
      for (const quality of qualityOrder) {
        const score = results[quality]?.percentage || 0;
        if (score < prevScore) {
          isIncreasing = false;
          break;
        }
        prevScore = score;
      }
      
      if (isIncreasing) {
        console.log('✅ Scores are increasing with answer quality - excellent!');
      } else {
        console.log('⚠️  Scores are not consistently increasing with answer quality.');
      }
      
    } else {
      console.log(`❌ Failed to start exam: ${startResponse.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAnswerQualityLevels(); 