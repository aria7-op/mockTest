const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotificationDatabase() {
  console.log('🔍 Checking Notification Database...\n');

  try {
    // 1. Count total notifications
    const totalCount = await prisma.notification.count();
    console.log(`📊 Total notifications in database: ${totalCount}`);

    // 2. Count by type
    const typeCounts = await prisma.notification.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('\n📋 Notifications by type:');
    typeCounts.forEach(type => {
      console.log(`  ${type.type}: ${type._count.type}`);
    });

    // 3. Count by status
    const statusCounts = await prisma.notification.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    console.log('\n📋 Notifications by status:');
    statusCounts.forEach(status => {
      console.log(`  ${status.status}: ${status._count.status}`);
    });

    // 4. Get recent notifications
    const recentNotifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
        userId: true
      }
    });

    console.log('\n📋 10 Most Recent Notifications:');
    recentNotifications.forEach((notification, index) => {
      const date = new Date(notification.createdAt).toLocaleString();
      console.log(`  ${index + 1}. [${notification.type}] ${notification.title} - ${notification.status} (${date})`);
    });

    // 5. Check for NEW_EXAM_AVAILABLE notifications specifically
    console.log('\n📚 Checking for exam-related notifications...');
    
    // First, let's see what types actually exist
    const allTypes = await prisma.notification.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('📋 Available notification types:');
    allTypes.forEach(type => {
      console.log(`  ${type.type}: ${type._count.type}`);
    });
    
    // Check for any exam-related notifications
    const examRelatedTypes = ['EXAM_REMINDER', 'EXAM_STARTED', 'EXAM_COMPLETED'];
    const examNotifications = await prisma.notification.findMany({
      where: {
        type: { in: examRelatedTypes }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`\n📚 Exam-related notifications found: ${examNotifications.length}`);
    if (examNotifications.length > 0) {
      examNotifications.forEach((notification, index) => {
        const date = new Date(notification.createdAt).toLocaleString();
        console.log(`  ${index + 1}. ${notification.title} - ${notification.status} (${date})`);
      });
    } else {
      console.log('  ❌ No exam-related notifications found');
      console.log('  💡 This means exam creation is NOT triggering notifications!');
    }

    // 6. Check for any notifications created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await prisma.notification.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    console.log(`\n📅 Notifications created today: ${todayCount}`);

  } catch (error) {
    console.error('❌ Error checking notification database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotificationDatabase(); 