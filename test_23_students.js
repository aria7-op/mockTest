const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const ADMIN_EMAIL = 'admin@mocktest.com';
const ADMIN_PASSWORD = 'Admin@123';

// Sample question data
const questionData = {
  text: "Explain the concept of Object-Oriented Programming (OOP) and discuss its four main principles with examples.",
  marks: 10,
  type: 'ESSAY',
  category: 'Programming',
  difficulty: 'INTERMEDIATE'
};

// Correct answer for comparison
const correctAnswer = "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing.";

// 23 different student answers with varying quality, perspectives, and approaches
const studentAnswers = [
  {
    name: "Student 1 - Expert Level",
    answer: "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data, or objects, rather than functions and logic. The four fundamental principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation bundles data and methods that operate on that data within a single unit, protecting it from external interference. Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse. Polymorphism enables objects to take multiple forms, allowing the same interface to be used for different underlying forms. Abstraction hides complex implementation details and shows only necessary features. For example, in a banking system, a BankAccount class encapsulates account details, inherits from a base Account class, uses polymorphism for different account types, and abstracts complex transaction processing."
  },
  {
    name: "Student 2 - Good Understanding",
    answer: "OOP is a way of programming that uses objects to represent data and functionality. The four main principles are: 1) Encapsulation - keeping data and methods together in a class, 2) Inheritance - creating new classes from existing ones, 3) Polymorphism - allowing objects to behave differently, and 4) Abstraction - hiding complexity. For example, a Car class can encapsulate engine details, inherit from Vehicle, use polymorphism for different car types, and abstract the driving mechanism."
  },
  {
    name: "Student 3 - Partial Understanding",
    answer: "Object-Oriented Programming uses objects. The four principles are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation means putting data in classes. Inheritance means getting properties from parent classes. Polymorphism means different forms. Abstraction means hiding details. Example: A class can have methods and data."
  },
  {
    name: "Student 4 - Wrong but Confident",
    answer: "OOP is about making programs with functions and variables. The four principles are: loops, conditions, functions, and arrays. Loops help repeat code, conditions make decisions, functions organize code, and arrays store data. For example, you can use a for loop to process arrays of data in functions."
  },
  {
    name: "Student 5 - Completely Off Topic",
    answer: "Programming is about writing code on computers. You need to know HTML, CSS, and JavaScript to make websites. The main things are: making buttons, changing colors, and adding text. For example, you can make a button that changes color when you click it."
  },
  {
    name: "Student 6 - Academic Style",
    answer: "Object-Oriented Programming represents a paradigm shift in software development methodology, emphasizing the organization of code around data structures known as objects. The four cardinal principles governing OOP are encapsulation, inheritance, polymorphism, and abstraction. Encapsulation facilitates data hiding and bundling of related functionality, inheritance promotes hierarchical relationships and code reusability, polymorphism enables interface flexibility and method overriding, while abstraction provides conceptual simplification through implementation hiding. These principles collectively enhance maintainability, scalability, and modularity in software systems."
  },
  {
    name: "Student 7 - Practical Focus",
    answer: "OOP helps you build software by creating objects that represent real-world things. The four key principles are: 1) Encapsulation - like a car's dashboard hiding the engine, 2) Inheritance - like different car models sharing basic features, 3) Polymorphism - like different animals making different sounds, 4) Abstraction - like using a TV remote without knowing how it works inside. This makes code easier to maintain and reuse."
  },
  {
    name: "Student 8 - Minimal Answer",
    answer: "OOP uses objects. Four principles: encapsulation, inheritance, polymorphism, abstraction."
  },
  {
    name: "Student 9 - Overly Complex",
    answer: "Object-Oriented Programming constitutes a sophisticated computational paradigm that fundamentally restructures software architecture through the conceptual framework of object-oriented design patterns, wherein discrete entities encapsulate both state and behavior within cohesive, self-contained units. The four foundational principles—encapsulation, inheritance, polymorphism, and abstraction—establish a hierarchical taxonomy of software organization that facilitates modular development, promotes code reusability through inheritance hierarchies, enables polymorphic behavior through dynamic dispatch mechanisms, and abstracts implementation complexity through interface-based design patterns."
  },
  {
    name: "Student 10 - Creative Example",
    answer: "Think of OOP like a restaurant! The four principles are: 1) Encapsulation - each chef has their own kitchen station, 2) Inheritance - sous chefs learn from head chefs, 3) Polymorphism - different chefs can cook the same dish differently, 4) Abstraction - customers don't need to know how the kitchen works. This makes the restaurant run smoothly and efficiently."
  },
  {
    name: "Student 11 - Technical Deep Dive",
    answer: "OOP implements data structures with associated behaviors through class-based architecture. Encapsulation provides access control via private/public modifiers, inheritance establishes is-a relationships through extends/implements keywords, polymorphism enables dynamic binding through virtual method tables, and abstraction creates interfaces that hide implementation details. Memory management, garbage collection, and virtual function calls are handled automatically by the runtime environment."
  },
  {
    name: "Student 12 - Historical Context",
    answer: "OOP emerged in the 1960s with Simula and was popularized by Smalltalk in the 1970s. The four principles evolved from early object-oriented languages: encapsulation (information hiding), inheritance (code reuse), polymorphism (flexible interfaces), and abstraction (simplified complexity). These principles address software engineering challenges like maintainability and scalability that procedural programming struggled with."
  },
  {
    name: "Student 13 - Comparison Approach",
    answer: "Unlike procedural programming that focuses on functions, OOP focuses on objects. The four principles distinguish OOP: encapsulation (vs global variables), inheritance (vs code duplication), polymorphism (vs rigid function calls), and abstraction (vs exposed complexity). For example, while procedural code might have separate functions for different shapes, OOP uses inheritance and polymorphism for cleaner design."
  },
  {
    name: "Student 14 - Problem-Solving Focus",
    answer: "OOP solves software problems by organizing code into objects. The four principles address specific challenges: encapsulation prevents data corruption, inheritance reduces code duplication, polymorphism allows flexible design, and abstraction simplifies complex systems. For example, a game engine uses OOP to manage different types of game objects efficiently."
  },
  {
    name: "Student 15 - Industry Perspective",
    answer: "In modern software development, OOP is essential for building scalable applications. The four principles enable teams to work efficiently: encapsulation allows parallel development, inheritance speeds up feature development, polymorphism enables plugin architectures, and abstraction simplifies API design. Companies like Google and Microsoft rely heavily on OOP principles."
  },
  {
    name: "Student 16 - Beginner Level",
    answer: "OOP is a way to write programs. It has four main ideas: 1) Put related things together (encapsulation), 2) Make new things from old things (inheritance), 3) Let things behave differently (polymorphism), 4) Hide complicated parts (abstraction). For example, you can make a Dog class that has a name and can bark."
  },
  {
    name: "Student 17 - Mathematical Approach",
    answer: "OOP can be viewed as a mathematical model where objects are instances of classes, which are sets with associated operations. The four principles form an algebraic structure: encapsulation defines closure properties, inheritance creates partial ordering, polymorphism establishes equivalence relations, and abstraction defines quotient structures. This mathematical foundation ensures consistency and provability."
  },
  {
    name: "Student 18 - Design Pattern Focus",
    answer: "OOP enables design patterns that solve common software problems. The four principles support these patterns: encapsulation enables Singleton and Factory patterns, inheritance supports Template Method and Strategy patterns, polymorphism enables Observer and Command patterns, and abstraction supports Facade and Adapter patterns. These patterns create maintainable, flexible code."
  },
  {
    name: "Student 19 - Performance Perspective",
    answer: "OOP impacts performance through its four principles: encapsulation adds method call overhead but improves cache locality, inheritance enables code sharing but increases memory usage, polymorphism enables dynamic dispatch but adds indirection costs, and abstraction reduces coupling but may add interface overhead. Modern compilers optimize these trade-offs effectively."
  },
  {
    name: "Student 20 - Security Focus",
    answer: "OOP enhances software security through its four principles: encapsulation prevents unauthorized access to data, inheritance can create secure base classes, polymorphism enables secure interface design, and abstraction hides sensitive implementation details. For example, a secure banking system uses encapsulation to protect account data and abstraction to hide encryption algorithms."
  },
  {
    name: "Student 21 - Testing Perspective",
    answer: "OOP principles support effective testing: encapsulation allows unit testing of isolated components, inheritance enables testing of base class behavior, polymorphism allows mocking and dependency injection for testing, and abstraction creates testable interfaces. For example, you can test a PaymentProcessor without knowing the actual payment gateway implementation."
  },
  {
    name: "Student 22 - Maintenance Focus",
    answer: "OOP improves code maintenance through its four principles: encapsulation localizes changes to specific classes, inheritance allows adding features without modifying existing code, polymorphism enables extending functionality through new implementations, and abstraction provides stable interfaces that can evolve internally. This reduces the risk of breaking existing functionality."
  },
  {
    name: "Student 23 - Future Trends",
    answer: "OOP continues evolving with modern programming practices. The four principles adapt to new paradigms: encapsulation supports microservices and API design, inheritance enables composition over inheritance patterns, polymorphism supports functional programming integration, and abstraction enables cloud-native architectures. Emerging languages like Rust and Go incorporate OOP principles differently."
  }
];

async function getAdminToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    return response.data.data.accessToken;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testEssayScoring() {
  try {
    console.log('🎯 Testing Essay Scoring System with 23 Different Student Answers\n');
    console.log('=' .repeat(80));
    
    const adminToken = await getAdminToken();
    console.log('✅ Admin authentication successful\n');

    // Test each student answer
    for (let i = 0; i < studentAnswers.length; i++) {
      const student = studentAnswers[i];
      console.log(`📝 Testing ${student.name}`);
      console.log(`   Question: ${questionData.text}`);
      console.log(`   Answer: ${student.answer.substring(0, 100)}${student.answer.length > 100 ? '...' : ''}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/admin/test-essay`, {
          studentAnswer: student.answer,
          correctAnswer: correctAnswer,
          maxMarks: questionData.marks,
          questionData: questionData
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        const result = response.data.data;
        
        console.log(`   ✅ Score: ${result.totalScore}/${questionData.marks} (${result.percentage}%)`);
        console.log(`   📊 Grade: ${result.grade} (${result.band})`);
        console.log(`   🎯 Assessment: ${result.assessment}`);
        
        // Show detailed breakdown
        if (result.detailedBreakdown) {
          console.log(`   📈 Breakdown:`);
          console.log(`      - Content Accuracy: ${result.detailedBreakdown.contentAccuracy?.score || 0}/${result.detailedBreakdown.contentAccuracy?.maxScore || 0}`);
          console.log(`      - Semantic Understanding: ${result.detailedBreakdown.semanticUnderstanding?.score || 0}/${result.detailedBreakdown.semanticUnderstanding?.maxScore || 0}`);
          console.log(`      - Writing Quality: ${result.detailedBreakdown.writingQuality?.score || 0}/${result.detailedBreakdown.writingQuality?.maxScore || 0}`);
          console.log(`      - Critical Thinking: ${result.detailedBreakdown.criticalThinking?.score || 0}/${result.detailedBreakdown.criticalThinking?.maxScore || 0}`);
          console.log(`      - Technical Precision: ${result.detailedBreakdown.technicalPrecision?.score || 0}/${result.detailedBreakdown.technicalPrecision?.maxScore || 0}`);
        }
        
        console.log(`   💡 Feedback: ${result.feedback.substring(0, 150)}${result.feedback.length > 150 ? '...' : ''}`);
        console.log('   ' + '-'.repeat(60));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.error?.message || error.message}`);
        console.log('   ' + '-'.repeat(60));
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 Testing completed! The system has evaluated 23 different student responses.');
    console.log('📊 This demonstrates the algorithm\'s ability to handle:');
    console.log('   - Expert-level answers with comprehensive understanding');
    console.log('   - Good answers with solid grasp of concepts');
    console.log('   - Partial understanding with gaps in knowledge');
    console.log('   - Incorrect but confident responses');
    console.log('   - Completely off-topic answers');
    console.log('   - Various writing styles and approaches');
    console.log('   - Different levels of technical depth');
    console.log('   - Creative and practical examples');
    console.log('   - Academic and industry perspectives');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testEssayScoring(); 