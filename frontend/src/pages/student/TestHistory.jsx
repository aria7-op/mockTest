import React, { useState } from 'react';

const TestHistory = () => {
  const [testHistory, setTestHistory] = useState([
    {
      id: 1,
      testName: 'Mathematics Final',
      subject: 'Mathematics',
      score: 85,
      totalQuestions: 50,
      correctAnswers: 42,
      date: '2024-01-08',
      duration: '120 min',
      status: 'passed',
      timeTaken: '115 min'
    },
    {
      id: 2,
      testName: 'Physics Midterm',
      subject: 'Physics',
      score: 78,
      totalQuestions: 40,
      correctAnswers: 31,
      date: '2024-01-05',
      duration: '90 min',
      status: 'passed',
      timeTaken: '87 min'
    },
    {
      id: 3,
      testName: 'Chemistry Quiz',
      subject: 'Chemistry',
      score: 92,
      totalQuestions: 25,
      correctAnswers: 23,
      date: '2024-01-02',
      duration: '60 min',
      status: 'passed',
      timeTaken: '45 min'
    },
    {
      id: 4,
      testName: 'Biology Test',
      subject: 'Biology',
      score: 65,
      totalQuestions: 30,
      correctAnswers: 19,
      date: '2023-12-28',
      duration: '75 min',
      status: 'failed',
      timeTaken: '70 min'
    }
  ]);

  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredHistory = testHistory.filter(test => {
    const matchesSubject = filterSubject === 'all' || test.subject === filterSubject;
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    return matchesSubject && matchesStatus;
  });

  const averageScore = testHistory.reduce((acc, test) => acc + test.score, 0) / testHistory.length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
          Test History
        </h1>
        <p style={{ color: '#64748b' }}>
          View your past test results and performance
        </p>
      </div>

      {/* Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Total Tests</div>
            <div className="card-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">{testHistory.length}</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Tests completed
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Average Score</div>
            <div className="card-icon green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">{averageScore.toFixed(1)}%</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Overall performance
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Pass Rate</div>
            <div className="card-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="card-value">
            {Math.round((testHistory.filter(t => t.status === 'passed').length / testHistory.length) * 100)}%
          </div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Success rate
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="data-table" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <div className="table-title">Filters</div>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select 
              className="form-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test History Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="table-title">Test Results ({filteredHistory.length})</div>
          <div className="table-actions">
            <button className="btn btn-secondary">Export Results</button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Questions</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((test) => (
                <tr key={test.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {test.testName}
                    </div>
                  </td>
                  <td>{test.subject}</td>
                  <td>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '700', 
                      color: test.score >= 70 ? '#10b981' : '#ef4444'
                    }}>
                      {test.score}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {test.correctAnswers}/{test.totalQuestions}
                    </div>
                  </td>
                  <td>{test.totalQuestions}</td>
                  <td>{new Date(test.date).toLocaleDateString()}</td>
                  <td>
                    <div>{test.duration}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Taken: {test.timeTaken}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${test.status === 'passed' ? 'status-active' : 'status-inactive'}`}>
                      {test.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                        View Details
                      </button>
                      <button className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                        Retake
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestHistory; 