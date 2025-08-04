import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request - URL:', config.url, 'Token:', token ? 'exists' : 'none'); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Added Authorization header'); // Debug log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Response Error - Status:', error.response?.status, 'URL:', error.config?.url); // Debug log
    
    if (error.response?.status === 401) {
      console.log('API Response Error - 401 Unauthorized, clearing auth data'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect immediately, let the component handle it
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerFirstAdmin: (userData) => api.post('/auth/register-first-admin', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  getProfile: () => api.get('/auth/profile'),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  getUserAttempts: (userId) => api.get(`/users/${userId}/attempts`),
  getUserPayments: (userId) => api.get(`/users/${userId}/payments`),
};

// Exam Categories API
export const categoryAPI = {
  getAllCategories: () => api.get('/exam-categories'),
  createCategory: (categoryData) => api.post('/exam-categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/exam-categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/exam-categories/${categoryId}`),
  getCategoryById: (categoryId) => api.get(`/exam-categories/${categoryId}`),
  getCategoryStats: (categoryId) => api.get(`/exam-categories/${categoryId}/stats`),
  getCategoryQuestions: (categoryId) => api.get(`/exam-categories/${categoryId}/questions`),
  getCategoryExams: (categoryId) => api.get(`/exam-categories/${categoryId}/exams`),
};

// Questions API
export const questionAPI = {
  getAllQuestions: (params) => api.get('/questions', { params }),
  getQuestionById: (questionId) => api.get(`/questions/${questionId}`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  updateQuestion: (questionId, questionData) => api.put(`/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),
  getQuestionsByCategory: (categoryId) => api.get(`/questions`, { params: { categoryId } }),
  getQuestionsByDifficulty: (difficulty) => api.get(`/questions`, { params: { difficulty } }),
  getQuestionsByType: (type) => api.get(`/questions`, { params: { type } }),
  bulkCreateQuestions: (questions) => api.post('/questions/bulk', { questions }),
  importQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Exams API
export const examAPI = {
  getAllExams: (params) => api.get('/exams', { params }),
  getExamById: (examId) => api.get(`/exams/${examId}`),
  getExamDetails: (examId) => {
    console.log('🔍 API Call - getExamDetails:', examId);
    return api.get(`/exams/${examId}`);
  },
  createExam: (examData) => api.post('/exams', examData),
  updateExam: (examId, examData) => api.put(`/exams/${examId}`, examData),
  deleteExam: (examId) => api.delete(`/exams/${examId}`),
  getAvailableExams: () => api.get('/exams/available'),
  getUpcomingExams: () => api.get('/exams/upcoming'),
  getExamQuestions: (examId) => api.get(`/exams/${examId}/questions`),
  getExamStats: (examId) => api.get(`/exams/${examId}/stats`),
  getExamAttempts: (examId) => api.get(`/exams/${examId}/attempts`),
  publishExam: (examId) => api.put(`/exams/${examId}/publish`),
  unpublishExam: (examId) => api.put(`/exams/${examId}/unpublish`),
  duplicateExam: (examId) => api.post(`/exams/${examId}/duplicate`),
};

// Exam Attempts API
export const attemptAPI = {
  startAttempt: (examId, bookingId) => api.post('/attempts/start', { examId, bookingId }),
  submitAnswer: (attemptId, questionId, selectedOptions, timeSpent) =>
    api.post(`/attempts/${attemptId}/responses`, { questionId, selectedOptions, timeSpent }),
  submitAttempt: (attemptId, answers) => api.post(`/attempts/${attemptId}/submit`, { answers }),
  completeAttempt: (attemptId) => api.post(`/attempts/${attemptId}/complete`),
  getAttemptHistory: (params) => api.get('/attempts/history', { params }),
  getAttemptById: (attemptId) => api.get(`/attempts/${attemptId}`),
  getAttemptResponses: (attemptId) => api.get(`/attempts/${attemptId}/responses`),
  getAttemptAnalytics: (attemptId) => api.get(`/attempts/${attemptId}/analytics`),
  pauseAttempt: (attemptId) => api.put(`/attempts/${attemptId}/pause`),
  resumeAttempt: (attemptId) => api.put(`/attempts/${attemptId}/resume`),
};

// Bookings API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
      getMyBookings: () => api.get('/bookings'),
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  updateBooking: (bookingId, bookingData) => api.put(`/bookings/${bookingId}`, bookingData),
  deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  rescheduleBooking: (bookingId, newDateTime) => api.put(`/bookings/${bookingId}/reschedule`, { newDateTime }),
  getBookingStats: () => api.get('/bookings/stats'),
};

// Payments API
export const paymentAPI = {
  createPayment: (paymentData) => api.post('/payments', paymentData),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),
  processPayment: (paymentId, status, metadata) =>
    api.post(`/payments/${paymentId}/process`, { status, metadata }),
  refundPayment: (paymentId, amount, reason) =>
    api.post(`/payments/${paymentId}/refund`, { amount, reason }),
  getPaymentStats: () => api.get('/payments/stats/overview'),
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  updatePayment: (paymentId, paymentData) => api.put(`/payments/${paymentId}`, paymentData),
  deletePayment: (paymentId) => api.delete(`/payments/${paymentId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getDashboardAnalytics: (params) => api.get('/analytics/dashboard', { params }),
  getUserPerformance: (categoryId) => api.get('/analytics/user-performance', { params: { categoryId } }),
  getExamAnalytics: (examId) => api.get(`/analytics/exams/${examId}`),
  getCategoryAnalytics: (categoryId) => api.get(`/analytics/categories/${categoryId}`),
  getUserAnalytics: (userId) => api.get(`/analytics/users/${userId}`),
  getSystemAnalytics: (params) => api.get('/analytics/system', { params }),
  getRevenueAnalytics: (params) => api.get('/analytics/revenue', { params }),
  getPerformanceAnalytics: (params) => api.get('/analytics/performance', { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
  getRecentActivities: () => api.get('/analytics/dashboard'), // Use dashboard endpoint which includes recent activities
  getAuditLogs: (params) => api.get('/analytics/audit-logs', { params }),
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  bulkCreateUsers: (users) => api.post('/admin/users/bulk', { users }),
  importUsers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Categories
  getAllCategories: () => api.get('/admin/exam-categories'),
  createCategory: (categoryData) => api.post('/admin/exam-categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/exam-categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/exam-categories/${categoryId}`),
  getCategoryDetails: (categoryId) => api.get(`/admin/exam-categories/${categoryId}`),

  // Questions
  getAllQuestions: (params) => api.get('/admin/questions', { params }),
  createQuestion: (questionData) => api.post('/admin/questions', questionData),
  updateQuestion: (questionId, questionData) => api.put(`/admin/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/admin/questions/${questionId}`),
  getQuestionDetails: (questionId) => api.get(`/admin/questions/${questionId}`),
  bulkCreateQuestions: (questions) => api.post('/admin/questions/bulk', { questions }),
  importQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Exams
  getAllExams: (params) => api.get('/admin/exams', { params }),
  createExam: (examData) => api.post('/admin/exams', examData),
  updateExam: (examId, examData) => api.put(`/admin/exams/${examId}`, examData),
  deleteExam: (examId) => api.delete(`/admin/exams/${examId}`),
  getExamDetails: (examId) => {
    console.log('🔍 API Call - getExamDetails:', examId);
    return api.get(`/exams/${examId}`);
  },
  publishExam: (examId) => api.put(`/admin/exams/${examId}/publish`),
  unpublishExam: (examId) => api.put(`/admin/exams/${examId}/unpublish`),
  duplicateExam: (examId) => api.post(`/admin/exams/${examId}/duplicate`),

  // Bookings
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  createAdminBooking: (bookingData) => api.post('/bookings/admin/create', bookingData),
  updateBooking: (bookingId, bookingData) => api.put(`/bookings/admin/${bookingId}/status`, bookingData),
  deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  approveBooking: (bookingId) => api.put(`/admin/bookings/${bookingId}/approve`),
  rejectBooking: (bookingId, reason) => api.put(`/admin/bookings/${bookingId}/reject`, { reason }),

  // Payments
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  updatePayment: (paymentId, paymentData) => api.put(`/admin/payments/${paymentId}`, paymentData),
  deletePayment: (paymentId) => api.delete(`/admin/payments/${paymentId}`),
  getPaymentDetails: (paymentId) => api.get(`/admin/payments/${paymentId}`),
  processPayment: (paymentId, status, metadata) => api.post(`/admin/payments/${paymentId}/process`, { status, metadata }),
  refundPayment: (paymentId, amount, reason) => api.post(`/admin/payments/${paymentId}/refund`, { amount, reason }),

  // System Management
  getSystemStats: () => api.get('/admin/system/stats'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getSystemLogs: (params) => api.get('/admin/system/logs', { params }),
  clearSystemCache: () => api.post('/admin/system/clear-cache'),
  backupDatabase: () => api.post('/admin/system/backup'),
  restoreDatabase: (backupFile) => {
    const formData = new FormData();
    formData.append('backup', backupFile);
    return api.post('/admin/system/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Settings
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (settings) => api.put('/admin/settings', settings),
  getEmailSettings: () => api.get('/admin/settings/email'),
  updateEmailSettings: (settings) => api.put('/admin/settings/email', settings),
  testEmailSettings: (testEmail) => api.post('/admin/settings/email/test', { testEmail }),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
  getAPIInfo: () => api.get('/api'),
};

export default api; 