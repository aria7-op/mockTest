const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');
const examService = require('../services/examService');
const questionRandomizationService = require('../services/questionRandomizationService');
const { validateExamAttempt, validateQuestionResponse } = require('../validators/examValidator');

const prisma = new PrismaClient();

class ExamController {
  /**
   * Get available exams for students
   */
  async getAvailableExams(req, res) {
    try {
      const userId = req.user.id;
      const { examCategoryId, page = 1, limit = 10, search } = req.query;

      const exams = await examService.getAvailableExamsForUser(userId, {
        examCategoryId,
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });

      res.status(200).json({
        success: true,
        data: exams
      });
    } catch (error) {
      logger.error('Get available exams failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get available exams'
        }
      });
    }
  }

  /**
   * Get upcoming exams
   */
  async getUpcomingExams(req, res) {
    try {
      const upcomingExams = await prisma.exam.findMany({
        where: {
          isActive: true,
          isPublic: true,
          scheduledStart: {
            gte: new Date()
          }
        },
        include: {
          examCategory: {
            select: {
              name: true,
              color: true
            }
          }
        },
        orderBy: {
          scheduledStart: 'asc'
        },
        take: 10
      });

      // Send notifications to students about upcoming exams if they have bookings
      if (req.user && req.user.role === 'STUDENT') {
        try {
          // Get student's confirmed exam bookings
          const studentBookings = await prisma.examBooking.findMany({
            where: {
              userId: req.user.id,
              status: 'CONFIRMED',
              scheduledAt: {
                gte: new Date()
              }
            },
            include: {
              exam: {
                include: {
                  examCategory: true
                }
              }
            }
          });

          if (studentBookings.length > 0) {
            // Send upcoming exam notifications
            if (global.notificationService) {
              await global.notificationService.notifyUpcomingExams(req.user.id, studentBookings.map(b => b.exam));
            }
          }
        } catch (notificationError) {
          logger.warn('Failed to send upcoming exam notifications', notificationError);
          // Don't fail the main request if notifications fail
        }
      }

      res.status(200).json({
        success: true,
        data: { exams: upcomingExams }
      });
    } catch (error) {
      logger.error('Get upcoming exams failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get upcoming exams'
        }
      });
    }
  }

  /**
   * Get exam details
   */
  async getExamDetails(req, res) {
    try {
      const { examId } = req.params;
      const userId = req.user.id;

      const result = await examService.getExamById(examId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: {
            message: result.message || 'Exam not found'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: { exam: result.exam }
      });
    } catch (error) {
      logger.error('Get exam details failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam details'
        }
      });
    }
  }

  /**
   * Get exam categories
   */
  async getExamCategories(req, res) {
    try {
      const { isActive } = req.query;

      const where = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const categories = await prisma.examCategory.findMany({
        where,
        include: {
          _count: {
            select: {
              exams: {
                where: { isActive: true, isPublic: true }
              }
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      res.status(200).json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      logger.error('Get exam categories failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam categories'
        }
      });
    }
  }

  /**
   * Start exam attempt
   */
  async startExam(req, res) {
    try {
      const { examId } = req.params;
      const userId = req.user.id;

      const result = await examService.startExamAttempt(examId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // The exam service now returns questions with proper distribution
      // No need to call questionRandomizationService again
      const questions = result.questions || [];

      logger.info('Exam started with questions', {
        examId,
        userId,
        attemptId: result.attempt.id,
        questionsCount: questions.length,
        questionTypeDistribution: questions.reduce((acc, q) => {
          acc[q.type] = (acc[q.type] || 0) + 1;
          return acc;
        }, {})
      });

      // Emit WebSocket event for exam attempt started
      if (global.io) {
        global.io.to('admin-room').emit('exam-attempt-started', {
          userId: userId,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          examId: examId,
          examTitle: result.exam.title,
          attemptId: result.attempt.id,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exam started successfully',
        data: {
          attempt: result.attempt,
          exam: result.exam,
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            difficulty: q.difficulty,
            marks: q.marks,
            timeLimit: q.timeLimit,
            options: q.options?.map(opt => ({
              id: opt.id,
              text: opt.text
            })) || [],
            images: q.images || []
          })),
          duration: result.exam.duration,
          totalMarks: result.exam.totalMarks,
          startTime: result.attempt.startedAt
        }
      });
    } catch (error) {
      logger.error('Start exam failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to start exam'
        }
      });
    }
  }

  /**
   * Submit question response
   */
  async submitQuestionResponse(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;
      const { error, value } = validateQuestionResponse(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.details
          }
        });
      }

      const { questionId, selectedOptions, timeSpent, essayAnswer } = value;

      const result = await examService.submitQuestionResponse(
        attemptId,
        questionId,
        selectedOptions,
        timeSpent,
        userId,
        essayAnswer
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Response submitted successfully',
        data: {
          response: result.response,
          answerResult: result.answerResult
        }
      });
    } catch (error) {
      logger.error('Submit question response failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to submit response'
        }
      });
    }
  }

  /**
   * Complete exam attempt
   */
  async completeExam(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;
      const { error, value } = validateExamAttempt(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.details
          }
        });
      }

      // First, submit all responses to score them
      if (value.responses && Array.isArray(value.responses)) {
        for (const response of value.responses) {
          await examService.submitQuestionResponse(
            attemptId, 
            response.questionId, 
            response.selectedOptions || [], 
            response.timeSpent || 0, 
            userId,
            response.essayAnswer
          );
        }
      }

      // Then complete the exam attempt
      const result = await examService.completeExamAttempt(attemptId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Emit WebSocket event for exam attempt completed
      if (global.io) {
        global.io.to('admin-room').emit('exam-attempt-completed', {
          userId: userId,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          examId: result.attempt.examId,
          examTitle: result.attempt.exam?.title || 'Unknown Exam',
          attemptId: attemptId,
          score: result.results?.totalScore || 0,
          percentage: result.results?.percentage || 0,
          timestamp: new Date().toISOString()
        });

        // Emit to user's personal room
        global.io.to(`user-${userId}`).emit('exam-result-ready', {
          examId: result.attempt.examId,
          examTitle: result.attempt.exam?.title || 'Unknown Exam',
          attemptId: attemptId,
          score: result.results?.totalScore || 0,
          percentage: result.results?.percentage || 0,
          passed: result.results?.passed || false,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exam completed successfully',
        data: {
          attempt: result.attempt,
          results: result.results,
          certificate: result.certificate
        }
      });
    } catch (error) {
      logger.error('Complete exam failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to complete exam'
        }
      });
    }
  }

  /**
   * Get exam results
   */
  async getExamResults(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;

      const results = await examService.getExamResults(attemptId, userId);

      if (!results) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Exam results not found'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: { results }
      });
    } catch (error) {
      logger.error('Get exam results failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam results'
        }
      });
    }
  }

  /**
   * Get user's exam history
   */
  async getUserExamHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status, examCategoryId } = req.query;

      const history = await examService.getUserExamHistory(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        examCategoryId
      });

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Get user exam history failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam history'
        }
      });
    }
  }

  /**
   * Get exam attempt details
   */
  async getExamAttempt(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;

      const attempt = await examService.getExamAttempt(attemptId, userId);

      if (!attempt) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Exam attempt not found'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: { attempt }
      });
    } catch (error) {
      logger.error('Get exam attempt failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam attempt'
        }
      });
    }
  }

  /**
   * Resume exam attempt
   */
  async resumeExam(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;

      const result = await examService.resumeExamAttempt(attemptId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Exam resumed successfully',
        data: {
          attempt: result.attempt,
          remainingTime: result.remainingTime,
          currentQuestion: result.currentQuestion
        }
      });
    } catch (error) {
      logger.error('Resume exam failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to resume exam'
        }
      });
    }
  }

  /**
   * Get exam statistics for user
   */
  async getUserExamStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await examService.getUserExamStats(userId);

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get user exam stats failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam statistics'
        }
      });
    }
  }

  /**
   * Get exam leaderboard
   */
  async getExamLeaderboard(req, res) {
    try {
      const { examId } = req.params;
      const { limit = 10 } = req.query;

      const leaderboard = await examService.getExamLeaderboard(examId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: { leaderboard }
      });
    } catch (error) {
      logger.error('Get exam leaderboard failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get leaderboard'
        }
      });
    }
  }

  /**
   * Get exam certificates
   */
  async getUserCertificates(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const certificates = await examService.getUserCertificates(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.status(200).json({
        success: true,
        data: certificates
      });
    } catch (error) {
      logger.error('Get user certificates failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get certificates'
        }
      });
    }
  }

  /**
   * Generate certificate for an exam attempt
   */
  async generateCertificate(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;

      const result = await examService.generateCertificate(attemptId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Certificate generated successfully',
        data: { certificate: result.certificate }
      });
    } catch (error) {
      logger.error('Generate certificate failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate certificate'
        }
      });
    }
  }

  /**
   * Download certificate
   */
  async downloadCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const userId = req.user.id;

      const result = await examService.downloadCertificate(certificateId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.pdfBuffer.length);
      
      // Send the PDF buffer
      res.status(200).send(result.pdfBuffer);
    } catch (error) {
      logger.error('Download certificate failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to download certificate'
        }
      });
    }
  }

  /**
   * Auto-generate certificates for existing passed exams
   */
  async autoGenerateCertificates(req, res) {
    try {
      const userId = req.user.id;
      const result = await examService.autoGenerateCertificates(userId);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: { certificates: result.certificates }
      });
    } catch (error) {
      logger.error('Auto-generate certificates failed', error);
      res.status(500).json({
        success: false,
        error: { message: 'Internal server error' }
      });
    }
  }

  /**
   * Get exam recommendations
   */
  async getExamRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 5 } = req.query;

      const recommendations = await examService.getExamRecommendations(userId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: { recommendations }
      });
    } catch (error) {
      logger.error('Get exam recommendations failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get recommendations'
        }
      });
    }
  }

  /**
   * Get exam progress
   */
  async getExamProgress(req, res) {
    try {
      const { examId } = req.params;
      const userId = req.user.id;

      const progress = await examService.getExamProgress(examId, userId);

      res.status(200).json({
        success: true,
        data: { progress }
      });
    } catch (error) {
      logger.error('Get exam progress failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam progress'
        }
      });
    }
  }

  /**
   * Save exam progress
   */
  async saveExamProgress(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;
      const { currentQuestion, answers, timeSpent } = req.body;

      const result = await examService.saveExamProgress(attemptId, userId, {
        currentQuestion,
        answers,
        timeSpent
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Progress saved successfully',
        data: { progress: result.progress }
      });
    } catch (error) {
      logger.error('Save exam progress failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to save progress'
        }
      });
    }
  }

  /**
   * Get exam analytics for user
   */
  async getUserExamAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, examCategoryId } = req.query;

      const analytics = await examService.getUserExamAnalytics(userId, {
        startDate,
        endDate,
        examCategoryId
      });

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Get user exam analytics failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get exam analytics'
        }
      });
    }
  }

  /**
   * Report exam issue
   */
  async reportExamIssue(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;
      const { issueType, description, questionId } = req.body;

      const result = await examService.reportExamIssue(attemptId, userId, {
        issueType,
        description,
        questionId
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Issue reported successfully',
        data: { report: result.report }
      });
    } catch (error) {
      logger.error('Report exam issue failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to report issue'
        }
      });
    }
  }
}

module.exports = new ExamController(); 