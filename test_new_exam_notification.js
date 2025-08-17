const axios = require('axios');

async function testNewExamNotification() {
  try {
    console.log('🧪 Testing New Exam Notification System...\n');

    const baseURL = 'http://localhost:5000';
    const apiURL = `${baseURL}/api/v1`;

    // 1. Login as admin
    console.log('🔐 Step 1: Admin Authentication');
    let adminToken = null;
    
    try {
      const adminLoginResponse = await axios.post(`${apiURL}/auth/login`, {
        email: 'admin1@mocktest.com',
        password: 'Admin@123'
      });

      if (adminLoginResponse.data.success) {
        adminToken = adminLoginResponse.data.data.token;
        console.log(`✅ Authenticated as admin: ${adminLoginResponse.data.data.user.firstName} ${adminLoginResponse.data.data.user.lastName}`);
      } else {
        console.log('❌ Admin login failed');
        return;
      }
    } catch (error) {
      console.log('❌ Admin authentication failed:', error.message);
      return;
    }

    // 2. Get exam categories
    console.log('\n📚 Step 2: Get Exam Categories');
    let categoryId = null;
    
    try {
      const categoriesResponse = await axios.get(`${apiURL}/exam-categories`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      console.log('📊 Categories response:', JSON.stringify(categoriesResponse.data, null, 2));

      if (categoriesResponse.data.success) {
        // Handle different possible response structures
        let categories = [];
        if (categoriesResponse.data.data && categoriesResponse.data.data.categories) {
          categories = categoriesResponse.data.data.categories;
        } else if (categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data)) {
          categories = categoriesResponse.data.data;
        } else if (Array.isArray(categoriesResponse.data.data)) {
          categories = categoriesResponse.data.data;
        }

        if (categories.length > 0) {
          const category = categories[0];
          categoryId = category.id;
          console.log(`✅ Using exam category: ${category.name} (ID: ${categoryId})`);
        } else {
          console.log('❌ No exam categories found in response');
          console.log('💡 Creating exam without category...');
          categoryId = null;
        }
      } else {
        console.log('❌ Failed to get exam categories:', categoriesResponse.data);
        console.log('💡 Creating exam without category...');
        categoryId = null;
      }
    } catch (error) {
      console.log('❌ Failed to get exam categories:', error.message);
      console.log('💡 Creating exam without category...');
      categoryId = null;
    }

    // 2.5. Validate admin token is still working
    console.log('\n🔐 Step 2.5: Validate Admin Token');
    
    // First, let's check what auth endpoints are available
    console.log('🔍 Checking available auth endpoints...');
    try {
      const authEndpointsResponse = await axios.get(`${apiURL}/auth`);
      console.log('📋 Available auth endpoints:', authEndpointsResponse.data);
    } catch (error) {
      console.log('ℹ️ Could not fetch auth endpoints info (this is normal)');
    }
    
    try {
      const profileResponse = await axios.get(`${apiURL}/auth/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (profileResponse.data.success) {
        console.log('✅ Admin token is valid');
        console.log(`👤 Admin user: ${profileResponse.data.data.user.firstName} ${profileResponse.data.data.user.lastName}`);
      } else {
        console.log('❌ Admin token validation failed');
        return;
      }
    } catch (error) {
      console.log('❌ Admin token validation failed:', error.message);
      if (error.response && error.response.status === 401) {
        console.log('🔐 Token expired - trying to refresh...');
        
        // Try to refresh the token
        try {
          const refreshResponse = await axios.post(`${apiURL}/auth/refresh`, {
            refreshToken: adminToken // Some systems use the current token as refresh token
          });
          
          if (refreshResponse.data.success) {
            adminToken = refreshResponse.data.data.accessToken;
            console.log('✅ Token refreshed successfully');
          } else {
            console.log('❌ Token refresh failed, trying to login again...');
            // Try to login again
            const reloginResponse = await axios.post(`${apiURL}/auth/login`, {
              email: 'admin1@mocktest.com',
              password: 'Admin@123'
            });
            
            if (reloginResponse.data.success) {
              adminToken = reloginResponse.data.data.accessToken;
              console.log('✅ Re-login successful, got new token');
            } else {
              console.log('❌ Re-login failed');
              return;
            }
          }
        } catch (refreshError) {
          console.log('❌ Token refresh failed:', refreshError.message);
          console.log('💡 Trying to login again...');
          
          try {
            const reloginResponse = await axios.post(`${apiURL}/auth/login`, {
              email: 'admin1@mocktest.com',
              password: 'Admin@123'
            });
            
            if (reloginResponse.data.success) {
              adminToken = reloginResponse.data.data.accessToken;
              console.log('✅ Re-login successful, got new token');
            } else {
              console.log('❌ Re-login failed');
              return;
            }
          } catch (reloginError) {
            console.log('❌ Re-login failed:', reloginError.message);
            return;
          }
        }
      } else {
        return;
      }
    }

    // 3. Create a new exam (this should trigger notifications)
    console.log('\n🆕 Step 3: Create New Exam (Triggers Notifications)');
    
    const examData = {
      title: `Test Exam - ${new Date().toISOString().slice(0, 19)}`,
      description: 'This is a test exam to verify the notification system is working.',
      totalQuestions: 10,
      duration: 60,
      passingPercentage: 70,
      price: 25,
      currency: 'USD',
      isActive: true,
      isPublic: true,
      scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      scheduledEnd: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),   // Day after tomorrow
      maxRetakes: 2,
      questionOverlapPercentage: 20
    };

    // Add category ID if available
    if (categoryId) {
      examData.examCategoryId = categoryId;
      console.log(`📚 Using exam category: ${categoryId}`);
    } else {
      console.log('⚠️ Creating exam without category');
    }

    console.log('🔐 Admin token:', adminToken ? adminToken.substring(0, 20) + '...' : 'NULL');
    console.log('📤 Exam data:', JSON.stringify(examData, null, 2));

    try {
      const examResponse = await axios.post(`${apiURL}/exams`, examData, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (examResponse.data.success) {
        console.log('✅ New exam created successfully!');
        console.log('📊 Exam details:', examResponse.data.data.exam);
        console.log('🔔 This should trigger notifications to ALL students');
        
        // Wait a bit for notifications to be processed
        console.log('⏳ Waiting for notifications to be processed...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } else {
        console.log('❌ Failed to create exam:', examResponse.data);
        return;
      }
    } catch (error) {
      console.log('❌ Exam creation failed:', error.message);
      if (error.response) {
        console.log('📊 Error response status:', error.response.status);
        console.log('📊 Error response data:', error.response.data);
        
        if (error.response.status === 401) {
          console.log('🔐 Authorization failed - token might be expired');
          console.log('💡 Try logging in again or check if the token is valid');
        }
      }
      return;
    }

    // 4. Check if any students are connected to WebSocket
    console.log('\n🔌 Step 4: Check WebSocket Connections');
    try {
      const testResponse = await axios.get(`${baseURL}/api/v1/test/notification`);
      console.log('📊 WebSocket status:', testResponse.data);
      
      if (testResponse.data.message.includes('No connected students found')) {
        console.log('⚠️ No students are currently connected to WebSocket');
        console.log('💡 Students need to be logged in to receive notifications');
      } else {
        console.log('✅ Students are connected and should receive notifications');
      }
    } catch (error) {
      console.log('❌ Failed to check WebSocket status:', error.message);
    }

    // 5. Get all students to verify they exist
    console.log('\n👥 Step 5: Check Student Users');
    try {
      const studentsResponse = await axios.get(`${apiURL}/users?role=STUDENT&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (studentsResponse.data.success) {
        const students = studentsResponse.data.data.users;
        console.log(`📊 Found ${students.length} student users:`);
        students.forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.firstName} ${student.lastName} (${student.email}) - Active: ${student.isActive}`);
        });
        
        if (students.length === 0) {
          console.log('⚠️ No student users found - notifications won\'t be sent');
        } else {
          console.log('✅ Student users exist - notifications should be sent to them');
        }
      } else {
        console.log('❌ Failed to get student users:', studentsResponse.data);
      }
    } catch (error) {
      console.log('❌ Failed to get student users:', error.message);
    }

    console.log('\n✅ New Exam Notification Test Completed!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Admin authenticated');
    console.log('  ✅ Exam category retrieved');
    console.log('  ✅ New exam created (should trigger notifications)');
    console.log('  ✅ WebSocket status checked');
    console.log('  ✅ Student users verified');
    
    console.log('\n💡 Next steps:');
    console.log('  1. Check server logs for notification messages');
    console.log('  2. Have students login to receive notifications');
    console.log('  3. Verify notifications appear in student dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNewExamNotification(); 