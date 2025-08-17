import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { examAPI, attemptAPI } from '../../services/api';
import toast from 'react-hot-toast';
  import { 
  FiClock, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheck, 
  FiSend,
  FiFlag,
  FiBook,
  FiEdit2,
  FiAlignLeft,
  FiType,
  FiImage,
  FiInfo,
  FiGrid,
  FiX,
  FiMenu,
  FiSettings,
  FiHelpCircle,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { FaRegCircle, FaCircle, FaRegFlag, FaFlag, FaCalculator, FaTrophy, FaTimes, FaBars } from 'react-icons/fa';

// Helper function to detect ACCA exams
const isACCAExam = (examTitle) => {
  if (!examTitle) return false;
  const accaPatterns = ['FA1', 'MA1', 'FA2', 'MA2', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'];
  return accaPatterns.some(pattern => 
    examTitle.toUpperCase().includes(pattern.toUpperCase())
  );
};

// Helper function to detect IELTS exams
const isIELTSExam = (examTitle) => {
  if (!examTitle) return false;
  return examTitle.toUpperCase().includes('IELTS');
};

// Helper function to detect TOEFL exams
const isTOEFLExam = (examTitle) => {
  if (!examTitle) return false;
  return examTitle.toUpperCase().includes('TOEFL');
};

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
  
  // Exam Interface States
  const [isAccaExam, setIsAccaExam] = useState(false);
  const [isIeltsExam, setIsIeltsExam] = useState(false);
  const [isToeflExam, setIsToeflExam] = useState(false);
  const [accaInterfaceMode, setAccaInterfaceMode] = useState('question'); // question, review, calculator
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showQuestionNavigator, setShowQuestionNavigator] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [examProgress, setExamProgress] = useState(0);
  const [showFullScreenQuestion, setShowFullScreenQuestion] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);

  // Fetch real exam data
  const [examData, setExamData] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
  const [examError, setExamError] = useState(null);

  // Extract exam data - moved to top to avoid lexical declaration errors
  const exam = examData?.data?.data?.exam || examData?.data?.exam || {};
  const questions = examData?.data?.data?.questions || exam.questions || [];

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
          
          // Check exam type
          const examTitle = response.data?.data?.exam?.title || response.data?.exam?.title;
          const isAcca = examTitle ? isACCAExam(examTitle) : false;
          const isIelts = examTitle ? isIELTSExam(examTitle) : false;
          const isToefl = examTitle ? isTOEFLExam(examTitle) : false;
          
          setIsAccaExam(isAcca);
          setIsIeltsExam(isIelts);
          setIsToeflExam(isToefl);
          
          if (isAcca) {
            console.log('🎯 ACCA Exam Detected:', examTitle);
            // Set ACCA-specific defaults
            setShowInstructions(true);
            setAccaInterfaceMode('question');
          } else if (isIelts) {
            console.log('🎯 IELTS Exam Detected:', examTitle);
            // Set IELTS-specific defaults
            setShowInstructions(true);
          } else if (isToefl) {
            console.log('🎯 TOEFL Exam Detected:', examTitle);
            // Set TOEFL-specific defaults
            setShowInstructions(true);
          } else {
            setShowFullScreenQuestion(true); // Start with full-screen question view
          }
          
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

  // Update current question data when questions change
  useEffect(() => {
    if (questions && questions.length > 0 && currentQuestion < questions.length) {
      setCurrentQuestionData(questions[currentQuestion]);
    }
  }, [questions, currentQuestion]);

  // Start exam attempt
  const startAttemptMutation = useMutation({
    mutationFn: (examId) => attemptAPI.startAttempt(examId),
    onSuccess: (data) => {
      console.log('🔍 Start attempt success:', data);
      setAttemptId(data.data?.data?.attempt?.id);
      setTimeLeft(data.data?.data?.attempt?.duration * 60 || 3600);
      
      // Get questions from the start attempt response
      const startQuestions = data.data?.data?.questions || [];
      if (startQuestions.length > 0) {
        setExamData(prev => ({
          ...prev,
          data: {
            ...prev?.data,
            data: {
              ...prev?.data?.data,
              questions: startQuestions
            }
          }
        }));
      }
      
      toast.success('Exam started successfully!');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to start exam';
      toast.error(errorMessage);
      console.error('Start exam error:', error);
      
      // If attempts exceeded, show detailed message
      if (error.response?.data?.attemptsUsed && error.response?.data?.attemptsAllowed) {
        toast.error(
          `Attempts exceeded: ${error.response.data.attemptsUsed}/${error.response.data.attemptsAllowed} attempts used`,
          { duration: 5000 }
        );
      }
    }
  });

  // Submit exam attempt
  const submitAttemptMutation = useMutation({
    mutationFn: (data) => attemptAPI.submitAttempt(data.attemptId, data.responses),
    onSuccess: (data) => {
      console.log('🔍 Submit attempt success:', data);
      setIsSubmitted(true);
      toast.success('Exam submitted successfully!');
      
      // Show detailed success message with analytics preview
      const results = data.data?.data?.results;
      if (results) {
        const score = results.percentage || 0;
        const grade = results.grade || 'N/A';
        const correctAnswers = results.correctAnswers || 0;
        const totalQuestions = results.totalQuestions || 0;
        
        toast.success(
          `Exam completed! Score: ${score.toFixed(1)}% (${grade}) - ${correctAnswers}/${totalQuestions} correct`,
          { duration: 4000 }
        );
      }
      
      // Navigate to results page after a delay
      setTimeout(() => {
        const attemptId = data.data?.data?.attempt?.id || attemptId;
        navigate(`/exam/results/${attemptId}`);
      }, 3000);
    },
    onError: (error) => {
      toast.error('Failed to submit exam');
      console.error('Submit exam error:', error);
    }
  });

  // ACCA-specific functions
  const toggleQuestionFlag = (questionIndex) => {
    const newFlaggedQuestions = new Set(flaggedQuestions);
    if (newFlaggedQuestions.has(questionIndex)) {
      newFlaggedQuestions.delete(questionIndex);
    } else {
      newFlaggedQuestions.add(questionIndex);
    }
    setFlaggedQuestions(newFlaggedQuestions);
  };

  const toggleQuestionNavigator = () => {
    console.log('🔍 toggleQuestionNavigator called! Current state:', showQuestionNavigator);
    setShowQuestionNavigator(!showQuestionNavigator);
    setShowCalculator(false);
    setShowInstructions(false);
    console.log('🔍 Navigator state will be:', !showQuestionNavigator);
  };

  const toggleCalculator = () => {
    console.log('🔍 toggleCalculator called! Current state:', showCalculator);
    setShowCalculator(!showCalculator);
    setShowQuestionNavigator(false);
    setShowInstructions(false);
    console.log('🔍 Calculator state will be:', !showCalculator);
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
    setShowQuestionNavigator(false);
    setShowCalculator(false);
  };

  const toggleFullScreenQuestion = () => {
    setShowFullScreenQuestion(!showFullScreenQuestion);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const navigateToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setShowQuestionNavigator(false);
    setShowFullScreenQuestion(true);
  };

  const calculateExamProgress = () => {
    if (!questions || questions.length === 0) return 0;
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  };

  // Calculator functionality
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [calculatorMemory, setCalculatorMemory] = useState(null);
  const [calculatorOperation, setCalculatorOperation] = useState(null);
  const [calculatorWaitingForOperand, setCalculatorWaitingForOperand] = useState(false);

  const handleCalculatorInput = (value) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
      setCalculatorMemory(null);
      setCalculatorOperation(null);
      setCalculatorWaitingForOperand(false);
      return;
    }

    if (value === '±') {
      setCalculatorDisplay(prev => prev === '0' ? '0' : prev.startsWith('-') ? prev.slice(1) : `-${prev}`);
      return;
    }

    if (value === '%') {
      const currentValue = parseFloat(calculatorDisplay);
      setCalculatorDisplay(String(currentValue / 100));
      return;
    }

    if (['+', '-', '×', '÷'].includes(value)) {
      if (calculatorOperation && !calculatorWaitingForOperand) {
        const result = performCalculation();
        setCalculatorDisplay(String(result));
        setCalculatorMemory(result);
      } else {
        setCalculatorMemory(parseFloat(calculatorDisplay));
      }
      setCalculatorOperation(value);
      setCalculatorWaitingForOperand(true);
      return;
    }

    if (value === '=') {
      if (calculatorOperation && !calculatorWaitingForOperand) {
        const result = performCalculation();
        setCalculatorDisplay(String(result));
        setCalculatorMemory(null);
        setCalculatorOperation(null);
        setCalculatorWaitingForOperand(false);
      }
      return;
    }

    if (value === '.') {
      if (calculatorWaitingForOperand) {
        setCalculatorDisplay('0.');
        setCalculatorWaitingForOperand(false);
      } else if (calculatorDisplay.indexOf('.') === -1) {
        setCalculatorDisplay(prev => prev + '.');
      }
      return;
    }

    // Number input
    if (calculatorWaitingForOperand) {
      setCalculatorDisplay(value);
      setCalculatorWaitingForOperand(false);
    } else {
      setCalculatorDisplay(prev => prev === '0' ? value : prev + value);
    }
  };

  const performCalculation = () => {
    const currentValue = parseFloat(calculatorDisplay);
    const memoryValue = calculatorMemory;
    
    switch (calculatorOperation) {
      case '+': return memoryValue + currentValue;
      case '-': return memoryValue - currentValue;
      case '×': return memoryValue * currentValue;
      case '÷': return memoryValue / currentValue;
      default: return currentValue;
    }
  };

  // Enhanced ACCA exam progress calculation
  useEffect(() => {
    setExamProgress(calculateExamProgress());
  }, [answers, questions]);

  useEffect(() => {
    console.log('🔍 useEffect - exam.id:', exam.id, 'attemptId:', attemptId);
    if (exam.id && !attemptId) {
      // Check attempts before starting
      const attemptsInfo = exam.attemptsInfo;
      if (attemptsInfo && !attemptsInfo.canTakeExam) {
        toast.error(
          `You have used all ${attemptsInfo.attemptsUsed}/${attemptsInfo.attemptsAllowed} attempts for this exam. No more attempts allowed.`,
          { duration: 5000 }
        );
        // Navigate back to exams list
        setTimeout(() => {
          navigate('/student/tests');
        }, 3000);
        return;
      }
      
      console.log('🔍 Starting exam attempt for exam ID:', exam.id);
      startAttemptMutation.mutate(exam.id);
    }
  }, [exam.id, attemptId, exam.attemptsInfo, navigate]);

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

  // Remove duplicate - handleAnswerSelect is already defined above
  // const handleAnswerSelect = (questionId, answerIndex) => {
  //   setAnswers(prev => ({
  //     ...prev,
  //     [questionId]: answerIndex
  //   }));
  // };

  const handleFillInTheBlankAnswer = (questionId, blankIndex, textAnswer) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[blankIndex] = textAnswer;
      
      return {
      ...prev,
        [questionId]: newAnswers
      };
    });
  };

  const handleSubmit = () => {
    console.log('🔍 handleSubmit - attemptId:', attemptId, 'answers:', answers);
    console.log('🔍 handleSubmit - CALLED! This function is being executed');
    if (!attemptId) {
      toast.error('No active exam attempt');
      return;
    }

    // Show confirmation dialog
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const unansweredCount = totalQuestions - answeredCount;
    
    let confirmMessage = `Are you sure you want to submit your exam?\n\n📊 Progress: ${answeredCount}/${totalQuestions} questions answered`;
    
    if (unansweredCount > 0) {
      confirmMessage += `\n⚠️ ${unansweredCount} question(s) unanswered`;
    }
    
    confirmMessage += '\n\nThis action cannot be undone.';
    
    if (window.confirm(confirmMessage)) {
      // Convert answers to the format expected by the backend
      const responses = Object.entries(answers).map(([questionId, answer]) => {
        const currentQuestion = questions.find(q => q.id === questionId);
        
        console.log('🔍 Processing answer for question:', {
          questionId,
          questionType: currentQuestion?.type,
          answer,
          answerType: typeof answer,
          isArray: Array.isArray(answer)
        });
        
        if (currentQuestion?.type === 'ESSAY' || currentQuestion?.type === 'SHORT_ANSWER') {
          // For essay/short answer questions, send as essayAnswer
          return {
            questionId,
            selectedOptions: [],
            essayAnswer: answer,
            timeSpent: 0
          };
        } else if (currentQuestion?.type === 'FILL_IN_THE_BLANK') {
          // For fill-in-the-blank questions, send as essayAnswer with proper format
          // The answer should be an array of text strings
          if (Array.isArray(answer)) {
            // Convert array of text answers to the format expected by backend
            const textAnswers = answer.filter(text => text && text.trim().length > 0);
            return {
              questionId,
              selectedOptions: [],
              essayAnswer: textAnswers.join(' | '), // Format: "answer1 | answer2 | answer3"
            timeSpent: 0
          };
        } else {
            // Fallback if answer is not an array
          return {
            questionId,
              selectedOptions: [],
              essayAnswer: answer || '',
              timeSpent: 0
            };
          }
        } else {
          // For multiple choice, single choice, true/false, etc.
          // Convert numeric indices to option IDs if needed
          let selectedOptions = [];
          if (Array.isArray(answer)) {
            selectedOptions = answer;
          } else if (typeof answer === 'number' && currentQuestion?.options) {
            // Convert numeric index to option ID
            const selectedOption = currentQuestion.options[answer];
            if (selectedOption) {
              selectedOptions = [selectedOption.id];
            } else {
              selectedOptions = [answer]; // Fallback to original value
            }
          } else {
            selectedOptions = [answer];
          }
          
          return {
            questionId,
            selectedOptions: selectedOptions,
            timeSpent: 0
          };
        }
      });

      console.log('🔍 About to call submitAttemptMutation with:', { attemptId, responses });
      
      // Debug: Log each response to see the format
      responses.forEach((response, index) => {
        console.log(`🔍 Response ${index + 1}:`, {
          questionId: response.questionId,
          questionType: questions.find(q => q.id === response.questionId)?.type,
          selectedOptions: response.selectedOptions,
          essayAnswer: response.essayAnswer,
          timeSpent: response.timeSpent
        });
      });
      
      submitAttemptMutation.mutate({
        attemptId,
        responses
      });
    }
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
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontSize: '18px',
        color: 'var(--secondary-700)',
        gap: '12px',
        backgroundColor: 'var(--primary-50)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow)',
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <h3 style={{ fontWeight: '700', fontSize: '24px', margin: 0 }}>Loading exam...</h3>
        <p style={{ margin: 0 }}>Please wait while we prepare your exam questions.</p>
      </div>
    );
  }

  // Check if attempts exceeded
  const attemptsInfo = exam.attemptsInfo;
  if (attemptsInfo && !attemptsInfo.canTakeExam) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--danger-50) 0%, var(--warning-50) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px'
          }}>
            ⚠️
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: 'var(--danger-700)',
            marginBottom: '16px'
          }}>
            Attempts Exceeded
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--secondary-600)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            You have used all {attemptsInfo.attemptsUsed}/{attemptsInfo.attemptsAllowed} attempts for this exam.
            No more attempts are allowed.
          </p>
          
          <div style={{
            background: 'var(--danger-50)',
            border: '1px solid var(--danger-200)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--danger-700)',
              marginBottom: '12px'
            }}>
              What you can do:
            </h3>
            <ul style={{
              textAlign: 'left',
              fontSize: '14px',
              color: 'var(--danger-600)',
              lineHeight: '1.8'
            }}>
              <li>📊 View your previous exam results</li>
              <li>📝 Take other available exams</li>
              <li>📈 Check your performance analytics</li>
              <li>🏆 View your certificates</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/student/tests')}
            >
              📝 Browse Other Exams
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/student/history')}
            >
              📊 View Exam History
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--success-50) 0%, var(--primary-50) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px'
          }}>
            ✅
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: 'var(--success-700)',
            marginBottom: '16px'
          }}>
            Exam Submitted Successfully!
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--secondary-600)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Your answers have been recorded and your exam is being processed. 
            You'll be redirected to your detailed results in a few seconds.
          </p>
          
          <div style={{
            background: 'var(--success-50)',
            border: '1px solid var(--success-200)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--success-700)',
              marginBottom: '12px'
            }}>
              What happens next?
            </h3>
            <ul style={{
              textAlign: 'left',
              fontSize: '14px',
              color: 'var(--success-600)',
              lineHeight: '1.8'
            }}>
              <li>✅ Your answers are being scored</li>
              <li>📊 Detailed analytics are being calculated</li>
              <li>📈 Performance metrics are being generated</li>
              <li>🎯 Difficulty breakdown is being analyzed</li>
              <li>🏆 Certificate will be issued if you passed</li>
            </ul>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--secondary-500)',
            fontSize: '14px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid var(--primary-300)',
              borderTop: '2px solid var(--primary-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Redirecting to results...
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Remove duplicate declaration - currentQuestionData is already defined in state
  // const currentQuestionData = questions[currentQuestion];
  
  console.log('🔍 Current Question Debug:', {
    currentQuestion,
    questionsLength: questions.length,
    currentQuestionData,
    questions
  });

  // Safety check - if no questions or current question is undefined, show loading
  if (!questions.length || !currentQuestionData) {
    return (
      <div className="loading-container flex flex-col items-center    justify-center min-h-screen text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in">
          {/* Animated loading spinner */}
          <div className="flex justify-center">
            <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Content with smooth transitions */}
          <div className="space-y-3 transition-all duration-300">
            <h3 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Preparing Your Exam
            </h3>
            
            <p className="text-gray-600 text-lg">
              We're getting your questions ready...
            </p>
            
            {/* Progress indicators with subtle animation */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span>Questions loaded</span>
                <span className="text-primary-600 animate-pulse">
                  {questions.length}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 font-medium">
                <span>Current question</span>
                <span className="text-primary-600">
                  {currentQuestion + 1}
                </span>
              </div>
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-primary-600 h-2.5 rounded-full animate-pulse" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // ACCA Exam Detection - We don't need this since we're enhancing the existing interface
  // The ACCA styling will be applied automatically when isACCAExam is true

  // Remove duplicate function declarations - these are already defined above
  // const toggleQuestionFlag = (questionIndex) => { ... };
  // Remove duplicate useEffect hooks - these are already defined above

  // Remove duplicate - handleAnswerSelect is already defined above
  // const handleAnswerSelect = (questionId, answerIndex) => {
  //   setAnswers(prev => ({
  //     ...prev,
  //     [questionId]: answerIndex
  //   }));
  // };

  // Remove duplicate - handleFillInTheBlankAnswer is already defined above

  // Remove duplicate - handleSubmit is already defined above

return (
  <div style={{
    minHeight: '100vh',
    background: isAccaExam ? '#f8fafc' : 
               isIeltsExam ? '#f0f8ff' : 
               isToeflExam ? '#fff8f0' : 'var(--background)',
    fontFamily: isAccaExam ? "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" : 
                isIeltsExam ? "'Arial', 'Helvetica Neue', sans-serif" :
                isToeflExam ? "'Georgia', 'Times New Roman', serif" : 'inherit'
  }}>
      
      {/* Debug Panel */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#000',
        color: '#00ff00',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        <div>Calculator: {showCalculator ? 'ON' : 'OFF'}</div>
        <div>Navigator: {showQuestionNavigator ? 'ON' : 'OFF'}</div>
        <div>Questions: {questions?.length || 0}</div>
        <div>Current: {currentQuestion + 1}</div>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => setShowCalculator(true)}
            style={{ background: '#00ff00', color: '#000', border: 'none', padding: '5px', marginRight: '5px' }}
          >
            Force Calculator ON
          </button>
          <button 
            onClick={() => setShowQuestionNavigator(true)}
            style={{ background: '#00ff00', color: '#000', border: 'none', padding: '5px' }}
          >
            Force Navigator ON
          </button>
        </div>
      </div>
      {/* ACCA Full-Screen Question Modal */}
      {isAccaExam && showFullScreenQuestion && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#f5f5f5',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top Header - Black Bar */}
          <div style={{
            background: '#000000',
            color: 'white',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #333'
          }}>
            <button
              onClick={() => setShowFullScreenQuestion(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <FiChevronLeft size={16} />
              Back
            </button>
            <div></div>
          </div>

          {/* Second Header - Light Grey with Sections */}
          <div style={{
            background: '#e0e0e0',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ccc'
          }}>
            {/* Left Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                background: '#dc2626',
                color: 'white',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                ACCA
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  Section A
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  Question {currentQuestion + 1}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {currentQuestionData?.marks || 2} marks
                </div>
              </div>
            </div>

            {/* Middle Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Time Remaining
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {Math.floor(timeLeft / 3600)}:{Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Test {Math.round(examProgress)}% Complete
                </div>
                <div style={{
                  width: '120px',
                  height: '8px',
                  background: '#ddd',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${examProgress}%`,
                    height: '100%',
                    background: '#f59e0b',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                  Test Progress Details ▼
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                FFA-Financial Accounting
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Sep 24 - Aug 25
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Test Number 2
              </div>
              <button
                onClick={() => setShowFullScreenQuestion(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginTop: '4px'
                }}
              >
                Exit
              </button>
            </div>
          </div>
          
          {/* ACCA Question Area - Full Screen */}
          <div style={{
            flex: 1,
            padding: '40px 50px',
            background: '#ffffff',
            overflow: 'auto'
          }}>
            {/* Question Content */}
            <div style={{
              background: '#f8f9fa',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <div style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333',
                fontWeight: '500',
                marginBottom: '20px'
              }}>
                {currentQuestionData?.text}
              </div>
              
              {/* Example: Double Entry Table for Accounting Questions */}
              {currentQuestionData?.text?.includes('double entry') && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '1px',
                    background: '#dee2e6',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      fontWeight: '600',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6'
                    }}>
                      $600,000
                    </div>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      fontWeight: '600',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6'
                    }}>
                      $650,000
                    </div>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      fontWeight: '600',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6'
                    }}>
                      $685,000
                    </div>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      $700,000
                    </div>
                    
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="cr-cash"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="cr-cash"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="cr-cash"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="cr-cash"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="dr-assets"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="dr-assets"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="dr-assets"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <input
                        type="radio"
                        name="dr-assets"
                        style={{ marginRight: '8px' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#495057'
                  }}>
                    <span>Cr Cash</span>
                    <span>Dr Non-current assets - Cost</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Question Content */}
            {currentQuestionData && (
              <div style={{ marginBottom: '40px' }}>
                {currentQuestionData.type === 'MULTIPLE_CHOICE' && (
              <div>
                    {currentQuestionData.options?.map((option, index) => (
                      <label
                        key={option.id}
                        style={{
                  display: 'flex', 
                  alignItems: 'center',
                          gap: '12px',
                          padding: '15px',
                  marginBottom: '12px', 
                          border: `2px solid ${answers[currentQuestionData.id] === index ? '#dc2626' : '#e5e7eb'}`,
                          borderRadius: '0',
                          background: answers[currentQuestionData.id] === index ? '#fef2f2' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (answers[currentQuestionData.id] !== index) {
                            e.target.style.borderColor = '#dc2626';
                            e.target.style.background = '#fef2f2';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (answers[currentQuestionData.id] !== index) {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.background = '#ffffff';
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          checked={answers[currentQuestionData.id] === index}
                          onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                          style={{ display: 'none' }}
                />
                <div style={{ 
                          width: '18px',
                          height: '18px',
                          borderRadius: '0',
                          border: `2px solid ${answers[currentQuestionData.id] === index ? '#dc2626' : '#9ca3af'}`,
                          background: answers[currentQuestionData.id] === index ? '#dc2626' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                }}>
                          {answers[currentQuestionData.id] === index && (
                            <FaCircle size={8} color="white" />
                          )}
                </div>
                        <span style={{
                          fontSize: '14px',
                  fontWeight: '500',
                          color: '#374151',
                          flex: 1
                }}>
                          {option.text}
                        </span>
                </label>
                    ))}
                  </div>
                )}
                
                {currentQuestionData.type === 'FILL_IN_THE_BLANK' && (
                  <div>
                    {currentQuestionData.blanks?.map((blank, index) => (
                      <div key={index} style={{ marginBottom: '15px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px'
                    }}>
                      Blank {index + 1}:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQuestionData.id]?.[index] || ''}
                          onChange={(e) => handleFillInTheBlankAnswer(currentQuestionData.id, index, e.target.value)}
                      style={{
                        width: '100%',
                            padding: '12px 16px',
                            fontSize: '14px',
                            border: '2px solid #dc2626',
                            borderRadius: '0',
                            background: '#ffffff',
                            color: '#374151',
                            fontWeight: '500'
                          }}
                          placeholder={`Enter answer for blank ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
                )}
                  </div>
            )}

          {/* Footer Navigation - Dark Grey */}
          <div style={{ 
            background: '#495057',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #6c757d'
          }}>
            {/* Left - Help Button */}
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#fbbf24',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <div style={{ fontSize: '16px' }}>?</div>
              Help
            </button>

            {/* Center - Navigation Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => toggleQuestionFlag(currentQuestion)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fbbf24',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FaFlag size={16} />
                Flag
              </button>
              
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentQuestion === 0 ? '#6c757d' : '#ffffff',
                  cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FiChevronLeft size={16} />
                Previous
              </button>
              
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestion === questions.length - 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentQuestion === questions.length - 1 ? '#6c757d' : '#dc3545',
                  cursor: currentQuestion === questions.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FiChevronRight size={16} />
                Next
              </button>
            </div>

            {/* Right - Empty space for balance */}
            <div></div>
          </div>
              
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    console.log('🔍 Navigator button clicked!');
                    console.log('🔍 Current showQuestionNavigator state:', showQuestionNavigator);
                    console.log('🔍 About to call toggleQuestionNavigator');
                    setShowQuestionNavigator(!showQuestionNavigator);
                    console.log('🔍 State will be set to:', !showQuestionNavigator);
                  }}
                  style={{
                    background: '#fbbf24',
                    color: '#92400e',
                    border: '2px solid #d97706',
                    padding: '10px 18px',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f59e0b';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fbbf24';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FiGrid size={14} style={{ marginRight: '6px' }} />
                  Navigator
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔍 Calculator button clicked!');
                    console.log('🔍 Current showCalculator state:', showCalculator);
                    console.log('🔍 About to call toggleCalculator');
                    setShowCalculator(!showCalculator);
                    console.log('🔍 State will be set to:', !showCalculator);
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: '2px solid #059669',
                    padding: '10px 18px',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#059669';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#10b981';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FaCalculator size={14} style={{ marginRight: '6px' }} />
                  Calculator
                </button>
              </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                  onClick={handleSubmit}
                style={{
                    background: '#dc2626',
                  color: 'white',
                    border: '2px solid #b91c1c',
                    padding: '12px 25px',
                    borderRadius: '0',
                  fontSize: '14px',
                    fontWeight: '700',
                  cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#b91c1c';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Submit Exam
                  <FiSend size={16} style={{ marginLeft: '6px' }} />
              </button>
            ) : (
              <button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                style={{
                    background: '#dc2626',
                  color: 'white',
                    border: '2px solid #b91c1c',
                    padding: '12px 25px',
                    borderRadius: '0',
                  fontSize: '14px',
                    fontWeight: '700',
                  cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#b91c1c';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
              >
                Next
                  <FiChevronRight size={16} style={{ marginLeft: '6px' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACCA Modals */}
      {isAccaExam && (
        <>
          {/* Instructions Modal */}
          {showInstructions && (
         <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '0',
                padding: '40px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '3px solid #dc2626'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  borderBottom: '3px solid #dc2626',
                  paddingBottom: '20px'
                }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: '#dc2626',
                    margin: 0,
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}>
                    🎯 ACCA EXAM INSTRUCTIONS
                  </h2>
                    <button
                    onClick={toggleInstructions}
                      style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                        width: '40px',
                        height: '40px',
                      borderRadius: '50%',
                      fontSize: '24px',
                        cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                    </button>
                </div>

                <div style={{ lineHeight: '1.8', color: '#1f2937', fontSize: '16px' }}>
                <div style={{ 
                    background: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '25px'
                  }}>
                    <h3 style={{ color: '#dc2626', marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>⚠️ CRITICAL EXAM RULES:</h3>
                    <ul style={{ marginBottom: '20px', paddingLeft: '20px', color: '#991b1b' }}>
                      <li><strong>DO NOT refresh the page</strong> - Your progress will be lost</li>
                      <li><strong>DO NOT close the browser tab</strong> - Exam will be terminated</li>
                      <li><strong>Ensure stable internet connection</strong> throughout the exam</li>
                      <li><strong>Complete all questions</strong> before time expires</li>
                    </ul>
                  </div>
                  
                  <h3 style={{ color: '#dc2626', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>📋 EXAM FORMAT:</h3>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li><strong>Total Questions:</strong> {exam?.totalQuestions || 0}</li>
                    <li><strong>Time Limit:</strong> {exam?.duration || 60} minutes</li>
                    <li><strong>Passing Score:</strong> {exam?.passingMarks || 50}%</li>
                    <li><strong>Question Types:</strong> Multiple Choice, Fill in the Blanks</li>
                  </ul>
                  
                  <h3 style={{ color: '#dc2626', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>⚡ AVAILABLE TOOLS:</h3>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li><strong>🧮 Calculator:</strong> Scientific calculator for calculations</li>
                    <li><strong>🧭 Navigator:</strong> Jump between questions easily</li>
                    <li><strong>🚩 Flag System:</strong> Mark questions for review</li>
                    <li><strong>📊 Progress Tracker:</strong> Real-time completion status</li>
                  </ul>
                  
                  <h3 style={{ color: '#dc2626', marginBottom: '15px', fontSize: '18px', fontWeight: '700' }}>🎯 NAVIGATION:</h3>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li>Use <strong>Previous/Next</strong> buttons to navigate</li>
                    <li>Use <strong>Question Navigator</strong> to jump to specific questions</li>
                    <li>Flag questions you want to review later</li>
                    <li>Submit only when you're completely satisfied</li>
                  </ul>
                </div>
                
                <button
                  onClick={toggleInstructions}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '0',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '18px',
                    marginTop: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    width: '100%'
                  }}
                >
                  🚀 START ACCA EXAM
                </button>
              </div>
            </div>
          )}

          {/* Calculator Modal */}
          {showCalculator && (
                  <div style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
                    display: 'flex', 
                    alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
                  }}>
                    <div style={{ 
                background: 'white',
                borderRadius: '0',
                padding: '30px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '3px solid #dc2626'
              }}>
                  <div style={{ 
                    display: 'flex', 
                  justifyContent: 'space-between',
                    alignItems: 'center', 
                  marginBottom: '25px',
                  borderBottom: '2px solid #dc2626',
                  paddingBottom: '15px'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#dc2626',
                    margin: 0,
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}>
                    🧮 ACCA CALCULATOR
                  </h2>
                  <button
                    onClick={toggleCalculator}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      fontSize: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                  </div>
                
                  <div style={{ 
                  background: '#f8fafc',
                  border: '2px solid #dc2626',
                  borderRadius: '0',
                  padding: '20px',
                  marginBottom: '25px',
                  fontFamily: 'monospace',
                  fontSize: '24px',
                  textAlign: 'right',
                  minHeight: '60px',
                    display: 'flex', 
                    alignItems: 'center', 
                  justifyContent: 'flex-end',
                  fontWeight: '600'
                }}>
                  <span>{calculatorDisplay}</span>
                </div>
                
                    <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleCalculatorInput(btn)}
                      style={{
                        background: btn === '=' ? '#dc2626' : btn === 'C' ? '#ef4444' : ['+', '-', '×', '÷', '±', '%'].includes(btn) ? '#fbbf24' : '#f1f5f9',
                        color: btn === '=' ? 'white' : btn === 'C' ? 'white' : ['+', '-', '×', '÷', '±', '%'].includes(btn) ? '#92400e' : '#1f2937',
                        border: '2px solid #e5e7eb',
                        padding: '18px 8px',
                        borderRadius: '0',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        gridColumn: btn === '0' ? 'span 2' : 'span 1'
                      }}
                      onMouseEnter={(e) => {
                        if (btn !== '=') {
                          e.target.style.background = '#e5e7eb';
                          e.target.style.borderColor = '#dc2626';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (btn !== '=') {
                          e.target.style.background = '#f1f5f9';
                          e.target.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      {btn}
                    </button>
                  ))}
                  </div>
                

              </div>
            </div>
          )}

          {/* Question Navigator Modal */}
          {showQuestionNavigator && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
                    display: 'flex', 
                    alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
                  }}>
                    <div style={{ 
                background: 'white',
                borderRadius: '0',
                padding: '30px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '3px solid #dc2626'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '25px',
                  borderBottom: '2px solid #dc2626',
                  paddingBottom: '15px'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#dc2626',
                    margin: 0,
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}>
                    🧭 ACCA QUESTION NAVIGATOR
                  </h2>
                  <button
                    onClick={toggleQuestionNavigator}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%', 
                      fontSize: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '10px',
                    background: '#f3f4f6',
                    border: '2px solid #dc2626',
                    borderRadius: '0',
                    marginBottom: '15px'
                  }}>
                    <strong>Total Questions: {questions.length}</strong> | 
                    <strong>Current: {currentQuestion + 1}</strong> | 
                    <strong>Answered: {Object.keys(answers).length}</strong>
                  </div>
                  {questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      style={{
                        background: index === currentQuestion ? '#dc2626' : 
                                   answers[question.id] ? '#059669' : 
                                   flaggedQuestions.has(index) ? '#d97706' : '#f3f4f6',
                        color: index === currentQuestion ? 'white' : 
                               answers[question.id] ? 'white' : '#374151',
                        border: `3px solid ${index === currentQuestion ? '#dc2626' : 
                                    answers[question.id] ? '#059669' : 
                                    flaggedQuestions.has(index) ? '#d97706' : '#d1d5db'}`,
                        padding: '15px 10px',
                        borderRadius: '0',
                        fontSize: '16px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (index !== currentQuestion) {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== currentQuestion) {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {index + 1}
                      {flaggedQuestions.has(index) && (
                    <span style={{ 
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          fontSize: '12px',
                          color: '#dc2626'
                        }}>
                          🚩
                    </span>
                      )}
                    </button>
                  ))}
              </div>

                <div style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                padding: '20px',
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0'
                }}>
              <div style={{ 
                display: 'flex', 
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '25px',
                      height: '25px',
                      backgroundColor: '#f3f4f6',
                      border: '3px solid #d1d5db',
                      borderRadius: '0'
                    }}></div>
                    <span>Unanswered</span>
                  </div>
                  
                  <div style={{
                  display: 'flex',
                  alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '25px',
                      height: '25px',
                      backgroundColor: '#059669',
                      border: '3px solid #059669',
                      borderRadius: '0'
                    }}></div>
                    <span>Answered</span>
              </div>
              
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '600'
              }}>
                <div style={{
                      width: '25px',
                      height: '25px',
                      backgroundColor: '#dc2626',
                      border: '3px solid #dc2626',
                      borderRadius: '0'
                }}></div>
                    <span>Current</span>
              </div>
              
              <div style={{
                display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '25px',
                      height: '25px',
                      backgroundColor: '#d97706',
                                              border: '3px solid #d97706',
                      borderRadius: '0'
                    }}></div>
                    <span>Flagged</span>
              </div>
            </div>
            </div>
      </div>
          )}
        </>
      )}

      {/* Regular Interface Fallback (for non-ACCA exams) */}
      {!isAccaExam && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px'
        }}>
          {/* Regular exam interface content */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h1>Regular Exam Interface</h1>
            <p>This is the standard exam interface for non-ACCA exams.</p>
    </div>
        </div>
      )}

      {/* Calculator Modal - Root Level */}
      {showCalculator && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '0',
            padding: '30px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '3px solid #dc2626'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '25px',
              borderBottom: '2px solid #dc2626',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#dc2626',
                margin: 0,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}>
                🧮 ACCA CALCULATOR
              </h2>
              <button
                onClick={() => setShowCalculator(false)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              background: '#f8fafc',
              border: '2px solid #dc2626',
              borderRadius: '0',
              padding: '20px',
              marginBottom: '25px',
              fontFamily: 'monospace',
              fontSize: '24px',
              textAlign: 'right',
              minHeight: '60px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              fontWeight: '600'
            }}>
              <span>{calculatorDisplay}</span>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '15px'
            }}>
              {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalculatorInput(btn)}
                  style={{
                    background: btn === '=' ? '#dc2626' : btn === 'C' ? '#ef4444' : ['+', '-', '×', '÷', '±', '%'].includes(btn) ? '#fbbf24' : '#f1f5f9',
                    color: btn === '=' ? 'white' : btn === 'C' ? 'white' : ['+', '-', '×', '÷', '±', '%'].includes(btn) ? '#92400e' : '#1f2937',
                    border: '2px solid #e5e7eb',
                    padding: '18px 8px',
                    borderRadius: '0',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    gridColumn: btn === '0' ? 'span 2' : 'span 1'
                  }}
                  onMouseEnter={(e) => {
                    if (btn !== '=') {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.borderColor = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (btn !== '=') {
                      e.target.style.background = '#f1f5f9';
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question Navigator Modal - Root Level */}
      {showQuestionNavigator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '0',
            padding: '30px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '3px solid #dc2626'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid #dc2626',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#dc2626',
                margin: 0,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}>
                🧭 ACCA QUESTION NAVIGATOR
              </h2>
              <button
                onClick={() => setShowQuestionNavigator(false)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%', 
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '10px',
                background: '#f3f4f6',
                border: '2px solid #dc2626',
                borderRadius: '0',
                marginBottom: '15px'
              }}>
                <strong>Total Questions: {questions.length}</strong> | 
                <strong>Current: {currentQuestion + 1}</strong> | 
                <strong>Answered: {Object.keys(answers).length}</strong>
              </div>
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  style={{
                    background: index === currentQuestion ? '#dc2626' : 
                               answers[question.id] ? '#059669' : 
                               flaggedQuestions.has(index) ? '#d97706' : '#f3f4f6',
                    color: index === currentQuestion ? 'white' : 
                           answers[question.id] ? 'white' : '#374151',
                    border: `3px solid ${index === currentQuestion ? '#dc2626' : 
                                answers[question.id] ? '#059669' : 
                                flaggedQuestions.has(index) ? '#d97706' : '#d1d5db'}`,
                    padding: '15px 10px',
                    borderRadius: '0',
                    fontSize: '16px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentQuestion) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentQuestion) {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {index + 1}
                  {flaggedQuestions.has(index) && (
                    <span style={{ 
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      fontSize: '12px',
                      color: '#dc2626'
                    }}>
                      🚩
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '20px',
              background: '#f9fafb',
              border: '2px solid #e5e7eb',
              borderRadius: '0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#f3f4f6',
                  border: '3px solid #d1d5db',
                  borderRadius: '0'
                }}></div>
                <span>Unanswered</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#059669',
                  border: '3px solid #059669',
                  borderRadius: '0'
                }}></div>
                <span>Answered</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#dc2626',
                  border: '3px solid #dc2626',
                  borderRadius: '0'
                }}></div>
                <span>Current</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#d97706',
                  border: '3px solid #d97706',
                  borderRadius: '0'
                }}></div>
                <span>Flagged</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IELTS Full-Screen Question Modal */}
      {isIeltsExam && showFullScreenQuestion && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* IELTS Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            color: 'white',
            padding: '20px 30px',
            borderBottom: '3px solid #1d4ed8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(30, 64, 175, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                background: '#fbbf24',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1e40af'
              }}>
                🎯
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  IELTS {exam?.title}
                </h1>
                <p style={{ 
                  fontSize: '14px',
                  margin: 0,
                  opacity: 0.9,
                  fontWeight: '600'
                }}>
                  International English Language Testing System
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              {/* Question Counter */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  marginBottom: '4px'
                }}>
                  Question
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#fbbf24'
                }}>
                  {currentQuestion + 1} / {questions.length}
                </div>
              </div>
              
              {/* Timer */}
              <div style={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #1d4ed8',
                textAlign: 'center',
                minWidth: '120px'
              }}>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  marginBottom: '4px'
                }}>
                  Time Left
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#fbbf24'
                }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '180px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  width: `${examProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          </div>
          
          {/* IELTS Question Area */}
          <div style={{
            flex: 1,
            padding: '40px 50px',
            background: '#ffffff',
            overflow: 'auto'
          }}>
            {/* Question Content */}
            <div style={{
              background: '#f8fafc',
              border: '3px solid #e5e7eb',
              borderRadius: '16px',
              padding: '35px',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#1f2937',
                fontWeight: '500',
                marginBottom: '25px'
              }}>
                {questions[currentQuestion]?.text}
              </div>
              
              {/* Question Options */}
              {questions[currentQuestion]?.options && (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <label
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '18px 20px',
                        background: answers[questions[currentQuestion].id] === index ? '#dbeafe' : '#ffffff',
                        border: `3px solid ${answers[questions[currentQuestion].id] === index ? '#1e40af' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: answers[questions[currentQuestion].id] === index ? '0 4px 15px rgba(30, 64, 175, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (answers[questions[currentQuestion].id] !== index) {
                          e.target.style.borderColor = '#1e40af';
                          e.target.style.background = '#f0f9ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (answers[questions[currentQuestion].id] !== index) {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.background = '#ffffff';
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={index}
                        checked={answers[questions[currentQuestion].id] === index}
                        onChange={() => handleAnswerSelect(questions[currentQuestion].id, index)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#1e40af'
                        }}
                      />
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '30px',
              borderTop: '2px solid #e5e7eb'
            }}>
              <button
                onClick={() => navigateToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                style={{
                  background: currentQuestion === 0 ? '#f3f4f6' : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  color: currentQuestion === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: currentQuestion === 0 ? 'none' : '0 6px 20px rgba(30, 64, 175, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Previous
              </button>
              
              <button
                onClick={() => navigateToQuestion(currentQuestion + 1)}
                disabled={currentQuestion === questions.length - 1}
                style={{
                  background: currentQuestion === questions.length - 1 ? '#f3f4f6' : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                  color: currentQuestion === questions.length - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: currentQuestion === questions.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: currentQuestion === questions.length - 1 ? 'none' : '0 6px 20px rgba(30, 64, 175, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOEFL Full-Screen Question Modal */}
      {isToeflExam && showFullScreenQuestion && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* TOEFL Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            color: 'white',
            padding: '20px 30px',
            borderBottom: '3px solid #6d28d9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                background: '#fbbf24',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#7c3aed'
              }}>
                🌍
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  TOEFL {exam?.title}
                </h1>
                <p style={{ 
                  fontSize: '14px',
                  margin: 0,
                  opacity: 0.9,
                  fontWeight: '600'
                }}>
                  Test of English as a Foreign Language
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              {/* Question Counter */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  marginBottom: '4px'
                }}>
                  Question
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#fbbf24'
                }}>
                  {currentQuestion + 1} / {questions.length}
                </div>
              </div>
              
              {/* Timer */}
              <div style={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #6d28d9',
                textAlign: 'center',
                minWidth: '120px'
              }}>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  marginBottom: '4px'
                }}>
                  Time Left
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#fbbf24'
                }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '180px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  width: `${examProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          </div>
          
          {/* TOEFL Question Area */}
          <div style={{
            flex: 1,
            padding: '40px 50px',
            background: '#ffffff',
            overflow: 'auto'
          }}>
            {/* Question Content */}
            <div style={{
              background: '#faf5ff',
              border: '3px solid #e9d5ff',
              borderRadius: '16px',
              padding: '35px',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.05)'
            }}>
              <div style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#1f2937',
                fontWeight: '500',
                marginBottom: '25px'
              }}>
                {questions[currentQuestion]?.text}
              </div>
              
              {/* Question Options */}
              {questions[currentQuestion]?.options && (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <label
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '18px 20px',
                        background: answers[questions[currentQuestion].id] === index ? '#f3e8ff' : '#ffffff',
                        border: `3px solid ${answers[questions[currentQuestion].id] === index ? '#7c3aed' : '#e9d5ff'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: answers[questions[currentQuestion].id] === index ? '0 4px 15px rgba(124, 58, 237, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (answers[questions[currentQuestion].id] !== index) {
                          e.target.style.borderColor = '#7c3aed';
                          e.target.style.background = '#faf5ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (answers[questions[currentQuestion].id] !== index) {
                          e.target.style.borderColor = '#e9d5ff';
                          e.target.style.background = '#ffffff';
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={index}
                        checked={answers[questions[currentQuestion].id] === index}
                        onChange={() => handleAnswerSelect(questions[currentQuestion].id, index)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#7c3aed'
                        }}
                      />
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '30px',
              borderTop: '2px solid #e9d5ff'
            }}>
              <button
                onClick={() => navigateToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                style={{
                  background: currentQuestion === 0 ? '#f3f4f6' : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                  color: currentQuestion === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: currentQuestion === 0 ? 'none' : '0 6px 20px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Previous
              </button>
              
              <button
                onClick={() => navigateToQuestion(currentQuestion + 1)}
                disabled={currentQuestion === questions.length - 1}
                style={{
                  background: currentQuestion === questions.length - 1 ? '#f3f4f6' : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                  color: currentQuestion === questions.length - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: currentQuestion === questions.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: currentQuestion === questions.length - 1 ? 'none' : '0 6px 20px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal - Root Level */}
      {showCalculator && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '0',
            padding: '30px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '3px solid #dc2626'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '25px',
              borderBottom: '2px solid #dc2626',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#dc2626',
                margin: 0,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}>
                🧮 ACCA CALCULATOR
              </h2>
              <button
                onClick={() => setShowCalculator(false)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              background: '#f8fafc',
              border: '2px solid #dc2626',
              borderRadius: '0',
              padding: '20px',
              marginBottom: '25px',
              fontFamily: 'monospace',
              fontSize: '24px',
              textAlign: 'right',
              minHeight: '60px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              fontWeight: '600'
            }}>
              <span>{calculatorDisplay}</span>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '15px'
            }}>
              {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalculatorInput(btn)}
                  style={{
                    background: btn === '=' ? '#dc2626' : btn === 'C' ? '#ef4444' : ['+', '-', '×', '÷', '±', '%'].includes(btn) ? '#fbbf24' : '#f1f5f9',
                    color: btn === '=' ? 'white' : btn === 'C' ? 'white' : ['+', '-', '×', '÷', '±', '%'].includes(btn) ? '#92400e' : '#1f2937',
                    border: '2px solid #e5e7eb',
                    padding: '18px 8px',
                    borderRadius: '0',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    gridColumn: btn === '0' ? 'span 2' : 'span 1'
                  }}
                  onMouseEnter={(e) => {
                    if (btn !== '=') {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.borderColor = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (btn !== '=') {
                      e.target.style.background = '#f1f5f9';
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question Navigator Modal - Root Level */}
      {showQuestionNavigator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '0',
            padding: '30px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '3px solid #dc2626'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid #dc2626',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#dc2626',
                margin: 0,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}>
                🧭 ACCA QUESTION NAVIGATOR
              </h2>
              <button
                onClick={() => setShowQuestionNavigator(false)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%', 
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '10px',
                background: '#f3f4f6',
                border: '2px solid #dc2626',
                borderRadius: '0',
                marginBottom: '15px'
              }}>
                <strong>Total Questions: {questions.length}</strong> | 
                <strong>Current: {currentQuestion + 1}</strong> | 
                <strong>Answered: {Object.keys(answers).length}</strong>
              </div>
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  style={{
                    background: index === currentQuestion ? '#dc2626' : 
                               answers[question.id] ? '#059669' : 
                               flaggedQuestions.has(index) ? '#d97706' : '#f3f4f6',
                    color: index === currentQuestion ? 'white' : 
                           answers[question.id] ? 'white' : '#374151',
                    border: `3px solid ${index === currentQuestion ? '#dc2626' : 
                                answers[question.id] ? '#059669' : 
                                flaggedQuestions.has(index) ? '#d97706' : '#d1d5db'}`,
                    padding: '15px 10px',
                    borderRadius: '0',
                    fontSize: '16px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentQuestion) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentQuestion) {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {index + 1}
                  {flaggedQuestions.has(index) && (
                    <span style={{ 
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      fontSize: '12px',
                      color: '#dc2626'
                    }}>
                      🚩
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '20px',
              background: '#f9fafb',
              border: '2px solid #e5e7eb',
              borderRadius: '0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#f3f4f6',
                  border: '3px solid #d1d5db',
                  borderRadius: '0'
                }}></div>
                <span>Unanswered</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#059669',
                  border: '3px solid #059669',
                  borderRadius: '0'
                }}></div>
                <span>Answered</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#dc2626',
                  border: '3px solid #dc2626',
                  borderRadius: '0'
                }}></div>
                <span>Current</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#d97706',
                  border: '3px solid #d97706',
                  borderRadius: '0'
                }}></div>
                <span>Flagged</span>
              </div>
            </div>
          </div>
        </div>
      )}
  </div>
);
};

export default ExamInterface; 