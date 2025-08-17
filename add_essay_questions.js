const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function addEssayQuestions() {
  try {
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mocktest.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const categoryId = 'cmdyb4pji0000i2ovlel4fmju';
    
    const essayQuestions = [
      {
        text: "Explain the concept of artificial intelligence and its impact on modern society. Discuss both the benefits and potential challenges.",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 10,
        examCategoryId: categoryId,
        options: [{
          text: "Artificial intelligence (AI) refers to the simulation of human intelligence in machines. It encompasses machine learning, natural language processing, and robotics. Benefits include automation, improved healthcare diagnostics, and enhanced productivity. Challenges include job displacement, privacy concerns, and ethical considerations regarding decision-making algorithms.",
          isCorrect: true
        }]
      },
      {
        text: "Describe the process of photosynthesis and explain why it is essential for life on Earth.",
        type: "ESSAY",
        difficulty: "EASY",
        marks: 8,
        examCategoryId: categoryId,
        options: [{
          text: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process occurs in chloroplasts using chlorophyll. It's essential because it produces oxygen for respiration, provides food for the entire food chain, and removes carbon dioxide from the atmosphere.",
          isCorrect: true
        }]
      },
      {
        text: "Compare and contrast renewable and non-renewable energy sources. Which do you think will be more important in the future and why?",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 12,
        examCategoryId: categoryId,
        correctAnswer: "Renewable energy sources (solar, wind, hydro) are naturally replenished and environmentally friendly, while non-renewable sources (fossil fuels) are finite and polluting. Renewable energy will be more important in the future due to climate change concerns, technological advancements, and decreasing costs of renewable technologies."
      },
      {
        text: "Discuss the role of education in personal and societal development. How has education evolved in the digital age?",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 10,
        examCategoryId: categoryId,
        correctAnswer: "Education develops critical thinking, skills, and knowledge essential for personal growth and societal progress. In the digital age, education has become more accessible through online platforms, personalized learning, and global connectivity. However, it also faces challenges like digital divide and information overload."
      },
      {
        text: "Explain the water cycle and its importance in maintaining Earth's climate and ecosystems.",
        type: "ESSAY",
        difficulty: "EASY",
        marks: 8,
        examCategoryId: categoryId,
        correctAnswer: "The water cycle involves evaporation, condensation, precipitation, and collection. Water evaporates from oceans and land, forms clouds, falls as rain/snow, and returns to water bodies. This cycle regulates Earth's temperature, distributes freshwater, and supports all life forms."
      },
      {
        text: "Analyze the impact of social media on modern communication and relationships. What are the positive and negative effects?",
        type: "ESSAY",
        difficulty: "HARD",
        marks: 15,
        examCategoryId: categoryId,
        correctAnswer: "Social media enables instant global communication, networking, and information sharing. Positive effects include staying connected with distant friends and accessing diverse perspectives. Negative effects include reduced face-to-face interaction, privacy concerns, and potential for misinformation and cyberbullying."
      },
      {
        text: "Describe the structure and function of the human heart. How does it maintain blood circulation throughout the body?",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 10,
        examCategoryId: categoryId,
        correctAnswer: "The heart has four chambers: two atria and two ventricles. It pumps oxygenated blood from the lungs to the body and deoxygenated blood back to the lungs. The cardiac cycle involves systole (contraction) and diastole (relaxation), maintaining continuous blood flow through arteries, capillaries, and veins."
      },
      {
        text: "Discuss the concept of sustainable development and its three pillars. Why is sustainability important for future generations?",
        type: "ESSAY",
        difficulty: "HARD",
        marks: 12,
        examCategoryId: categoryId,
        correctAnswer: "Sustainable development balances economic growth, social equity, and environmental protection. The three pillars are economic, social, and environmental sustainability. It's crucial for future generations because it ensures resource availability, reduces environmental degradation, and promotes social justice while maintaining economic prosperity."
      },
      {
        text: "Explain the difference between weather and climate. How do they affect human activities and natural ecosystems?",
        type: "ESSAY",
        difficulty: "EASY",
        marks: 8,
        examCategoryId: categoryId,
        correctAnswer: "Weather refers to short-term atmospheric conditions (temperature, precipitation, wind), while climate is long-term weather patterns over decades. Weather affects daily activities, agriculture, and transportation. Climate influences ecosystem distribution, species adaptation, and long-term planning for infrastructure and resource management."
      },
      {
        text: "Analyze the role of technology in modern healthcare. How has it improved patient care and what challenges does it present?",
        type: "ESSAY",
        difficulty: "HARD",
        marks: 15,
        examCategoryId: categoryId,
        correctAnswer: "Technology in healthcare includes telemedicine, AI diagnostics, electronic health records, and robotic surgery. It improves accuracy, accessibility, and efficiency of care. Challenges include high costs, privacy concerns, digital divide, and potential over-reliance on technology that may reduce human interaction in healthcare."
      }
    ];

    console.log(`📝 Adding ${essayQuestions.length} essay questions to category ${categoryId}...`);

    for (let i = 0; i < essayQuestions.length; i++) {
      const question = essayQuestions[i];
      
      try {
        const response = await axios.post(`${BASE_URL}/admin/questions`, question, { headers });
        
        if (response.data.success) {
          console.log(`✅ Question ${i + 1} added successfully: ${question.text.substring(0, 50)}...`);
        } else {
          console.log(`❌ Failed to add question ${i + 1}: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding question ${i + 1}: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('🎉 Essay questions addition completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

addEssayQuestions(); 