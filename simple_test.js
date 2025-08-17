const { execSync } = require('child_process');

// Test question creation
const testQuestion = {
  text: "Explain Object-Oriented Programming",
  examCategoryId: "cmdyb4pji0000i2ovlel4fmju",
  difficulty: "MEDIUM",
  type: "ESSAY",
  marks: 10,
  timeLimit: 300
};

const command = `curl -s -X POST http://localhost:5000/api/v1/admin/questions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWR3M2E5dnMwMDAwaTJqaWpvN2cwdDR0IiwiaWF0IjoxNzU0MzkyNjA5LCJleHAiOjE3NTQ5OTc0MDl9.W8ddv6nJUZal7xPMvE__8QfLLfj4MUDzUpgpks8QTh4" \\
  -d '${JSON.stringify(testQuestion)}'`;

try {
  const result = execSync(command, { encoding: 'utf8' });
  console.log('Response:', result);
  
  try {
    const parsed = JSON.parse(result);
    console.log('Parsed response:', JSON.stringify(parsed, null, 2));
  } catch (parseError) {
    console.log('Could not parse response as JSON');
  }
} catch (error) {
  console.error('Error:', error.message);
} 