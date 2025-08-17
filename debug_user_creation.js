const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserCreation() {
  try {
    console.log('🔍 Debugging User Creation Issues...\n');

    // Check all users in database
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total users in database: ${allUsers.length}\n`);

    if (allUsers.length > 0) {
      console.log('👥 All users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
      });
    }

    // Check for potential duplicate emails (case-insensitive)
    console.log('\n🔍 Checking for potential duplicate emails...');
    
    const emails = allUsers.map(u => u.email.toLowerCase());
    const uniqueEmails = [...new Set(emails)];
    
    if (emails.length !== uniqueEmails.length) {
      console.log('⚠️  Potential duplicate emails found!');
      
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      const uniqueDuplicates = [...new Set(duplicates)];
      
      uniqueDuplicates.forEach(email => {
        const usersWithEmail = allUsers.filter(u => u.email.toLowerCase() === email);
        console.log(`   Email "${email}" appears ${usersWithEmail.length} times:`);
        usersWithEmail.forEach(user => {
          console.log(`     - ${user.email} (ID: ${user.id}, Role: ${user.role})`);
        });
      });
    } else {
      console.log('✅ No duplicate emails found');
    }

    // Check for users with similar emails
    console.log('\n🔍 Checking for similar emails...');
    for (let i = 0; i < allUsers.length; i++) {
      for (let j = i + 1; j < allUsers.length; j++) {
        const email1 = allUsers[i].email.toLowerCase();
        const email2 = allUsers[j].email.toLowerCase();
        
        if (email1.includes(email2) || email2.includes(email1)) {
          console.log(`⚠️  Similar emails found:`);
          console.log(`   - ${allUsers[i].email} (ID: ${allUsers[i].id})`);
          console.log(`   - ${allUsers[j].email} (ID: ${allUsers[j].id})`);
        }
      }
    }

    // Check database constraints
    console.log('\n🔍 Checking database constraints...');
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'users' 
          AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
        ORDER BY tc.constraint_type, kcu.column_name;
      `;
      
      console.log('📋 Database constraints:');
      result.forEach(constraint => {
        console.log(`   - ${constraint.constraint_type}: ${constraint.column_name}`);
      });
    } catch (error) {
      console.log('❌ Could not check database constraints:', error.message);
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug function
debugUserCreation(); 