import React, { useState } from 'react';

const StudentHistory = () => {
  const [testHistory, setTestHistory] = useState([
    { id: 1, name: 'JavaScript Fundamentals', category: 'Programming', score: 88, date: '2024-01-10', duration: 60, questions: 25, correct: 22 },
    { id: 2, name: 'Advanced Mathematics', category: 'Mathematics', score: 92, date: '2024-01-08', duration: 90, questions: 30, correct: 28 },
    { id: 3, name: 'Physics Basics', category: 'Science', score: 78, date: '2024-01-05', duration: 75, questions: 28, correct: 22 },
    { id: 4, name: 'English Grammar', category: 'Language', score: 85, date: '2024-01-02', duration: 45, questions: 20, correct: 17 }
  ]);

  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Programming', 'Mathematics', 'Science', 'Language', 'Design'];

  const filteredHistory = testHistory.filter(test =>
    filterCategory === 'all' || test.category === filterCategory
  );

  const averageScore = testHistory.length > 0 
    ? Math.round(testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length)
    : 0;

  return (
    <div>
      {/* Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Total Tests</h3>
            <div className="dashboard-card-icon primary">📝</div>
          </div>
          <div className="dashboard-card-value">{testHistory.length}</div>
          <p className="dashboard-card-description">Tests completed</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Average Score</h3>
            <div className="dashboard-card-icon success">📊</div>
          </div>
          <div className="dashboard-card-value">{averageScore}%</div>
          <p className="dashboard-card-description">Overall performance</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Best Score</h3>
            <div className="dashboard-card-icon warning">🏆</div>
          </div>
          <div className="dashboard-card-value">
            {testHistory.length > 0 ? Math.max(...testHistory.map(t => t.score)) : 0}%
          </div>
          <p className="dashboard-card-description">Highest achieved score</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Total Time</h3>
            <div className="dashboard-card-icon danger">⏱️</div>
          </div>
          <div className="dashboard-card-value">
            {testHistory.reduce((sum, test) => sum + test.duration, 0)} min
          </div>
          <p className="dashboard-card-description">Time spent on tests</p>
        </div>
      </div>

      {/* Test History Table */}
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="data-table-title">Test History</h2>
          <div className="data-table-actions">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--secondary-300)',
                borderRadius: '6px'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Category</th>
              <th>Score</th>
              <th>Correct/Total</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((test) => (
              <tr key={test.id}>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--secondary-900)' }}>
                    {test.name}
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">{test.category}</span>
                </td>
                <td>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: test.score >= 80 ? 'var(--success-600)' : 
                           test.score >= 60 ? 'var(--warning-600)' : 'var(--danger-600)'
                  }}>
                    {test.score}%
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>
                    {test.correct}/{test.questions}
                  </span>
                </td>
                <td>{test.duration} min</td>
                <td>{new Date(test.date).toLocaleDateString()}</td>
                <td>
                  <div className="data-table-actions-cell">
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      📊 View Details
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      🔄 Retake
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentHistory; 