const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function addEssayQuestions() {
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mocktest.com',
      password: 'Admin@123'
    });

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };
    const categoryId = 'cmdyb4pji0000i2ovlel4fmju';
    
    const essayQuestions = [
      {
        text: "Explain the concept of artificial intelligence and its impact on modern society.",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 10,
        examCategoryId: categoryId,
        options: [{ text: "AI refers to simulation of human intelligence in machines. Benefits: automation, healthcare, productivity. Challenges: job displacement, privacy, ethics.", isCorrect: true }]
      },
      {
        text: "Describe the process of photosynthesis and its importance.",
        type: "ESSAY",
        difficulty: "EASY",
        marks: 8,
        examCategoryId: categoryId,
        options: [{ text: "Plants convert sunlight, CO2, water into glucose and oxygen using chlorophyll. Essential for oxygen production and food chain.", isCorrect: true }]
      },
      {
        text: "Compare renewable and non-renewable energy sources.",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 12,
        examCategoryId: categoryId,
        options: [{ text: "Renewable: solar, wind, hydro - replenished, eco-friendly. Non-renewable: fossil fuels - finite, polluting. Renewable more important for future.", isCorrect: true }]
      },
      {
        text: "Discuss education's role in personal and societal development.",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 10,
        examCategoryId: categoryId,
        options: [{ text: "Education develops critical thinking and skills for personal growth and societal progress. Digital age: online platforms, personalized learning, global connectivity.", isCorrect: true }]
      },
      {
        text: "Explain the water cycle and its importance.",
        type: "ESSAY",
        difficulty: "EASY",
        marks: 8,
        examCategoryId: categoryId,
        options: [{ text: "Evaporation, condensation, precipitation, collection. Regulates temperature, distributes freshwater, supports all life forms.", isCorrect: true }]
      },
      {
        text: "Analyze social media's impact on communication and relationships.",
        type: "ESSAY",
        difficulty: "HARD",
        marks: 15,
        examCategoryId: categoryId,
        options: [{ text: "Enables instant global communication and networking. Positive: staying connected, diverse perspectives. Negative: reduced face-to-face interaction, privacy concerns, misinformation.", isCorrect: true }]
      },
      {
        text: "Describe the human heart structure and function.",
        type: "ESSAY",
        difficulty: "MEDIUM",
        marks: 10,
        examCategoryId: categoryId,
        options: [{ text: "Four chambers: two atria, two ventricles. Pumps oxygenated blood to body, deoxygenated to lungs. Cardiac cycle: systole and diastole.", isCorrect: true }]
      },
      {
        text: "Discuss sustainable development and its three pillars.",
        type: "ESSAY",
        difficulty: "HARD",
        marks: 12,
        examCategoryId: categoryId,
        options: [{ text: "Balances economic growth, social equity, environmental protection. Three pillars: economic, social, environmental sustainability. Crucial for future generations.", isCorrect: true }]
      },
      {
        text: "Explain the difference between weather and climate.",
        type: "ESSAY",
        difficulty: "EASY",
        marks: 8,
        examCategoryId: categoryId,
        options: [{ text: "Weather: short-term atmospheric conditions. Climate: long-term weather patterns over decades. Weather affects daily activities, climate influences ecosystems.", isCorrect: true }]
      },
      {
        text: "Analyze technology's role in modern healthcare.",
        type: "ESSAY",
        difficulty: "HARD",
        marks: 15,
        examCategoryId: categoryId,
        options: [{ text: "Includes telemedicine, AI diagnostics, electronic records, robotic surgery. Improves accuracy, accessibility, efficiency. Challenges: high costs, privacy, digital divide.", isCorrect: true }]
      }
    ];

    console.log(`📝 Adding ${essayQuestions.length} essay questions...`);

    for (let i = 0; i < essayQuestions.length; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/admin/questions`, essayQuestions[i], { headers });
        if (response.data.success) {
          console.log(`✅ Question ${i + 1} added`);
        } else {
          console.log(`❌ Failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('🎉 Done!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

addEssayQuestions(); 