const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');
const ExamBookingService = require('../services/examBookingService');
const questionRandomizationService = require('../services/questionRandomizationService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const { validateExamBooking, validateBookingUpdate } = require('../validators/examBookingValidator');

const prisma = new PrismaClient();
const examBookingService = new ExamBookingService();




class ExamBookingController {
  /**
   * Create a new exam booking with randomized questions
   */
  async createBooking(req, res) {
    try {
      // Validate request
      const { error, value } = validateExamBooking(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.details
          }
        });
      }

      const { examId, scheduledAt, notes } = value;
      const userId = req.user.id;

      // Check if user can book this exam
      const canBook = await examBookingService.canUserBookExam(userId, examId);
      if (!canBook.success) {
        return res.status(400).json(canBook);
      }

      // Get exam details
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          examCategory: true,
          questions: {
            include: {
              question: true
            }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Exam not found'
          }
        });
      }

      // Check if exam is available for booking
      if (!exam.isActive || !exam.isPublic) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Exam is not available for booking'
          }
        });
      }

      // Check scheduling constraints
      if (scheduledAt) {
        const schedulingValidation = await examBookingService.validateScheduling(examId, scheduledAt);
        if (!schedulingValidation.success) {
          return res.status(400).json(schedulingValidation);
        }
      }

      // Calculate total amount
      const totalAmount = exam.price;

      // Create booking with transaction
      const booking = await prisma.$transaction(async (tx) => {
        // Create the booking
        const newBooking = await tx.examBooking.create({
          data: {
            userId,
            examId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            status: 'PENDING',
            totalAmount,
            currency: exam.currency,
            notes
          },
          include: {
            exam: {
              include: {
                examCategory: true
              }
            },
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        // Generate randomized questions for this specific booking
        const questionCount = exam.questions.length;
        const randomizedQuestions = await questionRandomizationService.generateRandomQuestions({
          examId,
          userId,
          questionCount,
          examCategoryId: exam.examCategoryId,
          overlapPercentage: exam.questionOverlapPercentage
        });

        // Create exam questions for this booking with randomization
        const examQuestions = randomizedQuestions.map((question, index) => ({
          examId,
          questionId: question.id,
          order: index + 1,
          marks: question.marks
        }));

        await tx.examQuestion.createMany({
          data: examQuestions
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'EXAM_BOOKING_CREATED',
            resource: 'EXAM_BOOKING',
            resourceId: newBooking.id,
            details: {
              examId,
              examTitle: exam.title,
              totalAmount,
              questionCount: randomizedQuestions.length,
              scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
              randomizationAlgorithm: process.env.QUESTION_RANDOMIZATION_ALGORITHM || 'weighted_random'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });

        return {
          booking: newBooking,
          questionCount: randomizedQuestions.length
        };
      });

      // Generate bill for the booking
      const billingService = require('../services/billingService');
      const bill = await billingService.generateBill(booking.booking.id);

      // Send notification
      await notificationService.sendBookingConfirmation(booking.booking.user.email, {
        bookingId: booking.booking.id,
        examTitle: booking.booking.exam.title,
        scheduledAt: booking.booking.scheduledAt,
        totalAmount: booking.booking.totalAmount,
        currency: booking.booking.currency,
        firstName: booking.booking.user.firstName
      });

      // Log the booking creation
      logger.logExam('BOOKING_CREATED', examId, userId, {
        bookingId: booking.booking.id,
        questionCount: booking.questionCount,
        totalAmount: booking.booking.totalAmount
      });

      // Emit WebSocket event for booking created
      if (global.io) {
        global.io.to('admin-room').emit('booking-created', {
          userId: userId,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          examId: examId,
          examTitle: booking.booking.exam.title,
          bookingId: booking.booking.id,
          totalAmount: booking.booking.totalAmount,
          currency: booking.booking.currency,
          timestamp: new Date().toISOString()
        });
      }

      res.status(201).json({
        success: true,
        message: 'Exam booking created successfully',
        data: {
          booking: booking.booking,
          questionCount: booking.questionCount,
          requiresPayment: booking.booking.status === 'PENDING',
          bill: bill
        }
      });
    } catch (error) {
      logger.error('Exam booking creation failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create exam booking'
        }
      });
    }
  }

  /**
   * Get user's exam bookings
   */
  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status, examCategoryId } = req.query;

      const bookings = await examBookingService.getUserBookings(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        examCategoryId
      });

      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      logger.error('Get user bookings failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get bookings'
        }
      });
    }
  }

  /**
   * Get specific booking details
   */
  async getBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const booking = await examBookingService.getBookingDetails(bookingId, userId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Booking not found'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: { booking }
      });
    } catch (error) {
      logger.error('Get booking details failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get booking details'
        }
      });
    }
  }

  /**
   * Update booking
   */
  async updateBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      // Validate request
      const { error, value } = validateBookingUpdate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.details
          }
        });
      }

      const { scheduledAt, notes } = value;

      const result = await examBookingService.updateBooking(bookingId, userId, {
        scheduledAt,
        notes
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: { booking: result.booking }
      });
    } catch (error) {
      logger.error('Update booking failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update booking'
        }
      });
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      const result = await examBookingService.cancelBooking(bookingId, userId, reason);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Send cancellation notification
      await notificationService.sendBookingCancellation(result.booking.user.email, {
        bookingId: result.booking.id,
        examTitle: result.booking.exam.title,
        cancellationReason: reason,
        firstName: result.booking.user.firstName
      });

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: { booking: result.booking }
      });
    } catch (error) {
      logger.error('Cancel booking failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to cancel booking'
        }
      });
    }
  }

  /**
   * Start exam attempt
   */
  async startExam(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const result = await examBookingService.startExamAttempt(bookingId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Get randomized questions for this attempt
      const questions = await questionRandomizationService.getQuestionsForAttempt(
        result.attempt.id,
        result.booking.examId,
        userId
      );

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
            options: q.options.map(opt => ({
              id: opt.id,
              text: opt.text
            })),
            images: q.images
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
   * Get available exams for booking
   */
  async getAvailableExams(req, res) {
    try {
      const userId = req.user.id;
      const { examCategoryId, page = 1, limit = 10 } = req.query;

      const exams = await examBookingService.getAvailableExams(userId, {
        examCategoryId,
        page: parseInt(page),
        limit: parseInt(limit)
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
   * Get booking statistics
   */
  async getBookingStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await examBookingService.getUserBookingStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get booking stats failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get booking statistics'
        }
      });
    }
  }

  /**
   * Admin: Get all bookings
   */
  async getAllBookings(req, res) {
    try {
      const { page = 1, limit = 20, status, examCategoryId, userId, startDate, endDate } = req.query;

      const bookings = await examBookingService.getAllBookings({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        examCategoryId,
        userId,
        startDate,
        endDate
      });

      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      logger.error('Get all bookings failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get bookings'
        }
      });
    }
  }

  /**
   * Admin: Update booking status
   */
  async updateBookingStatus(req, res) {
    try {
      const { bookingId } = req.params;
      const { status, notes } = req.body;
      const adminId = req.user.id;

      const result = await examBookingService.updateBookingStatus(bookingId, status, notes, adminId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: { booking: result.booking }
      });
    } catch (error) {
      logger.error('Update booking status failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update booking status'
        }
      });
    }
  }

  /**
   * Admin: Create booking for user
   */
  async createBookingForUser(req, res) {
    try {
      // Validate request
      const { error, value } = validateExamBooking(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.details
          }
        });
      }

      const { userId, examId, scheduledAt, notes } = value;
      const adminId = req.user.id;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found'
          }
        });
      }

      // Check if user can book this exam
      const canBook = await examBookingService.canUserBookExam(userId, examId);
      if (!canBook.success) {
        return res.status(400).json(canBook);
      }

      // Get exam details
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          examCategory: true,
          questions: {
            include: {
              question: true
            }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Exam not found'
          }
        });
      }

      // Check if exam is available for booking
      if (!exam.isActive || !exam.isPublic) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Exam is not available for booking'
          }
        });
      }

      // Check scheduling constraints
      if (scheduledAt) {
        const schedulingValidation = await examBookingService.validateScheduling(examId, scheduledAt);
        if (!schedulingValidation.success) {
          return res.status(400).json(schedulingValidation);
        }
      }

      // Calculate total amount
      const totalAmount = exam.price;

      // Create booking with transaction
      const booking = await prisma.$transaction(async (tx) => {
        // Create the booking
        const newBooking = await tx.examBooking.create({
          data: {
            userId,
            examId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            status: 'CONFIRMED', // Admin bookings are automatically confirmed
            totalAmount,
            currency: exam.currency,
            notes
          },
          include: {
            exam: {
              include: {
                examCategory: true
              }
            },
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        // Generate randomized questions for this specific booking
        const questionCount = exam.questions.length;
        const randomizedQuestions = await questionRandomizationService.generateRandomQuestions({
          examId,
          userId,
          questionCount,
          examCategoryId: exam.examCategoryId,
          overlapPercentage: exam.questionOverlapPercentage
        });

        // Create exam questions for this booking with randomization
        const examQuestions = randomizedQuestions.map((question, index) => ({
          examId,
          questionId: question.id,
          order: index + 1,
          marks: question.marks
        }));

        await tx.examQuestion.createMany({
          data: examQuestions
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'ADMIN_BOOKING_CREATED',
            resource: 'EXAM_BOOKING',
            resourceId: newBooking.id,
            details: {
              targetUserId: userId,
              examTitle: exam.title,
              scheduledAt: newBooking.scheduledAt,
              totalAmount: newBooking.totalAmount
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });

        return newBooking;
      });

      // Generate bill for the booking
      const billingService = require('../services/billingService');
      const bill = await billingService.generateBill(booking.id);

      // Send notification
      await notificationService.sendBookingConfirmation(booking.user.email, {
        bookingId: booking.id,
        examTitle: booking.exam.title,
        scheduledAt: booking.scheduledAt,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        firstName: booking.user.firstName
      });

      // Log the booking creation
      logger.logExam('ADMIN_BOOKING_CREATED', examId, userId, {
        bookingId: booking.id,
        questionCount: exam.questions.length,
        totalAmount: booking.totalAmount,
        adminId: adminId
      });

      // Emit WebSocket event for booking created
      if (global.io) {
        global.io.to('admin-room').emit('admin-booking-created', {
          userId: userId,
          userName: `${user.firstName} ${user.lastName}`,
          examId: examId,
          examTitle: booking.exam.title,
          bookingId: booking.id,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          adminId: adminId,
          adminName: `${req.user.firstName} ${req.user.lastName}`,
          timestamp: new Date().toISOString()
        });
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { 
          booking,
          bill: bill
        }
      });
    } catch (error) {
      logger.error('Admin create booking failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create booking'
        }
      });
    }
  }

  /**
   * Get booking analytics
   */
  async getBookingAnalytics(req, res) {
    try {
      const { startDate, endDate, examCategoryId } = req.query;

      const analytics = await examBookingService.getBookingAnalytics({
        startDate,
        endDate,
        examCategoryId
      });

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Get booking analytics failed', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get booking analytics'
        }
      });
    }
  }
}

module.exports = new ExamBookingController(); 