const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { auth, authorize } = require('../middleware/auth');

// Create a payment
router.post('/', auth, async (req, res) => {
  try {
    const { bookingId, amount, currency, paymentMethod, description } = req.body;
    const userId = req.user.id;

    const payment = await paymentService.createPayment({
      userId,
      bookingId,
      amount,
      currency,
      paymentMethod,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get payment by ID
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await paymentService.getPayment(paymentId, userId);
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const payments = await paymentService.getUserPayments(userId, { page, limit, status });
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Process payment (webhook or manual)
router.post('/:paymentId/process', auth, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, metadata } = req.body;

    const payment = await paymentService.processPayment(paymentId, status, metadata);
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Refund payment
router.post('/:paymentId/refund', auth, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const refund = await paymentService.refundPayment(paymentId, amount, reason);
    
    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: refund
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get payment statistics (admin only)
router.get('/stats/overview', auth, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const stats = await paymentService.getPaymentStatistics({ startDate, endDate, groupBy });
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 