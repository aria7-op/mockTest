const express = require('express');
const adminController = require('../controllers/adminController');
const { auth, adminOnly, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(auth, adminOnly);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// ========================================
// USER MANAGEMENT
// ========================================
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId', adminController.updateUser);
router.patch('/users/:userId/status', adminController.toggleUserStatus);
router.post('/users/bulk-import', adminController.bulkImportUsers);
router.get('/users/analytics', adminController.getUserAnalytics);

// ========================================
// EXAM CATEGORY MANAGEMENT
// ========================================
router.post('/exam-categories', adminController.createExamCategory);
router.get('/exam-categories', adminController.getAllExamCategories);
router.put('/exam-categories/:categoryId', adminController.updateExamCategory);
router.delete('/exam-categories/:categoryId', adminController.deleteExamCategory);

// ========================================
// QUESTION MANAGEMENT
// ========================================
router.post('/questions', adminController.createQuestion);
router.get('/questions', adminController.getAllQuestions);
router.put('/questions/:questionId', adminController.updateQuestion);
router.delete('/questions/:questionId', adminController.deleteQuestion);
router.post('/questions/bulk-import', adminController.bulkImportQuestions);
router.get('/questions/analytics', adminController.getQuestionAnalytics);

// ========================================
// EXAM MANAGEMENT
// ========================================
router.post('/exams', adminController.createExam);
router.get('/exams', adminController.getAllExams);
router.put('/exams/:examId', adminController.updateExam);
router.delete('/exams/:examId', adminController.deleteExam);
router.patch('/exams/:examId/approve', adminController.approveExam);
router.get('/exams/analytics', adminController.getExamAnalytics);

// ========================================
// SYSTEM ADMINISTRATION
// ========================================
router.get('/system/health', adminController.getSystemHealth);
router.get('/system/audit-logs', adminController.getAuditLogs);
router.get('/system/analytics', adminController.getSystemAnalytics);
router.post('/system/export', adminController.exportData);
router.post('/system/backup', superAdminOnly, adminController.backupSystem);

module.exports = router; 