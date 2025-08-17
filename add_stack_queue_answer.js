const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addStackQueueAnswer() {
  try {
    console.log('🔍 Finding the stack vs queue question...');
    
    const questionId = 'cmdyn9xa10009i2x0xvimgd59';
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true
      }
    });

    if (!question) {
      console.log('❌ Question not found');
      return;
    }

    console.log(`📝 Found question: ${question.text}`);
    
    // Find the placeholder option
    const placeholderOption = question.options.find(option => 
      option.text.startsWith('[CORRECT ANSWER NEEDED]')
    );

    if (!placeholderOption) {
      console.log('❌ No placeholder option found');
      return;
    }

    const correctAnswer = `A stack and a queue are both linear data structures but differ in their access patterns:

STACK (LIFO - Last In, First Out):
- Elements are added and removed from the same end (top)
- Operations: push (add), pop (remove), peek (view top)
- Real-world examples: 
  * Browser back button (pages are stacked)
  * Undo functionality in text editors
  * Function call stack in programming
  * Stack of plates in a restaurant

QUEUE (FIFO - First In, First Out):
- Elements are added at one end (rear) and removed from the other end (front)
- Operations: enqueue (add), dequeue (remove), peek (view front)
- Real-world examples:
  * People waiting in line at a bank
  * Print job queue
  * Task scheduling in operating systems
  * Customer service call queue

Key Differences:
1. Access Pattern: Stack is LIFO, Queue is FIFO
2. Operations: Stack uses push/pop, Queue uses enqueue/dequeue
3. Use Cases: Stack for backtracking/undo, Queue for processing in order
4. Implementation: Stack can be implemented with array or linked list, Queue typically uses linked list for efficiency`;

    // Update the placeholder option
    await prisma.questionOption.update({
      where: { id: placeholderOption.id },
      data: {
        text: correctAnswer
      }
    });

    console.log('✅ Successfully updated with correct answer for stack vs queue question');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
addStackQueueAnswer(); 