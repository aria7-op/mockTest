const { PrismaClient } = require('@prisma/client');
const logger = require('./src/config/logger');

const prisma = new PrismaClient();

// Common correct answers for programming essay questions
const commonAnswers = {
  'oop': {
    text: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects' that contain data and code. The four main principles are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit, 2) Inheritance - creating new classes that are built upon existing classes, 3) Polymorphism - the ability to present the same interface for different underlying forms, and 4) Abstraction - hiding complex implementation details and showing only necessary features. OOP promotes code reusability, maintainability, and scalability.",
    keywords: ['object', 'class', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'method', 'property']
  },
  'inheritance': {
    text: "Inheritance is a fundamental concept in object-oriented programming that allows a class to inherit properties and methods from another class. The class that inherits is called the subclass or derived class, while the class being inherited from is called the superclass or base class. Inheritance promotes code reuse and establishes a hierarchical relationship between classes. It supports the 'is-a' relationship and enables polymorphism.",
    keywords: ['subclass', 'superclass', 'extends', 'inherit', 'derived', 'base', 'parent', 'child']
  },
  'polymorphism': {
    text: "Polymorphism is the ability of different objects to respond to the same method call in different ways. There are two main types: 1) Compile-time polymorphism (method overloading) - multiple methods with the same name but different parameters, and 2) Runtime polymorphism (method overriding) - a subclass provides a specific implementation of a method defined in its superclass. Polymorphism enhances flexibility and extensibility in code design.",
    keywords: ['overloading', 'overriding', 'method', 'same name', 'different behavior', 'flexibility']
  },
  'encapsulation': {
    text: "Encapsulation is the bundling of data and methods that operate on that data within a single unit or object, while hiding the internal state and requiring all interaction to be performed through an object's methods. It provides data hiding, prevents direct access to internal data, and ensures data integrity. Access modifiers like private, protected, and public control the visibility of class members.",
    keywords: ['data hiding', 'private', 'public', 'protected', 'getter', 'setter', 'access modifier']
  },
  'abstraction': {
    text: "Abstraction is the process of hiding complex implementation details and showing only the necessary features of an object. It focuses on what an object does rather than how it does it. Abstract classes and interfaces are used to achieve abstraction. This concept helps in managing complexity and provides a clear separation between interface and implementation.",
    keywords: ['abstract', 'interface', 'implementation', 'hide', 'complexity', 'separation']
  }
};

async function updateEssayAnswers() {
  try {
    console.log('🔍 Finding essay questions that need correct answers...');
    
    // Find essay questions with placeholder correct answers
    const essayQuestions = await prisma.question.findMany({
      where: {
        type: 'ESSAY',
        options: {
          some: {
            text: {
              startsWith: '[CORRECT ANSWER NEEDED]'
            }
          }
        }
      },
      include: {
        options: true,
        exam_categories: true
      }
    });

    console.log(`📝 Found ${essayQuestions.length} essay questions with placeholder answers`);

    if (essayQuestions.length === 0) {
      console.log('✅ No essay questions need updating');
      return;
    }

    let updatedCount = 0;

    for (const question of essayQuestions) {
      console.log(`\n🔧 Processing: ${question.text.substring(0, 100)}...`);
      
      // Find the placeholder option
      const placeholderOption = question.options.find(option => 
        option.text.startsWith('[CORRECT ANSWER NEEDED]')
      );

      if (!placeholderOption) {
        console.log(`   ⏭️  No placeholder found, skipping`);
        continue;
      }

      // Try to match question content with common answers
      const questionText = question.text.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      for (const [topic, answer] of Object.entries(commonAnswers)) {
        const keywordMatches = answer.keywords.filter(keyword => 
          questionText.includes(keyword)
        ).length;
        
        if (keywordMatches > bestScore) {
          bestScore = keywordMatches;
          bestMatch = { topic, answer };
        }
      }

      if (bestMatch && bestScore > 0) {
        try {
          // Update the placeholder option with the correct answer
          await prisma.questionOption.update({
            where: { id: placeholderOption.id },
            data: {
              text: bestMatch.answer.text
            }
          });

          console.log(`   ✅ Updated with ${bestMatch.topic} answer (${bestScore} keyword matches)`);
          updatedCount++;

        } catch (error) {
          console.log(`   ❌ Error updating: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️  No matching answer found - manual update needed`);
        console.log(`      Question keywords: ${questionText.split(' ').slice(0, 10).join(', ')}...`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total questions processed: ${essayQuestions.length}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   Need manual update: ${essayQuestions.length - updatedCount}`);

    if (essayQuestions.length - updatedCount > 0) {
      console.log(`\n📝 Questions that need manual updating:`);
      
      for (const question of essayQuestions) {
        const placeholderOption = question.options.find(option => 
          option.text.startsWith('[CORRECT ANSWER NEEDED]')
        );
        
        if (placeholderOption) {
          console.log(`   - ID: ${question.id}`);
          console.log(`   - Question: ${question.text.substring(0, 80)}...`);
          console.log(`   - Category: ${question.exam_categories.name}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error updating essay answers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateEssayAnswers(); 