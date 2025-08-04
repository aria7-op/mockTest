import React from 'react';

const Analytics = () => {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
          Analytics & Reports
        </h1>
        <p style={{ color: '#64748b' }}>
          Comprehensive insights and performance metrics
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Test Completion Rate</div>
            <div className="card-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">94.2%</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +2.1% from last month
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Average Score</div>
            <div className="card-icon green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="card-value">78.5%</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +3.2% improvement
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Active Students</div>
            <div className="card-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="card-value">1,156</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +45 this week
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">Tests This Month</div>
            <div className="card-icon orange">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="card-value">23</div>
          <div className="card-change positive">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +8 scheduled
          </div>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="table-title">Performance by Subject</div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {[
              { subject: 'Mathematics', avgScore: 82.3, students: 456, trend: '+5.2%' },
              { subject: 'Physics', avgScore: 76.8, students: 342, trend: '+2.1%' },
              { subject: 'Chemistry', avgScore: 79.1, students: 298, trend: '+3.8%' },
              { subject: 'Biology', avgScore: 81.5, students: 234, trend: '+4.5%' }
            ].map((item, index) => (
              <div key={index} style={{ 
                padding: '1rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                background: 'white'
              }}>
                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  {item.subject}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea', marginBottom: '0.5rem' }}>
                  {item.avgScore}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  {item.students} students
                </div>
                <div className="card-change positive" style={{ fontSize: '0.875rem' }}>
                  {item.trend} from last month
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 