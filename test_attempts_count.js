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

async function testAttemptsCount() {
  try {
    console.log('🎯 Testing Attempts Count Logic\n');
    console.log('=' .repeat(80));
    
    const studentToken = await getStudentToken();
    console.log('✅ Student authentication successful\n');

    // Step 1: Get available exams and check attempts
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
    console.log(`📊 Max retakes: ${exam.maxRetakes || 1}`);
    console.log(`📊 Current attempts used: ${exam.attemptsInfo?.attemptsUsed || 0}`);
    console.log(`📊 Has booking: ${exam.attemptsInfo?.hasBooking || false}`);
    console.log(`📊 Can take exam: ${exam.attemptsInfo?.canTakeExam ? 'Yes' : 'No'}\n`);

    // Step 2: Check database directly for attempts
    console.log('📝 Step 2: Checking database directly...');
    
    // Get all attempts for this exam and user
    const attemptsResponse = await axios.get(`${BASE_URL}/exams/history`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const attempts = attemptsResponse.data.data.attempts || [];
    const examAttempts = attempts.filter(attempt => attempt.examId === exam.id);
    
    console.log(`📊 Total attempts in database: ${attempts.length}`);
    console.log(`📊 Attempts for this exam: ${examAttempts.length}`);
    
    examAttempts.forEach((attempt, index) => {
      console.log(`📊 Attempt ${index + 1}:`);
      console.log(`   - ID: ${attempt.id}`);
      console.log(`   - Status: ${attempt.status}`);
      console.log(`   - Started: ${attempt.startedAt}`);
      console.log(`   - Completed: ${attempt.completedAt}`);
      console.log(`   - Score: ${attempt.obtainedMarks}/${attempt.totalMarks}`);
      console.log(`   - Percentage: ${attempt.percentage}%`);
    });

    // Step 3: Check if there are any bookings
    console.log('\n📝 Step 3: Checking for bookings...');
    const bookingsResponse = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const bookings = bookingsResponse.data.data.bookings || [];
    const examBookings = bookings.filter(booking => booking.examId === exam.id);
    
    console.log(`📊 Total bookings: ${bookings.length}`);
    console.log(`📊 Bookings for this exam: ${examBookings.length}`);
    
    examBookings.forEach((booking, index) => {
      console.log(`📊 Booking ${index + 1}:`);
      console.log(`   - ID: ${booking.id}`);
      console.log(`   - Status: ${booking.status}`);
      console.log(`   - Attempts used: ${booking.attemptsUsed}`);
      console.log(`   - Attempts allowed: ${booking.attemptsAllowed}`);
    });

    // Step 4: Analyze the logic
    console.log('\n📝 Step 4: Analyzing attempts logic...');
    
    const hasBooking = examBookings.length > 0;
    const bookingAttemptsUsed = hasBooking ? examBookings[0].attemptsUsed : 0;
    const directAttemptsCount = examAttempts.length;
    
    console.log(`📊 Has booking: ${hasBooking}`);
    console.log(`📊 Booking attempts used: ${bookingAttemptsUsed}`);
    console.log(`📊 Direct attempts count: ${directAttemptsCount}`);
    console.log(`📊 Should show attempts used: ${hasBooking ? bookingAttemptsUsed : directAttemptsCount}`);
    console.log(`📊 Frontend shows attempts used: ${exam.attemptsInfo?.attemptsUsed || 0}`);
    
    if ((hasBooking ? bookingAttemptsUsed : directAttemptsCount) !== (exam.attemptsInfo?.attemptsUsed || 0)) {
      console.log('❌ MISMATCH: Frontend shows different attempts count than expected!');
    } else {
      console.log('✅ MATCH: Frontend shows correct attempts count');
    }

    console.log('\n🎉 Attempts count analysis completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAttemptsCount(); 