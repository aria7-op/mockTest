const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port

async function testAccountingTableQuestion() {
  try {
    console.log('🧪 Testing ACCOUNTING_TABLE question creation...');
    
    const questionData = {
      text: "Summary reports from Jhappi Co's general ledger for the year ended 31 March 20X9 are as follows. Complete the missing values in the trade receivables general ledger account.",
      examCategoryId: "cat_001", // You may need to adjust this to an existing category ID
      type: "ACCOUNTING_TABLE",
      difficulty: "HARD",
      marks: 10,
      timeLimit: 120,
      remark: "This accounting table question tests understanding of general ledger accounts and double-entry bookkeeping principles.",
      tableData: `Trade receivables general ledger account
Description | Dr | Cr
Opening balance | 32,400 | 
Sales |  | 104,500
Sales returns | 8,200 | 
Bank |  | 118,000
Financial position c/fwd | 10,700 | 
Total | 136,900 | 136,900`,
      options: [
        { text: "The missing Dr value for Sales is 0", isCorrect: true },
        { text: "The missing Cr value for Opening balance is 0", isCorrect: true },
        { text: "The missing Dr value for Bank is 118,000", isCorrect: false },
        { text: "The missing Cr value for Sales returns is 8,200", isCorrect: false }
      ]
    };

    console.log('📋 Question data:', JSON.stringify(questionData, null, 2));
    
    // Note: This would require authentication in a real scenario
    // For testing, you might need to set up a test user or use a test endpoint
    console.log('⚠️  Note: This test requires authentication. You may need to:');
    console.log('   1. Set up a test user account');
    console.log('   2. Get an authentication token');
    console.log('   3. Include the token in the request headers');
    
    // Example of how the request would look:
    /*
    const response = await axios.post(`${BASE_URL}/admin/questions`, questionData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Question created successfully:', response.data);
    */
    
    console.log('✅ Test script completed. Check the console for details.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAccountingTableQuestion(); 