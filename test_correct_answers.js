const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function getStudentToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });
    return response.data.data.accessToken;
  } catch (error) {
    console.error('Student login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCorrectAnswers() {
  try {
    console.log('🎯 Testing Correct Answer Submission\n');
    console.log('=' .repeat(80));
    
    const studentToken = await getStudentToken();
    console.log('✅ Student authentication successful\n');

    // Step 1: Get available exams
    console.log('📝 Step 1: Getting available exams...');
    const examsResponse = await axios.get(`${BASE_URL}/exams/available`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const exams = examsResponse.data.data.exams || [];
    if (exams.length === 0) {
      console.log('❌ No exams available for testing');
      return;
    }

    const exam = exams[0];
    console.log(`✅ Found exam: ${exam.title} (ID: ${exam.id})`);

    // Step 2: Start exam attempt
    console.log('📝 Step 2: Starting exam attempt...');
    const startResponse = await axios.post(`${BASE_URL}/exams/${exam.id}/start`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const attempt = startResponse.data.data.attempt;
    const questions = startResponse.data.data.questions || [];
    console.log(`✅ Exam started - Attempt ID: ${attempt.id}`);
    console.log(`📝 Questions count: ${questions.length}\n`);

    // Step 3: Analyze questions and submit correct answers
    console.log('📝 Step 3: Analyzing questions and submitting correct answers...');
    const responses = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n📝 Question ${i + 1}:`);
      console.log(`   - Type: ${question.type}`);
      console.log(`   - Text: ${question.text.substring(0, 100)}...`);
      console.log(`   - Marks: ${question.marks}`);
      
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') {
        console.log(`   - Options: ${question.options.length}`);
        
        // Find correct options
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        console.log(`   - Correct options: ${correctOptions.length}`);
        
        if (correctOptions.length > 0) {
          const selectedOptions = correctOptions.map(opt => opt.id);
          console.log(`   - Selected correct options: ${selectedOptions}`);
          
          responses.push({
            questionId: question.id,
            selectedOptions,
            timeSpent: 30
          });
        } else {
          console.log(`   - ⚠️ No correct options found!`);
          // Select first option as fallback
          responses.push({
            questionId: question.id,
            selectedOptions: [question.options[0]?.id || ''],
            timeSpent: 30
          });
        }
      } else if (question.type === 'ESSAY') {
        console.log(`   - Essay question detected`);
        // Submit a good essay answer
        const essayAnswer = `Object-Oriented Programming (OOP) is a programming paradigm that organizes code into objects that contain both data and code. The four main principles of OOP are:

1. **Encapsulation**: Bundling data and methods that operate on that data within a single unit (class), hiding internal state and requiring all interaction to be performed through an object's methods.

2. **Inheritance**: The mechanism that allows a class to inherit properties and methods from another class, promoting code reuse and establishing a relationship between parent and child classes.

3. **Polymorphism**: The ability to present the same interface for different underlying forms (data types or classes), allowing objects to be treated as instances of their parent class while maintaining their own unique behavior.

4. **Abstraction**: Hiding complex implementation details and showing only the necessary features of an object, reducing complexity and increasing efficiency.

OOP helps create more maintainable, scalable, and reusable code by modeling real-world entities as objects with their own properties and behaviors.`;
        
        console.log(`   - Submitting comprehensive essay answer`);
        responses.push({
          questionId: question.id,
          essayAnswer,
          timeSpent: 120
        });
      } else {
        console.log(`   - Unknown question type: ${question.type}`);
        // Handle other question types if needed
        responses.push({
          questionId: question.id,
          selectedOptions: [],
          timeSpent: 30
        });
      }
    }

    console.log(`\n📝 Submitting ${responses.length} responses with correct answers...`);

    // Step 4: Complete the exam
    console.log('📝 Step 4: Completing exam...');
    const completeResponse = await axios.post(`${BASE_URL}/exams/attempts/${attempt.id}/complete`, {
      responses
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    console.log('✅ API call successful!');
    console.log(`📊 Response status: ${completeResponse.status}`);

    const result = completeResponse.data.data;
    console.log('\n📊 Exam Results:');
    console.log(`📊 Score: ${result.results.score}/${result.results.totalQuestions}`);
    console.log(`📊 Percentage: ${result.results.percentage.toFixed(1)}%`);
    console.log(`📊 Grade: ${result.results.grade}`);
    console.log(`📊 Passed: ${result.results.isPassed ? 'Yes' : 'No'}`);
    console.log(`📊 Correct answers: ${result.results.correctAnswers}`);
    console.log(`📊 Wrong answers: ${result.results.wrongAnswers}`);
    console.log(`📊 Unanswered: ${result.results.unanswered}`);

    // Step 5: Check individual question responses
    console.log('\n📝 Step 5: Checking individual question responses...');
    const attemptResponse = await axios.get(`${BASE_URL}/exams/attempts/${attempt.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const attemptDetails = attemptResponse.data.data.attempt;
    console.log(`📊 Attempt status: ${attemptDetails.status}`);
    console.log(`📊 Attempt score: ${attemptDetails.obtainedMarks}/${attemptDetails.totalMarks}`);
    console.log(`📊 Attempt percentage: ${attemptDetails.percentage}%`);

    if (attemptDetails.responses) {
      console.log('\n📊 Individual Question Responses:');
      attemptDetails.responses.forEach((response, index) => {
        console.log(`📝 Question ${index + 1}:`);
        console.log(`   - Question ID: ${response.questionId}`);
        console.log(`   - Is Correct: ${response.isCorrect}`);
        console.log(`   - Marks Obtained: ${response.marksObtained}`);
        console.log(`   - Score: ${response.score}`);
        console.log(`   - Percentage: ${response.percentage}%`);
        console.log(`   - Selected Options: ${response.selectedOptions?.join(', ') || 'None'}`);
        if (response.essayAnswer) {
          console.log(`   - Essay Answer: ${response.essayAnswer.substring(0, 100)}...`);
        }
      });
    }

    if (result.results.score === 0) {
      console.log('\n❌ ISSUE DETECTED: Score is 0 despite correct answers!');
      console.log('🔍 This suggests a problem with the answer checking logic.');
    } else {
      console.log('\n✅ SUCCESS: Correct answers are being scored properly!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCorrectAnswers(); 