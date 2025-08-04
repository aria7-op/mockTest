const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUsers() {
  try {
    console.log('🔐 Creating admin users...');

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    // Create Super Admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@mocktest.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log('✅ Super Admin created:', superAdmin.email);

    // Create Admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin1@mocktest.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log('✅ Admin created:', admin.email);

    // Create Moderator
    const moderator = await prisma.user.create({
      data: {
        email: 'moderator@mocktest.com',
        password: hashedPassword,
        firstName: 'Moderator',
        lastName: 'User',
        role: 'MODERATOR',
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log('✅ Moderator created:', moderator.email);

    // Create Student
    const student = await prisma.user.create({
      data: {
        email: 'student1@example.com',
        password: hashedPassword,
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log('✅ Student created:', student.email);

    console.log('🎉 All users created successfully!');
    console.log('🔐 Login Credentials:');
    console.log('   • Super Admin: admin@mocktest.com / Admin@123');
    console.log('   • Admin: admin1@mocktest.com / Admin@123');
    console.log('   • Moderator: moderator@mocktest.com / Admin@123');
    console.log('   • Student: student1@example.com / Admin@123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers(); 