#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000/api/v1"
CATEGORY_ID="cmdyb4pji0000i2ovlel4fmju"

echo -e "${BLUE}🧪 ESSAY SCORING TEST SCRIPT${NC}"
echo "=================================="

# Step 1: Login as Admin
echo -e "\n${YELLOW}Step 1: Logging in as Admin${NC}"
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mocktest.com", "password": "Admin@123"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Admin login failed${NC}"
    echo $ADMIN_LOGIN
    exit 1
fi
echo -e "${GREEN}✅ Admin login successful${NC}"

# Step 2: Login as Student
echo -e "\n${YELLOW}Step 2: Logging in as Student${NC}"
STUDENT_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student1@example.com", "password": "Admin@123"}')

STUDENT_TOKEN=$(echo $STUDENT_LOGIN | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$STUDENT_TOKEN" ]; then
    echo -e "${RED}❌ Student login failed${NC}"
    echo $STUDENT_LOGIN
    exit 1
fi
echo -e "${GREEN}✅ Student login successful${NC}"

# Step 3: Create Essay Question
echo -e "\n${YELLOW}Step 3: Creating Essay Question${NC}"
QUESTION_DATA='{
  "text": "Explain the concept of Object-Oriented Programming and its four main principles. Provide examples for each principle.",
  "examCategoryId": "'$CATEGORY_ID'",
  "difficulty": "MEDIUM",
  "type": "ESSAY",
  "marks": 10,
  "timeLimit": 300
}'

CREATE_QUESTION=$(curl -s -X POST $BASE_URL/admin/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "$QUESTION_DATA")

QUESTION_ID=$(echo $CREATE_QUESTION | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$QUESTION_ID" ]; then
    echo -e "${RED}❌ Question creation failed${NC}"
    echo $CREATE_QUESTION
    exit 1
fi
echo -e "${GREEN}✅ Question created with ID: $QUESTION_ID${NC}"

# Step 4: Create Exam
echo -e "\n${YELLOW}Step 4: Creating Exam${NC}"
EXAM_DATA='{
  "title": "Advanced Programming Concepts Test",
  "description": "A comprehensive test covering OOP concepts",
  "examCategoryId": "'$CATEGORY_ID'",
  "duration": 1800,
  "totalMarks": 10,
  "passingMarks": 6,
  "price": 0,
  "totalQuestions": 1,
  "isPublic": true,
  "isActive": true,
  "randomizeQuestions": false,
  "randomizeOptions": false
}'

CREATE_EXAM=$(curl -s -X POST $BASE_URL/admin/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "$EXAM_DATA")

EXAM_ID=$(echo $CREATE_EXAM | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$EXAM_ID" ]; then
    echo -e "${RED}❌ Exam creation failed${NC}"
    echo $CREATE_EXAM
    exit 1
fi
echo -e "${GREEN}✅ Exam created with ID: $EXAM_ID${NC}"

# Step 5: Exam is ready (public and active)
echo -e "\n${YELLOW}Step 5: Exam is ready for booking${NC}"
echo -e "${GREEN}✅ Exam created as public and active${NC}"

# Step 6: Book exam
echo -e "\n${YELLOW}Step 6: Booking Exam${NC}"
BOOKING_DATA='{
  "examId": "'$EXAM_ID'",
  "scheduledAt": "'$(date -d '+1 minute' -Iseconds)'"
}'

BOOK_EXAM=$(curl -s -X POST $BASE_URL/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "$BOOKING_DATA")

BOOKING_ID=$(echo $BOOK_EXAM | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$BOOKING_ID" ]; then
    echo -e "${RED}❌ Exam booking failed${NC}"
    echo $BOOK_EXAM
    exit 1
fi
echo -e "${GREEN}✅ Exam booked with ID: $BOOKING_ID${NC}"

# Step 7: Start attempt
echo -e "\n${YELLOW}Step 7: Starting Exam Attempt${NC}"
START_ATTEMPT=$(curl -s -X POST $BASE_URL/attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"examId": "'$EXAM_ID'", "bookingId": "'$BOOKING_ID'"}')

ATTEMPT_ID=$(echo $START_ATTEMPT | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ATTEMPT_ID" ]; then
    echo -e "${RED}❌ Failed to start attempt${NC}"
    echo $START_ATTEMPT
    exit 1
fi
echo -e "${GREEN}✅ Attempt started with ID: $ATTEMPT_ID${NC}"

# Step 8: Submit excellent essay answer
echo -e "\n${YELLOW}Step 8: Submitting Excellent Essay Answer${NC}"
EXCELLENT_ANSWER='{
  "questionId": "'$QUESTION_ID'",
  "essayAnswer": "Object-Oriented Programming (OOP) is a fundamental programming paradigm that organizes software design around data, or objects, rather than functions and logic. This approach provides a clear structure for programs and enables code reusability, making it easier to maintain and modify applications.

The four main principles of OOP are:

1. **Encapsulation**: This principle bundles data and the methods that operate on that data within a single unit or object, hiding the internal state and requiring all interaction to be performed through an object'\''s methods. For example, a BankAccount class encapsulates the account balance as a private field and provides public methods like deposit() and withdraw() to interact with it. This prevents direct access to the balance and ensures all transactions go through proper validation.

2. **Inheritance**: This allows a class to inherit properties and methods from another class, promoting code reuse and establishing a relationship between parent and child classes. For instance, an Animal class might have basic properties like name and age, and methods like eat() and sleep(). Then, Dog and Cat classes can inherit from Animal and add their specific behaviors like bark() or meow().

3. **Polymorphism**: This enables objects to be treated as instances of their parent class while maintaining their own unique implementations. It allows the same interface to be used for different underlying forms. For example, a Shape interface might define an area() method, and different classes like Circle and Rectangle can implement this method differently while being used interchangeably in code that expects a Shape.

4. **Abstraction**: This principle hides complex implementation details and shows only the necessary features of an object. It reduces complexity and increases efficiency. For instance, a Car class might provide simple methods like start() and stop(), but hide the complex internal workings of the engine, transmission, and other mechanical systems. Users of the Car class don'\''t need to understand how the engine works to drive the car."
}'

SUBMIT_EXCELLENT=$(curl -s -X POST $BASE_URL/attempts/$ATTEMPT_ID/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "$EXCELLENT_ANSWER")

echo -e "${GREEN}✅ Excellent answer submitted${NC}"
echo "Response: $SUBMIT_EXCELLENT"

# Step 9: Complete attempt
echo -e "\n${YELLOW}Step 9: Completing Attempt${NC}"
COMPLETE_ATTEMPT=$(curl -s -X PUT $BASE_URL/attempts/$ATTEMPT_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if [[ $COMPLETE_ATTEMPT == *"error"* ]]; then
    echo -e "${RED}❌ Failed to complete attempt${NC}"
    echo $COMPLETE_ATTEMPT
else
    echo -e "${GREEN}✅ Attempt completed${NC}"
fi

# Step 10: Get results
echo -e "\n${YELLOW}Step 10: Getting Final Results${NC}"
GET_RESULTS=$(curl -s -X GET $BASE_URL/attempts/$ATTEMPT_ID \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo -e "${GREEN}✅ Final Results:${NC}"
echo $GET_RESULTS

# Step 11: Get detailed responses
echo -e "\n${YELLOW}Step 11: Getting Detailed Responses${NC}"
GET_RESPONSES=$(curl -s -X GET $BASE_URL/attempts/$ATTEMPT_ID/responses \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo -e "${GREEN}✅ Detailed Responses:${NC}"
echo $GET_RESPONSES

echo -e "\n${BLUE}🎉 TEST COMPLETED!${NC}"
echo -e "${BLUE}Created IDs:${NC}"
echo "  Question: $QUESTION_ID"
echo "  Exam: $EXAM_ID"
echo "  Booking: $BOOKING_ID"
echo "  Attempt: $ATTEMPT_ID" 