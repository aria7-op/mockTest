import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFlag } from 'react-icons/fa';

const ACCAInterface = ({
  showFullScreenQuestion,
  setShowFullScreenQuestion,
  currentQuestion,
  setCurrentQuestion,
  questions,
  currentQuestionData,
  timeLeft,
  examProgress,
  flaggedQuestions,
  toggleQuestionFlag,
  answers,
  handleAnswerSelect,
  handleFillInTheBlankAnswer
}) => {
  if (!showFullScreenQuestion) return null;

  return (
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

          {/* Regular Multiple Choice Questions */}
          {currentQuestionData?.type === 'MULTIPLE_CHOICE' && !currentQuestionData?.text?.includes('double entry') && (
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
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: 'white',
                        borderRadius: '50%'
                      }} />
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
          
          {/* Fill in the Blank Questions */}
          {currentQuestionData?.type === 'FILL_IN_THE_BLANK' && (
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
      </div>

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
    </div>
  );
};

export default ACCAInterface;
