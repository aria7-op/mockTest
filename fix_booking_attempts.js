const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBookingAttempts() {
  try {
    console.log('🔧 Fixing booking attempts...\n');
    
    // Find the booking that has null attemptsUsed
    const booking = await prisma.examBooking.findFirst({
      where: {
        id: 'cmdynheey000yi2x0p6uzjt99'
      }
    });

    if (!booking) {
      console.log('❌ Booking not found');
      return;
    }

    console.log('📊 Current booking:');
    console.log(`   - ID: ${booking.id}`);
    console.log(`   - Status: ${booking.status}`);
    console.log(`   - Attempts used: ${booking.attemptsUsed}`);
    console.log(`   - Attempts allowed: ${booking.attemptsAllowed}`);

    // Count completed attempts for this booking
    const completedAttempts = await prisma.examAttempt.count({
      where: {
        examId: booking.examId,
        userId: booking.userId,
        status: 'COMPLETED'
      }
    });

    console.log(`📊 Completed attempts count: ${completedAttempts}`);

    // Update the booking with the correct attemptsUsed
    const updatedBooking = await prisma.examBooking.update({
      where: { id: booking.id },
      data: { attemptsUsed: completedAttempts }
    });

    console.log('\n✅ Booking updated successfully!');
    console.log(`📊 New attempts used: ${updatedBooking.attemptsUsed}`);
    console.log(`📊 Can take exam: ${updatedBooking.attemptsUsed < updatedBooking.attemptsAllowed ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Error fixing booking attempts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBookingAttempts(); 