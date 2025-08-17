const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDuplicateEmailCheck() {
  try {
    console.log('🔍 Testing Duplicate Email Check Logic...\n');

    // Test 1: Check if the email from your logs exists
    const testEmail = 'dsafsad@dsfdsf.com';
    console.log(`1. Testing email: ${testEmail}`);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log(`✅ User found: ${existingUser.email} (ID: ${existingUser.id})`);
      console.log(`   Created: ${existingUser.createdAt}`);
      console.log(`   Role: ${existingUser.role}`);
    } else {
      console.log(`❌ No user found with email: ${testEmail}`);
    }

    // Test 2: Check case-insensitive search
    console.log('\n2. Testing case-insensitive search...');
    const caseInsensitiveCheck = await prisma.user.findFirst({
      where: {
        email: {
          contains: testEmail,
          mode: 'insensitive'
        }
      }
    });
    
    if (caseInsensitiveCheck) {
      console.log(`✅ Case-insensitive match found: ${caseInsensitiveCheck.email}`);
    } else {
      console.log(`❌ No case-insensitive match found`);
    }

    // Test 3: Check for similar emails
    console.log('\n3. Testing similar email detection...');
    const similarEmails = await prisma.user.findMany({
      where: {
        OR: [
          { email: { equals: testEmail, mode: 'insensitive' } },
          { email: { contains: testEmail, mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true, createdAt: true }
    });
    
    console.log(`Found ${similarEmails.length} similar emails:`);
    similarEmails.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id}) - Created: ${user.createdAt}`);
    });

    // Test 4: Test the exact duplicate check logic
    console.log('\n4. Testing exact duplicate check logic...');
    const normalizedEmail = testEmail.toLowerCase().trim();
    const exactMatch = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (exactMatch) {
      console.log(`✅ Exact match found: ${exactMatch.email}`);
      console.log(`   This means duplicate check should work correctly`);
    } else {
      console.log(`❌ No exact match found`);
      console.log(`   This suggests the duplicate check might have an issue`);
    }

    // Test 5: Check all users with similar patterns
    console.log('\n5. Checking for any potential duplicate patterns...');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Group users by email pattern
    const emailGroups = {};
    allUsers.forEach(user => {
      const emailLower = user.email.toLowerCase();
      if (!emailGroups[emailLower]) {
        emailGroups[emailLower] = [];
      }
      emailGroups[emailLower].push(user);
    });
    
    // Find any groups with multiple users (potential duplicates)
    const duplicates = Object.entries(emailGroups).filter(([email, users]) => users.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} potential duplicate email groups:`);
      duplicates.forEach(([email, users]) => {
        console.log(`   Email: ${email} (${users.length} users):`);
        users.forEach(user => {
          console.log(`     - ID: ${user.id}, Created: ${user.createdAt}`);
        });
      });
    } else {
      console.log(`✅ No duplicate emails found in database`);
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDuplicateEmailCheck(); 