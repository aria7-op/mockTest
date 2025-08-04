const express = require('express');
const examBookingController = require('../controllers/examBookingController');
const { auth, studentOnly, adminOnly, adminOrModerator } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Admin routes (must come BEFORE student routes to avoid conflicts)
router.get('/admin/all', adminOrModerator, examBookingController.getAllBookings);
router.post('/admin/create', adminOrModerator, examBookingController.createBookingForUser);
router.patch('/admin/:bookingId/status', adminOrModerator, examBookingController.updateBookingStatus);
router.get('/admin/analytics', adminOrModerator, examBookingController.getBookingAnalytics);

// Student routes
router.use(studentOnly);

// Booking management
router.post('/', examBookingController.createBooking);
router.get('/', examBookingController.getUserBookings);
router.get('/stats', examBookingController.getBookingStats);
router.get('/available-exams', examBookingController.getAvailableExams);
router.get('/:bookingId', examBookingController.getBooking);
router.put('/:bookingId', examBookingController.updateBooking);
router.delete('/:bookingId', examBookingController.cancelBooking);

// Exam taking
router.post('/:bookingId/start-exam', examBookingController.startExam);

module.exports = router; 