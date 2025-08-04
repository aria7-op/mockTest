import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionAPI, categoryAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';

const Questions = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [realTimeStats, setRealTimeStats] = useState({
    totalQuestions: 0,
    questionsAdded: 0,
    questionsUpdated: 0
  });

  // WebSocket event handlers for real-time question updates
  useEffect(() => {
    if (!currentUser) return;

    // Handle question creation events
    const handleQuestionCreated = (data) => {
      queryClient.invalidateQueries(['questions']);
      setRealTimeStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        questionsAdded: prev.questionsAdded + 1
      }));
    };

    // Handle question update events
    const handleQuestionUpdated = (data) => {
      queryClient.invalidateQueries(['questions']);
      setRealTimeStats(prev => ({
        ...prev,
        questionsUpdated: prev.questionsUpdated + 1
      }));
    };

    // Set up event listeners
    socketService.onExamAttemptStarted(handleQuestionCreated); // Reuse for question events
    socketService.onExamAttemptCompleted(handleQuestionUpdated); // Reuse for question events

    // Cleanup event listeners
    return () => {
      socketService.offExamAttemptStarted(handleQuestionCreated);
      socketService.offExamAttemptCompleted(handleQuestionUpdated);
    };
  }, [currentUser, queryClient]);

  const [formData, setFormData] = useState({
    question: '',
    categoryId: '',
    difficulty: 'EASY',
    type: 'MCQ',
    correctAnswer: '',
    options: ['', '', '', ''],
    explanation: '',
    points: 1,
    timeLimit: 60
  });

  // Fetch all questions
  const { data: questionsData, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['questions', searchTerm, selectedCategory, selectedDifficulty, selectedType],
    queryFn: () => adminAPI.getAllQuestions({ 
      search: searchTerm, 
      categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      type: selectedType !== 'all' ? selectedType : undefined
    }),
    refetchInterval: 30000
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAllCategories()
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (questionData) => adminAPI.createQuestion(questionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Question created successfully!');
      setShowAddModal(false);
      setFormData({
        question: '',
        categoryId: '',
        difficulty: 'EASY',
        type: 'MCQ',
        correctAnswer: '',
        options: ['', '', '', ''],
        explanation: '',
        points: 1,
        timeLimit: 60
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create question');
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, questionData }) => adminAPI.updateQuestion(questionId, questionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Question updated successfully!');
      setShowAddModal(false);
      setEditingQuestion(null);
      setFormData({
        question: '',
        categoryId: '',
        difficulty: 'EASY',
        type: 'MCQ',
        correctAnswer: '',
        options: ['', '', '', ''],
        explanation: '',
        points: 1,
        timeLimit: 60
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update question');
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId) => adminAPI.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Question deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    }
  });

  const handleAddQuestion = () => {
    if (formData.question && formData.categoryId && formData.correctAnswer) {
      const questionData = {
        ...formData,
        options: formData.type === 'MCQ' ? formData.options.filter(opt => opt.trim()) : []
      };
      createQuestionMutation.mutate(questionData);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      categoryId: question.categoryId,
      difficulty: question.difficulty,
      type: question.type,
      correctAnswer: question.correctAnswer,
      options: question.options || ['', '', '', ''],
      explanation: question.explanation || '',
      points: question.points || 1,
      timeLimit: question.timeLimit || 60
    });
    setShowAddModal(true);
  };

  const handleUpdateQuestion = () => {
    if (formData.question && formData.categoryId && formData.correctAnswer) {
      const questionData = {
        ...formData,
        options: formData.type === 'MCQ' ? formData.options.filter(opt => opt.trim()) : []
      };
      updateQuestionMutation.mutate({ questionId: editingQuestion.id, questionData });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const filteredQuestions = questionsData?.data?.questions || [];
  const categories = categoriesData?.data?.categories || [];

  if (questionsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--secondary-600)' }}>Loading questions...</div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', color: 'var(--danger-600)' }}>Error loading questions</div>
        <div style={{ fontSize: '16px', color: 'var(--secondary-600)', marginTop: '8px' }}>
          {questionsError.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Questions Management</h2>
          <div className="data-table-actions">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px',
                marginRight: '12px'
              }}
            >
              <option value="all">All Types</option>
              <option value="MCQ">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="ESSAY">Essay</option>
            </select>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingQuestion(null);
                setFormData({
                  question: '',
                  categoryId: '',
                  difficulty: 'EASY',
                  type: 'MCQ',
                  correctAnswer: '',
                  options: ['', '', '', ''],
                  explanation: '',
                  points: 1,
                  timeLimit: 60
                });
                setShowAddModal(true);
              }}
            >
              ➕ Add Question
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Type</th>
              <th>Points</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.id}>
                <td style={{ maxWidth: '300px' }}>
                  <div style={{ fontWeight: '500', color: 'var(--secondary-900)' }}>
                    {q.question}
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">
                    {categories.find(c => c.id === q.categoryId)?.name || 'Unknown'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    q.difficulty === 'EASY' ? 'badge-success' :
                    q.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td>{q.type}</td>
                <td>{q.points || 1}</td>
                <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="data-table-actions-cell">
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleEditQuestion(q)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQuestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-600)' }}>
            No questions found
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '800px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Question *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="ESSAY">Essay</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    min="30"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 60 })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>

              {formData.type === 'MCQ' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Options *
                  </label>
                  {formData.options.map((option, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid var(--secondary-300)',
                          borderRadius: '6px'
                        }}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: 'var(--danger-500)',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Correct Answer *
                </label>
                {formData.type === 'MCQ' ? (
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select Correct Answer</option>
                    {formData.options.map((option, index) => (
                      <option key={index} value={option}>{option || `Option ${index + 1}`}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--secondary-300)',
                      borderRadius: '6px'
                    }}
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Explanation
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={3}
                  placeholder="Optional explanation for the correct answer..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
              >
                {createQuestionMutation.isPending || updateQuestionMutation.isPending ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions; 