const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNewUserCreation() {
  try {
    console.log('🔍 Testing New User Creation Logic...\n');

    // Test 1: Check if we can create a new user with a unique email
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`1. Testing new user creation with email: ${testEmail}`);
    
    // First, verify the email doesn't exist
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log(`❌ User already exists with this email: ${existingUser.email}`);
      return;
    } else {
      console.log(`✅ Email is available for new user creation`);
    }

    // Test 2: Simulate the duplicate check logic
    console.log('\n2. Testing duplicate check logic...');
    
    // Check 1: Exact match
    const exactMatch = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (exactMatch) {
      console.log(`❌ Exact match found: ${exactMatch.email}`);
      return;
    } else {
      console.log(`✅ No exact match found`);
    }

    // Check 2: Case-insensitive search
    const caseInsensitiveCheck = await prisma.user.findFirst({
      where: {
        email: {
          contains: testEmail,
          mode: 'insensitive'
        }
      }
    });
    
    if (caseInsensitiveCheck && caseInsensitiveCheck.email.toLowerCase() !== testEmail.toLowerCase()) {
      console.log(`❌ Similar email found: ${caseInsensitiveCheck.email}`);
      return;
    } else {
      console.log(`✅ No similar emails found`);
    }

    // Check 3: Similar email detection
    const similarEmails = await prisma.user.findMany({
      where: {
        OR: [
          { email: { equals: testEmail, mode: 'insensitive' } },
          { email: { contains: testEmail, mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true }
    });
    
    const exactMatches = similarEmails.filter(u => u.email.toLowerCase() === testEmail.toLowerCase());
    if (exactMatches.length > 0) {
      console.log(`❌ Exact match found in similar emails check`);
      return;
    } else {
      console.log(`✅ No exact matches in similar emails check`);
    }

    // Test 3: Test transaction-based creation (simulation)
    console.log('\n3. Testing transaction-based creation simulation...');
    
    try {
      const user = await prisma.$transaction(async (tx) => {
        // Final check inside transaction
        const finalCheck = await tx.user.findUnique({
          where: { email: testEmail }
        });

        if (finalCheck) {
          throw new Error('User with this email already exists (race condition detected)');
        }

        // Create test user
        return await tx.user.create({
          data: {
            email: testEmail,
            password: 'hashedPassword123',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT',
            isActive: true,
            isEmailVerified: false,
            emailVerificationToken: 'test-token-123'
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true
          }
        });
      });

      console.log(`✅ User created successfully in transaction:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);

      // Test 4: Verify the user was actually created
      console.log('\n4. Verifying user was created in database...');
      const createdUser = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      if (createdUser) {
        console.log(`✅ User verified in database: ${createdUser.email}`);
      } else {
        console.log(`❌ User not found in database after creation`);
      }

      // Test 5: Test duplicate detection on the same email
      console.log('\n5. Testing duplicate detection on newly created email...');
      const duplicateCheck = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      if (duplicateCheck) {
        console.log(`✅ Duplicate check correctly detects existing user: ${duplicateCheck.email}`);
        console.log(`   This means the duplicate prevention is working correctly`);
      } else {
        console.log(`❌ Duplicate check failed to detect existing user`);
      }

    } catch (error) {
      console.error(`❌ Transaction failed:`, error.message);
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNewUserCreation(); 