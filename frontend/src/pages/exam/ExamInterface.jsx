import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { examAPI, attemptAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ExamInterface = () => {
  console.log('🎯 ExamInterface Component - MOUNTING');
  const { testId } = useParams();
  const navigate = useNavigate();
  
  console.log('🎯 ExamInterface - testId:', testId);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);

  // Fetch real exam data
  const [examData, setExamData] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
  const [examError, setExamError] = useState(null);

  useEffect(() => {
    if (testId) {
      console.log('🔍 useEffect - Fetching exam data for testId:', testId);
      console.log('🔍 examAPI object:', examAPI);
      console.log('🔍 examAPI.getExamDetails:', examAPI?.getExamDetails);
      setExamLoading(true);
      setExamError(null);
      
      examAPI.getExamById(testId)
        .then(response => {
          console.log('🔍 API Response:', response);
          console.log('🔍 Response data structure:', {
            data: response.data,
            'data.data': response.data?.data,
            'data.data.exam': response.data?.data?.exam,
            'data.exam': response.data?.exam
          });
          setExamData(response);
          setExamLoading(false);
        })
        .catch(error => {
          console.error('🔍 API Error:', error);
          setExamError(error);
          setExamLoading(false);
        });
    }
  }, [testId]);
  
  console.log('🔍 React Query Debug:', {
    testId,
    enabled: !!testId,
    examLoading,
    examError
  });

  // Start exam attempt
  const startAttemptMutation = useMutation({
    mutationFn: (examId) => attemptAPI.startAttempt(examId),
    onSuccess: (data) => {
      console.log('🔍 Start attempt success:', data);
      setAttemptId(data.data?.data?.attempt?.id);
      setTimeLeft(data.data?.data?.attempt?.duration * 60 || 3600);
      toast.success('Exam started successfully!');
    },
    onError: (error) => {
      toast.error('Failed to start exam');
      console.error('Start exam error:', error);
    }
  });

  // Submit exam attempt
  const submitAttemptMutation = useMutation({
    mutationFn: (data) => attemptAPI.submitAttempt(data.attemptId, data.answers),
    onSuccess: (data) => {
      console.log('🔍 Submit attempt success:', data);
      setIsSubmitted(true);
      toast.success('Exam submitted successfully!');
      // Navigate to results page after a delay
      setTimeout(() => {
        navigate(`/exam/results/${data.data?.data?.id || attemptId}`);
      }, 2000);
    },
    onError: (error) => {
      toast.error('Failed to submit exam');
      console.error('Submit exam error:', error);
    }
  });

  // Extract exam data
  const exam = examData?.data?.data?.exam || examData?.data?.exam || {};
  const questions = examData?.data?.data?.questions || exam.questions || [];
  
  console.log('🔍 ExamInterface Debug:', {
    examData,
    examLoading,
    examError,
    examErrorMessage: examError?.message,
    examErrorStack: examError?.stack,
    exam,
    questionsCount: questions.length
  });

  useEffect(() => {
    console.log('🔍 useEffect - exam.id:', exam.id, 'attemptId:', attemptId);
    if (exam.id && !attemptId) {
      console.log('🔍 Starting exam attempt for exam ID:', exam.id);
      startAttemptMutation.mutate(exam.id);
    }
  }, [exam.id, attemptId]);

  useEffect(() => {
    if (!attemptId || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, isSubmitted]);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = () => {
    console.log('🔍 handleSubmit - attemptId:', attemptId, 'answers:', answers);
    if (!attemptId) {
      toast.error('No active exam attempt');
      return;
    }

    submitAttemptMutation.mutate({
      attemptId,
      answers
    });
  };

  // Handle errors
  if (examError) {
    return (
      <div className="error-container">
        <h3>Error loading exam</h3>
        <p>Failed to load exam data. Please try again later.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (examLoading) {
    return (
      <div className="loading-container">
        <h3>Loading exam...</h3>
        <p>Please wait while we prepare your exam.</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="success-container">
        <h3>Exam Submitted!</h3>
        <p>Your answers have been submitted successfully. Redirecting to results...</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestionData = questions[currentQuestion];
  
  console.log('🔍 Current Question Debug:', {
    currentQuestion,
    questionsLength: questions.length,
    currentQuestionData,
    questions
  });

  // Safety check - if no questions or current question is undefined, show loading
  if (!questions.length || !currentQuestionData) {
    return (
      <div className="loading-container">
        <h3>Loading questions...</h3>
        <p>Please wait while we prepare your exam questions.</p>
        <p>Questions loaded: {questions.length}</p>
        <p>Current question index: {currentQuestion}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--secondary-900)', margin: '0 0 8px' }}>
              {exam.name}
            </h1>
            <p style={{ color: 'var(--secondary-600)', margin: 0 }}>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div style={{
            background: timeLeft < 300 ? 'linear-gradient(135deg, var(--danger-500), var(--danger-600))' : 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '18px'
          }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          {/* Question Area */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)', lineHeight: '1.6' }}>
                {currentQuestionData.text}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionData.id, index)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${answers[currentQuestionData.id] === index ? 'var(--primary-500)' : 'var(--secondary-200)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    backgroundColor: answers[currentQuestionData.id] === index ? 'var(--primary-50)' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${answers[currentQuestionData.id] === index ? 'var(--primary-500)' : 'var(--secondary-300)'}`,
                      backgroundColor: answers[currentQuestionData.id] === index ? 'var(--primary-500)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {answers[currentQuestionData.id] === index ? '✓' : String.fromCharCode(65 + index)}
                    </div>
                    <span style={{ fontSize: '16px', color: 'var(--secondary-900)' }}>
                      {option.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>
              
              {currentQuestion === questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitted}
                >
                  📤 Submit Test
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow)',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '16px' }}>
              Question Navigation
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(index)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--secondary-300)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: currentQuestion === index ? 'var(--primary-500)' : 
                                   answers[question.id] !== undefined ? 'var(--success-100)' : 'white',
                    color: currentQuestion === index ? 'white' : 
                          answers[question.id] !== undefined ? 'var(--success-700)' : 'var(--secondary-700)',
                    borderColor: currentQuestion === index ? 'var(--primary-500)' : 
                               answers[question.id] !== undefined ? 'var(--success-300)' : 'var(--secondary-300)'
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success-500)' }}></div>
                <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--secondary-300)' }}></div>
                <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Unanswered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-500)' }}></div>
                <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Current</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--secondary-200)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Progress:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--secondary-900)' }}>
                  {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--secondary-200)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary-500)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface; 