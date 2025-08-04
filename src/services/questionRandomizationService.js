const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class QuestionRandomizationService {
  constructor() {
    this.algorithm = process.env.QUESTION_RANDOMIZATION_ALGORITHM || 'weighted_random';
  }

  /**
   * Generate random questions for an exam with advanced algorithms
   * @param {Object} params - Parameters for question generation
   * @param {string} params.examId - Exam ID
   * @param {string} params.userId - User ID
   * @param {number} params.questionCount - Number of questions needed
   * @param {string} params.examCategoryId - Exam category ID
   * @param {number} params.overlapPercentage - Maximum overlap percentage allowed
   * @returns {Array} Array of selected questions
   */
  async generateRandomQuestions(params) {
    const {
      examId,
      userId,
      questionCount,
      examCategoryId,
      overlapPercentage = 10.0
    } = params;

    try {
      logger.info('Generating random questions', {
        examId,
        userId,
        questionCount,
        examCategoryId,
        overlapPercentage,
        algorithm: this.algorithm
      });

      // Get all available questions for the exam category
      const availableQuestions = await this.getAvailableQuestions(examCategoryId);
      
      logger.info('Available questions found', {
        examCategoryId,
        availableCount: availableQuestions.length,
        requiredCount: questionCount
      });
      
      if (availableQuestions.length < questionCount) {
        throw new Error(`Not enough questions available. Need ${questionCount}, have ${availableQuestions.length}`);
      }

      // Get user's previous attempts to calculate overlap
      const userHistory = await this.getUserQuestionHistory(userId, examCategoryId);
      
      // Apply different algorithms based on configuration
      let selectedQuestions;
      
      switch (this.algorithm) {
        case 'weighted_random':
          selectedQuestions = await this.weightedRandomSelection(
            availableQuestions,
            userHistory,
            questionCount,
            overlapPercentage
          );
          break;
          
        case 'difficulty_balanced':
          selectedQuestions = await this.difficultyBalancedSelection(
            availableQuestions,
            userHistory,
            questionCount,
            overlapPercentage
          );
          break;
          
        case 'usage_based':
          selectedQuestions = await this.usageBasedSelection(
            availableQuestions,
            userHistory,
            questionCount,
            overlapPercentage
          );
          break;
          
        case 'adaptive':
          selectedQuestions = await this.adaptiveSelection(
            availableQuestions,
            userHistory,
            questionCount,
            overlapPercentage
          );
          break;
          
        default:
          selectedQuestions = await this.weightedRandomSelection(
            availableQuestions,
            userHistory,
            questionCount,
            overlapPercentage
          );
      }

      // Log the selection for analytics
      await this.logQuestionSelection(examId, userId, selectedQuestions);

      logger.info('Question generation completed', {
        examId,
        userId,
        selectedCount: selectedQuestions.length,
        overlapCount: this.calculateOverlap(selectedQuestions, userHistory)
      });

      return selectedQuestions;
    } catch (error) {
      logger.error('Question generation failed', {
        examId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get available questions for an exam category
   */
  async getAvailableQuestions(examCategoryId) {
    return await prisma.question.findMany({
      where: {
        examCategoryId,
        isActive: true,
        isPublic: true
        // Temporarily removed approvedBy requirement for testing
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' }
        },
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        tags: true
      },
      orderBy: [
        { usageCount: 'asc' },
        { correctAnswerRate: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Get user's question history for overlap calculation
   */
  async getUserQuestionHistory(userId, examCategoryId) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        exam: {
          examCategoryId
        },
        status: 'COMPLETED'
      },
      include: {
        responses: {
          include: {
            question: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Consider last 10 attempts
    });

    const questionHistory = new Map();
    
    attempts.forEach(attempt => {
      attempt.responses.forEach(response => {
        const questionId = response.questionId;
        if (!questionHistory.has(questionId)) {
          questionHistory.set(questionId, {
            count: 0,
            lastUsed: response.answeredAt,
            performance: response.isCorrect ? 1 : 0
          });
        }
        
        const history = questionHistory.get(questionId);
        history.count++;
        history.lastUsed = response.answeredAt;
        history.performance = (history.performance + (response.isCorrect ? 1 : 0)) / 2;
      });
    });

    return questionHistory;
  }

  /**
   * Weighted random selection algorithm
   */
  async weightedRandomSelection(questions, userHistory, count, maxOverlap) {
    const weights = questions.map(question => {
      let weight = 1.0;
      
      // Reduce weight for recently used questions
      if (userHistory.has(question.id)) {
        const history = userHistory.get(question.id);
        const daysSinceLastUse = (Date.now() - new Date(history.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastUse < 7) {
          weight *= 0.1; // Very low weight for questions used in last week
        } else if (daysSinceLastUse < 30) {
          weight *= 0.3; // Low weight for questions used in last month
        } else if (daysSinceLastUse < 90) {
          weight *= 0.6; // Medium weight for questions used in last 3 months
        }
        
        // Reduce weight based on usage count
        weight *= Math.max(0.1, 1 - (history.count * 0.2));
      }
      
      // Increase weight for less used questions
      weight *= (1 + (100 - question.usageCount) / 100);
      
      // Adjust weight based on difficulty (prefer medium difficulty)
      if (question.difficulty === 'MEDIUM') {
        weight *= 1.2;
      } else if (question.difficulty === 'EASY') {
        weight *= 0.9;
      } else if (question.difficulty === 'HARD') {
        weight *= 0.8;
      }
      
      return weight;
    });

    return this.selectWithOverlapControl(questions, weights, count, userHistory, maxOverlap);
  }

  /**
   * Difficulty balanced selection algorithm
   */
  async difficultyBalancedSelection(questions, userHistory, count, maxOverlap) {
    const difficultyDistribution = {
      EASY: Math.floor(count * 0.2),
      MEDIUM: Math.floor(count * 0.5),
      HARD: Math.floor(count * 0.2),
      EXPERT: Math.floor(count * 0.1)
    };

    const selectedQuestions = [];
    const questionsByDifficulty = this.groupQuestionsByDifficulty(questions);

    for (const [difficulty, targetCount] of Object.entries(difficultyDistribution)) {
      const availableQuestions = questionsByDifficulty[difficulty] || [];
      const weights = availableQuestions.map(q => this.calculateDifficultyWeight(q, userHistory));
      
      const difficultyQuestions = this.selectWithOverlapControl(
        availableQuestions,
        weights,
        Math.min(targetCount, availableQuestions.length),
        userHistory,
        maxOverlap
      );
      
      selectedQuestions.push(...difficultyQuestions);
    }

    // Fill remaining slots with any available questions
    const remainingCount = count - selectedQuestions.length;
    if (remainingCount > 0) {
      const remainingQuestions = questions.filter(q => !selectedQuestions.find(sq => sq.id === q.id));
      const weights = remainingQuestions.map(q => this.calculateDifficultyWeight(q, userHistory));
      
      const additionalQuestions = this.selectWithOverlapControl(
        remainingQuestions,
        weights,
        Math.min(remainingCount, remainingQuestions.length),
        userHistory,
        maxOverlap
      );
      
      selectedQuestions.push(...additionalQuestions);
    }

    return selectedQuestions.slice(0, count);
  }

  /**
   * Usage-based selection algorithm
   */
  async usageBasedSelection(questions, userHistory, count, maxOverlap) {
    // Sort questions by usage count (ascending) and add some randomness
    const sortedQuestions = [...questions].sort((a, b) => {
      const usageDiff = a.usageCount - b.usageCount;
      if (Math.abs(usageDiff) < 5) {
        return Math.random() - 0.5; // Add randomness for similar usage counts
      }
      return usageDiff;
    });

    const weights = sortedQuestions.map((question, index) => {
      let weight = 1.0;
      
      // Higher weight for less used questions
      weight *= (1 + (questions.length - index) / questions.length);
      
      // Reduce weight for recently used questions
      if (userHistory.has(question.id)) {
        weight *= 0.1;
      }
      
      return weight;
    });

    return this.selectWithOverlapControl(sortedQuestions, weights, count, userHistory, maxOverlap);
  }

  /**
   * Adaptive selection algorithm based on user performance
   */
  async adaptiveSelection(questions, userHistory, count, maxOverlap) {
    const weights = questions.map(question => {
      let weight = 1.0;
      
      if (userHistory.has(question.id)) {
        const history = userHistory.get(question.id);
        
        // If user performed poorly, give higher weight for retry
        if (history.performance < 0.5) {
          weight *= 1.5;
        } else if (history.performance > 0.8) {
          weight *= 0.3; // Lower weight for questions user answered well
        }
        
        // Reduce weight based on recent usage
        const daysSinceLastUse = (Date.now() - new Date(history.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastUse < 30) {
          weight *= 0.2;
        }
      }
      
      return weight;
    });

    return this.selectWithOverlapControl(questions, weights, count, userHistory, maxOverlap);
  }

  /**
   * Select questions with overlap control
   */
  selectWithOverlapControl(questions, weights, count, userHistory, maxOverlap) {
    const selectedQuestions = [];
    const maxOverlapCount = Math.floor(count * (maxOverlap / 100));
    let overlapCount = 0;

    // Create a copy of questions and weights for selection
    const questionPool = [...questions];
    const weightPool = [...weights];

    while (selectedQuestions.length < count && questionPool.length > 0) {
      // Calculate total weight
      const totalWeight = weightPool.reduce((sum, weight) => sum + weight, 0);
      
      if (totalWeight <= 0) break;

      // Select random question based on weights
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;

      for (let i = 0; i < weightPool.length; i++) {
        random -= weightPool[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }

      const selectedQuestion = questionPool[selectedIndex];
      const isOverlap = userHistory.has(selectedQuestion.id);

      // Check overlap limit
      if (isOverlap && overlapCount >= maxOverlapCount) {
        // Remove this question from pool and continue
        questionPool.splice(selectedIndex, 1);
        weightPool.splice(selectedIndex, 1);
        continue;
      }

      // Add question to selection
      selectedQuestions.push(selectedQuestion);
      if (isOverlap) overlapCount++;

      // Remove selected question from pool
      questionPool.splice(selectedIndex, 1);
      weightPool.splice(selectedIndex, 1);
    }

    return selectedQuestions;
  }

  /**
   * Calculate difficulty-based weight
   */
  calculateDifficultyWeight(question, userHistory) {
    let weight = 1.0;
    
    if (userHistory.has(question.id)) {
      weight *= 0.1; // Very low weight for previously used questions
    }
    
    // Adjust weight based on difficulty
    switch (question.difficulty) {
      case 'EASY':
        weight *= 0.9;
        break;
      case 'MEDIUM':
        weight *= 1.2;
        break;
      case 'HARD':
        weight *= 0.8;
        break;
      case 'EXPERT':
        weight *= 0.6;
        break;
    }
    
    return weight;
  }

  /**
   * Group questions by difficulty
   */
  groupQuestionsByDifficulty(questions) {
    return questions.reduce((groups, question) => {
      const difficulty = question.difficulty;
      if (!groups[difficulty]) {
        groups[difficulty] = [];
      }
      groups[difficulty].push(question);
      return groups;
    }, {});
  }

  /**
   * Calculate overlap between selected questions and user history
   */
  calculateOverlap(selectedQuestions, userHistory) {
    return selectedQuestions.filter(question => userHistory.has(question.id)).length;
  }

  /**
   * Log question selection for analytics
   */
  async logQuestionSelection(examId, userId, questions) {
    try {
      // Update question usage counts
      const questionIds = questions.map(q => q.id);
      
      await prisma.question.updateMany({
        where: { id: { in: questionIds } },
        data: {
          usageCount: {
            increment: 1
          }
        }
      });

      // Log to audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'QUESTION_SELECTION',
          resource: 'EXAM',
          resourceId: examId,
          details: {
            questionCount: questions.length,
            questionIds,
            algorithm: this.algorithm,
            timestamp: new Date().toISOString()
          },
          ipAddress: 'system',
          userAgent: 'question-randomization-service'
        }
      });
    } catch (error) {
      logger.error('Failed to log question selection', error);
    }
  }

  /**
   * Get questions for a specific exam attempt
   * @param {string} attemptId - Attempt ID
   * @param {string} examId - Exam ID
   * @param {string} userId - User ID
   * @returns {Array} Array of questions for the attempt
   */
  async getQuestionsForAttempt(attemptId, examId, userId) {
    try {
      logger.info('Getting questions for attempt', { attemptId, examId, userId });

      // Get the exam to determine question count and category
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: { 
          questionCount: true, 
          examCategoryId: true,
          questionOverlapPercentage: true
        }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Generate random questions for this attempt
      const questions = await this.generateRandomQuestions({
        examId,
        userId,
        questionCount: exam.questionCount || 10, // Default to 10 if not specified
        examCategoryId: exam.examCategoryId,
        overlapPercentage: exam.questionOverlapPercentage || 10.0
      });

      return questions;
    } catch (error) {
      logger.error('Get questions for attempt failed', error);
      throw error;
    }
  }

  /**
   * Get question statistics for analytics
   */
  async getQuestionStatistics(examCategoryId) {
    const stats = await prisma.question.groupBy({
      by: ['difficulty'],
      where: {
        examCategoryId,
        isActive: true
      },
      _count: {
        id: true
      },
      _avg: {
        usageCount: true,
        correctAnswerRate: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.difficulty] = {
        count: stat._count.id,
        avgUsage: stat._avg.usageCount,
        avgCorrectRate: stat._avg.correctAnswerRate
      };
      return acc;
    }, {});
  }
}

module.exports = new QuestionRandomizationService(); 