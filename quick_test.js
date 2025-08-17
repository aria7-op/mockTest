const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const EXAM_ID = 'cmdxemzpq0009i2l47dst2dmf';
const ATTEMPT_ID = 'cmdzgh4db0007i2qbqhs1gyfw'; // From previous run
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function quickTest() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Submit correct answers
    const responses = [
      { questionId: 'cmdxevvhr001vi2sysu6wohik', selectedOptions: ['cmdxevvhr001wi2sy1jy0tlw6'], timeSpent: 30 }, // push()
      { questionId: 'cmdxk4k640059i2mfuxnj3bsj', selectedOptions: ['cmdxk4k64005bi2mf4t2vmyiq'], timeSpent: 45 }, // callback function
      { questionId: 'cmdxk4kb3009hi2mfhgdna528', selectedOptions: ['cmdxk4kb3009ji2mfyi723vki'], timeSpent: 30 }, // JSON.parse
      { questionId: 'cmdxevvi10023i2syn7wwuzk2', selectedOptions: ['cmdxevvi20025i2syqkork7w2'], timeSpent: 45 }, // use strict
      { questionId: 'cmdxk4kbb009pi2mfsn3kolmy', selectedOptions: ['cmdxk4kbb009ri2mfsy0ht9qt'], timeSpent: 30 }, // JSON.stringify vs parse
      { questionId: 'cmdxk4kbl009xi2mf5jsosezh', selectedOptions: ['cmdxk4kbl009zi2mf6mgs4mi5'], timeSpent: 30 }, // Date object
      { questionId: 'cmdxk4k6z005xi2mfdq801wwn', selectedOptions: ['cmdxk4k6z005zi2mfq589kspw'], timeSpent: 60 }, // reduce method
      { questionId: 'cmdxfmv4l007bi2sywygqd56z', selectedOptions: ['cmdxfmv4m007di2sysuauhi4y'], timeSpent: 45 }  // async/await
    ];

    console.log('📤 Submitting exam...');
    const submitResponse = await axios.post(`${BASE_URL}/exams/attempts/${ATTEMPT_ID}/complete`, {
      responses: responses
    }, { headers });

    console.log('📊 Results:', JSON.stringify(submitResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

quickTest(); 