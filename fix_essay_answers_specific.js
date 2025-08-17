const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSpecificEssayAnswers() {
  try {
    console.log('🔧 Fixing specific essay question answers...');
    
    // Question 1: OOP question
    const oopQuestionId = 'cmdytwg310005i2iw1qjh9c51';
    const oopOptionId = 'cmdytwg310006i2iwbn8to0bs';
    
    // Question 2: Stack vs Queue question
    const stackQueueQuestionId = 'cmdyn9xa10009i2x0xvimgd59';
    const stackQueueOptionId = 'cmdzg8ong0003i2mzhyorsw24';
    
    // Update OOP question answer
    console.log('\n📝 Updating OOP question answer...');
    await prisma.questionOption.update({
      where: { id: oopOptionId },
      data: {
        text: "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.",
        isCorrect: true
      }
    });
    console.log('✅ OOP question answer updated');
    
    // Update Stack vs Queue question answer
    console.log('\n📝 Updating Stack vs Queue question answer...');
    await prisma.questionOption.update({
      where: { id: stackQueueOptionId },
      data: {
        text: "A stack is a Last-In-First-Out (LIFO) data structure where elements are added and removed from the same end (top). A queue is a First-In-First-Out (FIFO) data structure where elements are added at one end (rear) and removed from the other end (front). Real-world examples of stacks include: 1) Browser back button - the most recently visited page is accessed first, 2) Undo functionality in text editors - the last action is undone first, 3) Function call stack in programming - the most recent function call is executed first. Real-world examples of queues include: 1) Waiting in line at a bank - the first person to arrive is served first, 2) Print queue - documents are printed in the order they were sent, 3) Task scheduling in operating systems - processes are executed in the order they were queued.",
        isCorrect: true
      }
    });
    console.log('✅ Stack vs Queue question answer updated');
    
    console.log('\n🎉 All essay question answers have been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing essay answers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixSpecificEssayAnswers(); 