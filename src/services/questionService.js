const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class QuestionService {
  /**
   * Create new question
   */
  async createQuestion(questionData, createdBy) {
    try {
      const {
        text,
        type,
        difficulty,
        marks,
        timeLimit,
        examCategoryId,
        explanation,
        tags,
        images,
        options
      } = questionData;

      // Validate exam category exists
      const category = await prisma.examCategory.findUnique({
        where: { id: examCategoryId }
      });

      if (!category) {
        return { success: false, message: 'Exam category not found' };
      }

      // Create question with options
      const question = await prisma.question.create({
        data: {
          text,
          type,
          difficulty,
          marks,
          timeLimit,
          examCategoryId,
          explanation,
          tags,
          images,
          createdBy,
          options: {
            create: options.map(option => ({
              text: option.text,
              isCorrect: option.isCorrect,
              explanation: option.explanation
            }))
          }
        },
        include: {
          options: true,
          examCategory: {
            select: { name: true }
          }
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'QUESTION_CREATED',
          resource: 'QUESTION',
          resourceId: question.id,
          details: {
            questionText: text.substring(0, 100) + '...',
            category: category.name,
            difficulty,
            type
          },
          ipAddress: 'system',
          userAgent: 'question-service'
        }
      });

      return { success: true, question };
    } catch (error) {
      logger.error('Create question failed', error);
      return { success: false, message: 'Failed to create question' };
    }
  }

  /**
   * Get all questions with filters
   */
  async getAllQuestions(options = {}) {
    const { page = 1, limit = 20, examCategoryId, difficulty, type, isActive, search } = options;
    const skip = (page - 1) * limit;

    try {
      const where = {};

      if (examCategoryId) {
        where.examCategoryId = examCategoryId;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (type) {
        where.type = type;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          { text: { contains: search, mode: 'insensitive' } },
          { explanation: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ];
      }

      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          include: {
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true
              }
            },
            examCategory: {
              select: { name: true, color: true }
            },
            _count: {
              select: {
                responses: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.question.count({ where })
      ]);

      return {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Get all questions failed', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          options: true,
          examCategory: {
            select: { name: true }
          }
        }
      });

      return question;
    } catch (error) {
      logger.error('Get question by ID failed', error);
      throw error;
    }
  }

  /**
   * Update question
   */
  async updateQuestion(questionId, updateData, updatedBy) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true }
      });

      if (!question) {
        return { success: false, message: 'Question not found' };
      }

      // Handle options update
      if (updateData.options) {
        // Delete existing options
        await prisma.questionOption.deleteMany({
          where: { questionId }
        });

        // Create new options
        updateData.options = {
          create: updateData.options.map(option => ({
            text: option.text,
            isCorrect: option.isCorrect,
            explanation: option.explanation
          }))
        };
      }

      const updatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: updateData,
        include: {
          options: true,
          examCategory: {
            select: { name: true }
          }
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'QUESTION_UPDATED',
          resource: 'QUESTION',
          resourceId: questionId,
          details: {
            questionText: question.text.substring(0, 100) + '...',
            updatedFields: Object.keys(updateData)
          },
          ipAddress: 'system',
          userAgent: 'question-service'
        }
      });

      return { success: true, question: updatedQuestion };
    } catch (error) {
      logger.error('Update question failed', error);
      return { success: false, message: 'Failed to update question' };
    }
  }

  /**
   * Delete question
   */
  async deleteQuestion(questionId, deletedBy) {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          _count: {
            select: {
              questionResponses: true
            }
          }
        }
      });

      if (!question) {
        return { success: false, message: 'Question not found' };
      }

      if (question._count.questionResponses > 0) {
        return { success: false, message: 'Cannot delete question with existing responses' };
      }

      await prisma.question.delete({
        where: { id: questionId }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: deletedBy,
          action: 'QUESTION_DELETED',
          resource: 'QUESTION',
          resourceId: questionId,
          details: {
            questionText: question.text.substring(0, 100) + '...'
          },
          ipAddress: 'system',
          userAgent: 'question-service'
        }
      });

      return { success: true };
    } catch (error) {
      logger.error('Delete question failed', error);
      return { success: false, message: 'Failed to delete question' };
    }
  }

  /**
   * Bulk import questions
   */
  async bulkImportQuestions(questions, importedBy) {
    try {
      const results = {
        successful: [],
        failed: [],
        total: questions.length
      };

      for (const questionData of questions) {
        try {
          const result = await this.createQuestion(questionData, importedBy);
          if (result.success) {
            results.successful.push(result.question);
          } else {
            results.failed.push({
              text: questionData.text?.substring(0, 50) + '...',
              error: result.message
            });
          }
        } catch (error) {
          results.failed.push({
            text: questionData.text?.substring(0, 50) + '...',
            error: error.message
          });
        }
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: importedBy,
          action: 'BULK_QUESTION_IMPORT',
          resource: 'QUESTION',
          resourceId: null,
          details: {
            totalQuestions: results.total,
            successful: results.successful.length,
            failed: results.failed.length
          },
          ipAddress: 'system',
          userAgent: 'question-service'
        }
      });

      return results;
    } catch (error) {
      logger.error('Bulk import questions failed', error);
      throw error;
    }
  }

  /**
   * Get question analytics
   */
  async getQuestionAnalytics(options = {}) {
    const { examCategoryId, startDate, endDate } = options;

    try {
      const where = {};

      if (examCategoryId) {
        where.examCategoryId = examCategoryId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [
        totalQuestions,
        questionsByDifficulty,
        questionsByType,
        questionsByCategory,
        averageMarks,
        responseStats
      ] = await Promise.all([
        prisma.question.count({ where }),
        prisma.question.groupBy({
          by: ['difficulty'],
          where,
          _count: { id: true }
        }),
        prisma.question.groupBy({
          by: ['type'],
          where,
          _count: { id: true }
        }),
        prisma.question.groupBy({
          by: ['examCategoryId'],
          where,
          _count: { id: true }
        }),
        prisma.question.aggregate({
          where,
          _avg: { marks: true }
        }),
        prisma.questionResponse.groupBy({
          by: ['questionId'],
          where: {
            question: where
          },
          _count: { id: true },
          _avg: { timeSpent: true }
        })
      ]);

      return {
        totalQuestions,
        questionsByDifficulty: questionsByDifficulty.reduce((acc, item) => {
          acc[item.difficulty] = item._count.id;
          return acc;
        }, {}),
        questionsByType: questionsByType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {}),
        questionsByCategory: questionsByCategory.reduce((acc, item) => {
          acc[item.examCategoryId] = item._count.id;
          return acc;
        }, {}),
        averageMarks: averageMarks._avg.marks || 0,
        averageResponseTime: responseStats.length > 0 
          ? responseStats.reduce((sum, stat) => sum + (stat._avg.timeSpent || 0), 0) / responseStats.length 
          : 0
      };
    } catch (error) {
      logger.error('Get question analytics failed', error);
      throw error;
    }
  }

  /**
   * Get questions for exam
   */
  async getQuestionsForExam(examId, count) {
    try {
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          examCategory: true
        }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      // Get questions based on exam configuration
      const where = {
        examCategoryId: exam.examCategoryId,
        isActive: true
      };

      if (exam.difficultyDistribution) {
        // Apply difficulty distribution if specified
        const distribution = exam.difficultyDistribution;
        const difficulties = [];
        
        if (distribution.easy) {
          difficulties.push(...Array(distribution.easy).fill('EASY'));
        }
        if (distribution.medium) {
          difficulties.push(...Array(distribution.medium).fill('MEDIUM'));
        }
        if (distribution.hard) {
          difficulties.push(...Array(distribution.hard).fill('HARD'));
        }
        
        where.difficulty = { in: difficulties };
      }

      const questions = await prisma.question.findMany({
        where,
        include: {
          options: {
            select: {
              id: true,
              text: true
            }
          }
        },
        take: count || exam.questionCount
      });

      return questions;
    } catch (error) {
      logger.error('Get questions for exam failed', error);
      throw error;
    }
  }

  /**
   * Get question statistics
   */
  async getQuestionStats(questionId) {
    try {
      const [
        totalResponses,
        correctResponses,
        averageTime,
        difficultyStats
      ] = await Promise.all([
        prisma.questionResponse.count({
          where: { questionId }
        }),
        prisma.questionResponse.count({
          where: {
            questionId,
            question: {
              options: {
                some: {
                  id: { in: { selectedOptions: true } },
                  isCorrect: true
                }
              }
            }
          }
        }),
        prisma.questionResponse.aggregate({
          where: { questionId },
          _avg: { timeSpent: true }
        }),
        prisma.questionResponse.groupBy({
          by: ['selectedOptions'],
          where: { questionId },
          _count: { id: true }
        })
      ]);

      return {
        totalResponses,
        correctResponses,
        accuracy: totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
        averageTime: averageTime._avg.timeSpent || 0,
        optionStats: difficultyStats.map(stat => ({
          selectedOptions: stat.selectedOptions,
          count: stat._count.id
        }))
      };
    } catch (error) {
      logger.error('Get question stats failed', error);
      throw error;
    }
  }

  /**
   * Search questions
   */
  async searchQuestions(searchTerm, options = {}) {
    const { page = 1, limit = 20, examCategoryId, difficulty, type } = options;
    const skip = (page - 1) * limit;

    try {
      const where = {
        OR: [
          { text: { contains: searchTerm, mode: 'insensitive' } },
          { explanation: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm } }
        ],
        isActive: true
      };

      if (examCategoryId) {
        where.examCategoryId = examCategoryId;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (type) {
        where.type = type;
      }

      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          include: {
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true
              }
            },
            examCategory: {
              select: { name: true, color: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.question.count({ where })
      ]);

      return {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Search questions failed', error);
      throw error;
    }
  }
}

module.exports = QuestionService; 