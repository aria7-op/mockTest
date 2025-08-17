const ExamService = require('./src/services/examService');
const logger = require('./src/config/logger');

async function debugExamService() {
  try {
    console.log('🔍 Starting exam service debug...');
    
    const examService = new ExamService();
    
    // Test 1: Test the date conversion logic
    console.log('\n📅 Testing date conversion logic...');
    
    const testUpdateData = {
      title: 'Test Exam Update',
      startDate: '2025-12-25T10:00:00Z',
      endDate: '2025-12-25T12:00:00Z'
    };
    
    console.log('📤 Input data:', testUpdateData);
    
    // Simulate the date processing logic from updateExam
    const processedData = { ...testUpdateData };
    
    // Handle startDate -> scheduledStart conversion
    if (testUpdateData.startDate !== undefined) {
      console.log('🔄 Processing startDate:', testUpdateData.startDate);
      
      if (testUpdateData.startDate) {
        const parsedDate = new Date(testUpdateData.startDate);
        if (isNaN(parsedDate.getTime())) {
          console.log('❌ Invalid startDate format');
          return;
        }
        processedData.scheduledStart = parsedDate;
        console.log('✅ Converted startDate to scheduledStart:', processedData.scheduledStart);
      } else {
        processedData.scheduledStart = null;
        console.log('✅ Set scheduledStart to null');
      }
      
      delete processedData.startDate;
      console.log('🗑️ Deleted startDate from processedData');
    }
    
    // Handle endDate -> scheduledEnd conversion
    if (testUpdateData.endDate !== undefined) {
      console.log('🔄 Processing endDate:', testUpdateData.endDate);
      
      if (testUpdateData.endDate) {
        const parsedDate = new Date(testUpdateData.endDate);
        if (isNaN(parsedDate.getTime())) {
          console.log('❌ Invalid endDate format');
          return;
        }
        processedData.scheduledEnd = parsedDate;
        console.log('✅ Converted endDate to scheduledEnd:', processedData.scheduledEnd);
      } else {
        processedData.scheduledEnd = null;
        console.log('✅ Set scheduledEnd to null');
      }
      
      delete processedData.endDate;
      console.log('🗑️ Deleted endDate from processedData');
    }
    
    console.log('\n📋 Final processed data:', {
      title: processedData.title,
      scheduledStart: processedData.scheduledStart,
      scheduledEnd: processedData.scheduledEnd,
      scheduledStartType: typeof processedData.scheduledStart,
      scheduledEndType: typeof processedData.scheduledEnd
    });
    
    // Test 2: Test with different date formats
    console.log('\n🔄 Testing different date formats...');
    
    const testFormats = [
      '2025-12-25T10:00:00Z',
      '2025-12-25 10:00:00',
      '2025-12-25',
      '12/25/2025 10:00 AM',
      new Date('2025-12-25T10:00:00Z'),
      null
    ];
    
    testFormats.forEach((dateFormat, index) => {
      console.log(`\n📅 Test ${index + 1}: ${dateFormat} (${typeof dateFormat})`);
      
      if (dateFormat) {
        const parsedDate = new Date(dateFormat);
        if (isNaN(parsedDate.getTime())) {
          console.log('❌ Invalid date format');
        } else {
          console.log('✅ Valid date:', parsedDate.toISOString());
        }
      } else {
        console.log('✅ Null date (will be set to null)');
      }
    });
    
    // Test 3: Test the actual updateExam method with a real exam
    console.log('\n🔄 Testing actual updateExam method...');
    
    try {
      // Get the first exam from the database
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const exam = await prisma.exam.findFirst({
        select: { id: true, title: true, scheduledStart: true, scheduledEnd: true }
      });
      
      if (exam) {
        console.log('📋 Found exam to test:', {
          id: exam.id,
          title: exam.title,
          scheduledStart: exam.scheduledStart,
          scheduledEnd: exam.scheduledEnd
        });
        
        // Test the update with dates
        const updateResult = await examService.updateExam(
          exam.id,
          {
            startDate: '2025-12-26T10:00:00Z',
            endDate: '2025-12-26T12:00:00Z'
          },
          'test-user-id'
        );
        
        if (updateResult.success) {
          console.log('✅ Update successful:', {
            exam: updateResult.exam.title,
            scheduledStart: updateResult.exam.scheduledStart,
            scheduledEnd: updateResult.exam.scheduledEnd
          });
        } else {
          console.log('❌ Update failed:', updateResult.message);
        }
        
        await prisma.$disconnect();
      } else {
        console.log('❌ No exam found to test');
      }
    } catch (error) {
      console.error('❌ Error testing updateExam:', error);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugExamService(); 