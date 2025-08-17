const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const EXAM_ID = 'cmdyncpow000pi2x0kdykxugt';
const STUDENT_EMAIL = 'student1@example.com';
const STUDENT_PASSWORD = 'Admin@123';

async function createNewBooking() {
  try {
    console.log('🔐 Logging in as student...');
    
    // Login as student
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }

    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    
    console.log('✅ Login successful');
    console.log(`👤 User ID: ${userId}`);

    // Set up headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Create a new booking
    console.log('\n📋 Creating new booking...');
    const bookingResponse = await axios.post(`${BASE_URL}/bookings`, {
      examId: EXAM_ID,
      scheduledAt: new Date().toISOString(),
      notes: 'New booking for essay test',
      totalAmount: 0,
      currency: 'USD'
    }, { headers });

    if (!bookingResponse.data.success) {
      throw new Error(`Failed to create booking: ${bookingResponse.data.message}`);
    }

    const booking = bookingResponse.data.data;
    console.log(`✅ New booking created: ${booking.id}`);

    // Confirm the booking
    console.log('\n🔧 Confirming booking...');
    await axios.patch(`${BASE_URL}/admin/bookings/${booking.id}/status`, {
      status: 'CONFIRMED'
    }, { headers });
    console.log('✅ Booking confirmed');

    console.log('\n🎉 New booking ready for testing!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the script
createNewBooking(); 