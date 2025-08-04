import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examAPI, categoryAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';

const AdminExams = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [realTimeStats, setRealTimeStats] = useState({
    activeExams: 0,
    completedExams: 0,
    totalAttempts: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    duration: 60,
    totalQuestions: 10,
    passingScore: 70,
    isActive: true,
    startDate: '',
    endDate: '',
    instructions: ''
  });

  // WebSocket event handlers for real-time exam updates
  useEffect(() => {
    if (!currentUser) return;

    // Handle exam attempt started
    const handleExamAttemptStarted = (data) => {
      queryClient.invalidateQueries(['exams']);
      setRealTimeStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1
      }));
    };

    // Handle exam attempt completed
    const handleExamAttemptCompleted = (data) => {
      queryClient.invalidateQueries(['exams']);
      setRealTimeStats(prev => ({
        ...prev,
        completedExams: prev.completedExams + 1
      }));
    };

    // Set up event listeners
    socketService.onExamAttemptStarted(handleExamAttemptStarted);
    socketService.onExamAttemptCompleted(handleExamAttemptCompleted);

    // Cleanup event listeners
    return () => {
      socketService.offExamAttemptStarted(handleExamAttemptStarted);
      socketService.offExamAttemptCompleted(handleExamAttemptCompleted);
    };
  }, [currentUser, queryClient]);

  // Fetch all exams
  const { data: examsData, isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ['exams', searchTerm, selectedCategory, selectedStatus],
    queryFn: () => adminAPI.getAllExams({ 
      search: searchTerm, 
      categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined
    }),
    refetchInterval: 30000
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAllCategories()
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: (examData) => adminAPI.createExam(examData),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      toast.success('Exam created successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        duration: 60,
        totalQuestions: 10,
        passingScore: 70,
        isActive: true,
        startDate: '',
        endDate: '',
        instructions: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    }
  });

  // Update exam mutation
  const updateExamMutation = useMutation({
    mutationFn: ({ examId, examData }) => adminAPI.updateExam(examId, examData),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      toast.success('Exam updated successfully!');
      setShowAddModal(false);
      setEditingExam(null);
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        duration: 60,
        totalQuestions: 10,
        passingScore: 70,
        isActive: true,
        startDate: '',
        endDate: '',
        instructions: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update exam');
    }
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: (examId) => adminAPI.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      toast.success('Exam deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    }
  });

  const handleAddExam = () => {
    if (formData.title && formData.categoryId) {
      createExamMutation.mutate(formData);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      categoryId: exam.categoryId,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      passingScore: exam.passingScore,
      isActive: exam.isActive,
      startDate: exam.startDate ? exam.startDate.split('T')[0] : '',
      endDate: exam.endDate ? exam.endDate.split('T')[0] : '',
      instructions: exam.instructions || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateExam = () => {
    if (editingExam && formData.title && formData.categoryId) {
      updateExamMutation.mutate({
        examId: editingExam.id,
        examData: formData
      });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteExamMutation.mutate(examId);
    }
  };

  const filteredExams = examsData?.data?.data || [];

  if (examsLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Loading exams...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Exam Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Create and manage mock tests for students
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'var(--primary-500)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Create Exam
        </button>
      </div>

      {/* Real-time Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-500)' }}>
            {realTimeStats.activeExams}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Active Exams
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-500)' }}>
            {realTimeStats.completedExams}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Completed Today
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-500)' }}>
            {realTimeStats.totalAttempts}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Total Attempts
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="all">All Categories</option>
            {categoriesData?.data?.data?.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          Exams ({filteredExams.length})
        </div>
        
        {filteredExams.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            No exams found
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredExams.map(exam => (
              <div
                key={exam.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {exam.title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                    {exam.description}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Duration: {exam.duration} min</span>
                    <span>Questions: {exam.totalQuestions}</span>
                    <span>Passing: {exam.passingScore}%</span>
                    <span style={{
                      color: exam.isActive ? 'var(--success-500)' : 'var(--danger-500)',
                      fontWeight: '600'
                    }}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditExam(exam)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--primary-500)',
                      background: 'transparent',
                      color: 'var(--primary-500)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--danger-500)',
                      background: 'transparent',
                      color: 'var(--danger-500)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <input
                type="text"
                placeholder="Exam Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
              
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="">Select Category</option>
                {categoriesData?.data?.data?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                
                <input
                  type="number"
                  placeholder="Total Questions"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({...formData, totalQuestions: parseInt(e.target.value)})}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="number"
                  placeholder="Passing Score (%)"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active
                </label>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <textarea
                placeholder="Instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows={4}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button
                onClick={editingExam ? handleUpdateExam : handleAddExam}
                disabled={createExamMutation.isPending || updateExamMutation.isPending}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'var(--primary-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {createExamMutation.isPending || updateExamMutation.isPending ? 'Saving...' : (editingExam ? 'Update Exam' : 'Create Exam')}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExam(null);
                  setFormData({
                    title: '',
                    description: '',
                    categoryId: '',
                    duration: 60,
                    totalQuestions: 10,
                    passingScore: 70,
                    isActive: true,
                    startDate: '',
                    endDate: '',
                    instructions: ''
                  });
                }}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExams; 