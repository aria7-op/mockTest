const { PrismaClient } = require('@prisma/client');
const logger = require('./src/config/logger');

const prisma = new PrismaClient();

async function debugDateInsertion() {
  try {
    console.log('🔍 Starting date insertion debug...');
    
    // Test 1: Check if we can connect to database
    console.log('\n📊 Testing database connection...');
    const examCount = await prisma.exam.count();
    console.log(`✅ Database connected. Total exams: ${examCount}`);
    
    // Test 2: Check exam schema
    console.log('\n📋 Checking exam schema...');
    const sampleExam = await prisma.exam.findFirst({
      select: {
        id: true,
        title: true,
        scheduledStart: true,
        scheduledEnd: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (sampleExam) {
      console.log('✅ Sample exam found:', {
        id: sampleExam.id,
        title: sampleExam.title,
        scheduledStart: sampleExam.scheduledStart,
        scheduledEnd: sampleExam.scheduledEnd,
        createdAt: sampleExam.createdAt,
        updatedAt: sampleExam.updatedAt
      });
    } else {
      console.log('❌ No exams found in database');
      return;
    }
    
    // Test 3: Try to update an exam with dates
    console.log('\n🔄 Testing date update...');
    const testDates = {
      scheduledStart: new Date('2025-12-25T10:00:00Z'),
      scheduledEnd: new Date('2025-12-25T12:00:00Z')
    };
    
    console.log('📅 Test dates:', testDates);
    
    const updatedExam = await prisma.exam.update({
      where: { id: sampleExam.id },
      data: testDates,
      select: {
        id: true,
        title: true,
        scheduledStart: true,
        scheduledEnd: true,
        updatedAt: true
      }
    });
    
    console.log('✅ Exam updated successfully:', {
      id: updatedExam.id,
      title: updatedExam.title,
      scheduledStart: updatedExam.scheduledStart,
      scheduledEnd: updatedExam.scheduledEnd,
      updatedAt: updatedExam.updatedAt
    });
    
    // Test 4: Verify the dates were actually stored
    console.log('\n🔍 Verifying stored dates...');
    const verifyExam = await prisma.exam.findUnique({
      where: { id: sampleExam.id },
      select: {
        id: true,
        title: true,
        scheduledStart: true,
        scheduledEnd: true,
        updatedAt: true
      }
    });
    
    console.log('🔍 Verification result:', {
      id: verifyExam.id,
      title: verifyExam.title,
      scheduledStart: verifyExam.scheduledStart,
      scheduledEnd: verifyExam.scheduledEnd,
      updatedAt: verifyExam.updatedAt
    });
    
    // Test 5: Check if dates are actually different from before
    if (verifyExam.scheduledStart && verifyExam.scheduledEnd) {
      console.log('✅ Dates were successfully inserted and stored!');
      console.log('📅 Start date:', verifyExam.scheduledStart.toISOString());
      console.log('📅 End date:', verifyExam.scheduledEnd.toISOString());
    } else {
      console.log('❌ Dates were not stored properly');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDateInsertion(); 