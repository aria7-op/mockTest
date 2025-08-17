const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Database Connection...\n');

    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Prisma connection successful\n');

    // Test 2: Check if users table exists and has data
    console.log('2. Checking users table...');
    const userCount = await prisma.user.count();
    console.log(`✅ Users table exists with ${userCount} users\n`);

    // Test 3: Check for specific email
    const testEmail = 'test@example.com';
    console.log(`3. Checking for email: ${testEmail}`);
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (user) {
      console.log(`❌ User found: ${user.email} (ID: ${user.id})`);
    } else {
      console.log('✅ No user found with this email');
    }

    // Test 4: Direct SQL query
    console.log('\n4. Testing direct SQL query...');
    const directResult = await prisma.$queryRaw`
      SELECT id, email, "createdAt" 
      FROM users 
      WHERE LOWER(email) = LOWER(${testEmail})
    `;
    
    console.log('Direct SQL result:', directResult);

    // Test 5: Check table structure
    console.log('\n5. Checking table structure...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('Table structure:');
    tableInfo.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Test 6: Check constraints
    console.log('\n6. Checking constraints...');
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'users'
      ORDER BY tc.constraint_type, kcu.column_name
    `;
    
    console.log('Constraints:');
    constraints.forEach(constraint => {
      console.log(`   ${constraint.constraint_type}: ${constraint.column_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection(); 