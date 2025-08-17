const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'admin1@mocktest.com',
  password: 'Admin@123'
};

let adminToken = null;

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(data && { data })
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${url} failed:`, error.response?.data || error.message);
    throw error;
  }
};

// Test admin login
const testAdminLogin = async () => {
  console.log('🔐 Testing Admin Login...');
  
  const response = await makeRequest('POST', '/api/v1/auth/login', ADMIN_CREDENTIALS);
  
  if (response.success && response.data.accessToken) {
    adminToken = response.data.accessToken;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed');
    return false;
  }
};

// Check question types in categories
const checkQuestionTypes = async () => {
  console.log('\n📚 Checking Question Types in Categories...');
  
  if (!adminToken) {
    console.log('❌ Admin token not available');
    return;
  }
  
  // Get exam categories
  const categoriesResponse = await makeRequest('GET', '/api/v1/exam-categories', null, adminToken);
  
  if (!categoriesResponse.success || !categoriesResponse.data) {
    console.log('❌ Failed to get exam categories');
    return;
  }
  
  // Check categories with questions
  for (const category of categoriesResponse.data) {
    if (category._count && category._count.questions > 0) {
      console.log(`\n📖 Category: ${category.name} (${category._count.questions} questions)`);
      
      // Get questions from this category
      const questionsResponse = await makeRequest('GET', `/api/v1/questions?examCategoryId=${category.id}&limit=200`, null, adminToken);
      
      if (questionsResponse.success) {
        const questions = questionsResponse.data?.questions || questionsResponse.data || [];
        
        // Group questions by type
        const questionsByType = {};
        questions.forEach(q => {
          questionsByType[q.type] = (questionsByType[q.type] || 0) + 1;
        });
        
        console.log('   Question types:', questionsByType);
        
        // Check if we have variety
        const typeCount = Object.keys(questionsByType).length;
        if (typeCount > 1) {
          console.log(`   ✅ Has ${typeCount} different question types`);
        } else {
          console.log(`   ⚠️  Only has ${typeCount} question type`);
        }
      } else {
        console.log('   ❌ Failed to get questions');
      }
    }
  }
};

// Main execution
const runCheck = async () => {
  try {
    const adminLoginSuccess = await testAdminLogin();
    if (!adminLoginSuccess) {
      console.log('❌ Cannot proceed without admin access');
      return;
    }
    
    await checkQuestionTypes();
    
  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
};

runCheck(); 