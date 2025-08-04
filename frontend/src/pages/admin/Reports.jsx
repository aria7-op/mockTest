import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch analytics data
  const { 
    data: dashboardStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsAPI.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
  });

  const { 
    data: dashboardAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useQuery({
    queryKey: ['dashboard-analytics', selectedPeriod],
    queryFn: () => analyticsAPI.getDashboardAnalytics({ period: selectedPeriod }),
    refetchInterval: 60000, // Refetch every minute
  });

  const { 
    data: performanceAnalytics, 
    isLoading: performanceLoading, 
    error: performanceError 
  } = useQuery({
    queryKey: ['performance-analytics'],
    queryFn: () => analyticsAPI.getPerformanceAnalytics(),
    refetchInterval: 60000, // Refetch every minute
  });

  const { 
    data: categoryAnalytics, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useQuery({
    queryKey: ['category-analytics'],
    queryFn: () => analyticsAPI.getDashboardAnalytics({ includeCategories: true }),
    refetchInterval: 60000, // Refetch every minute
  });

  // Extract data from API responses
  const stats = dashboardStats?.data?.data?.overview || {};
  const analytics = dashboardAnalytics?.data?.data || {};
  const performance = performanceAnalytics?.data?.data || {};

  // Calculate derived stats
  const completionRate = stats.totalAttempts > 0 ? 
    Math.round((stats.totalAttempts / (stats.totalAttempts + stats.pendingAttempts || 0)) * 100) : 0;
  
  const averageScore = stats.averageScore || 0;
  const activeStudents = stats.totalUsers || 0;
  const testsConducted = stats.totalAttempts || 0;

  // Monthly trends data
  const monthlyData = analytics.trends?.userGrowth?.map((item, index) => ({
    month: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    tests: item._count?.id || 0,
    students: item._count?.id || 0,
    avgScore: Math.round(Math.random() * 20 + 70) // Placeholder until we have real score data
  })) || [];

  // Performance distribution data
  const performanceData = performance.scoreDistribution || [
    { range: '90-100%', count: 0, percentage: 0 },
    { range: '80-89%', count: 0, percentage: 0 },
    { range: '70-79%', count: 0, percentage: 0 },
    { range: '60-69%', count: 0, percentage: 0 }
  ];

  // Category performance data
  const categoryData = analytics.categoryStats?.map(cat => ({
    category: cat.name || 'Unknown',
    tests: cat.examCount || 0,
    avgScore: cat.averageScore || 0,
    students: cat.studentCount || 0
  })) || [];

  // Calculate max values for charts
  const maxTests = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.tests)) : 1;
  const maxStudents = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.students)) : 1;

  // Handle errors
  if (statsError || analyticsError || performanceError) {
    return (
      <div className="error-container">
        <h3>Error loading reports</h3>
        <p>Failed to load analytics data. Please try again later.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const isLoading = statsLoading || analyticsLoading || performanceLoading;

  return (
    <div>
      {/* Header with Period Selector */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '32px', 
        marginBottom: '32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--secondary-200)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--secondary-900)', margin: 0 }}>
            Analytics & Reports
          </h1>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '12px 20px',
              border: '2px solid var(--secondary-300)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="dashboard-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">Loading...</h3>
                  <div className="dashboard-card-icon primary">⏳</div>
                </div>
                <div className="dashboard-card-value">--</div>
                <p className="dashboard-card-description">Loading data...</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Test Completion Rate</h3>
                <div className="dashboard-card-icon primary">📊</div>
              </div>
              <div className="dashboard-card-value">{completionRate}%</div>
              <p className="dashboard-card-description">Average completion rate across all tests</p>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Average Score</h3>
                <div className="dashboard-card-icon success">📈</div>
              </div>
              <div className="dashboard-card-value">{averageScore}%</div>
              <p className="dashboard-card-description">Overall average score of all students</p>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Active Students</h3>
                <div className="dashboard-card-icon warning">👥</div>
              </div>
              <div className="dashboard-card-value">{activeStudents}</div>
              <p className="dashboard-card-description">Students who took tests this {selectedPeriod}</p>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Tests Conducted</h3>
                <div className="dashboard-card-icon danger">📝</div>
              </div>
              <div className="dashboard-card-value">{testsConducted}</div>
              <p className="dashboard-card-description">Total tests completed this {selectedPeriod}</p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Monthly Trends Chart */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--secondary-200)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)', margin: 0 }}>
              Monthly Trends
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-500)' }}></div>
                <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Tests</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success-500)' }}></div>
                <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Students</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Loading chart data...</p>
            </div>
          ) : monthlyData.length === 0 ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>No data available for the selected period</p>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'end', justifyContent: 'space-around', gap: '16px', padding: '24px' }}>
              {monthlyData.map((data, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '200px' }}>
                    <div style={{
                      width: '24px',
                      height: `${(data.tests / maxTests) * 200}px`,
                      backgroundColor: 'var(--primary-500)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease'
                    }}></div>
                    <div style={{
                      width: '24px',
                      height: `${(data.students / maxStudents) * 200}px`,
                      backgroundColor: 'var(--success-500)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--secondary-600)' }}>
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          )}
          )}
        </div>

        {/* Performance Distribution */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--secondary-200)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '24px' }}>
            Score Distribution
          </h3>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <p>Loading performance data...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {performanceData.map((data, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--secondary-700)' }}>
                      {data.range}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--secondary-900)' }}>
                      {data.count} students
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: 'var(--secondary-200)',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${data.percentage}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, var(--primary-500), var(--primary-600))`,
                      borderRadius: '6px',
                      transition: 'width 0.8s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Chart */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--secondary-200)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '24px' }}>
          Category Performance
        </h3>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <p>Loading category data...</p>
          </div>
        ) : categoryData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <p>No category data available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {categoryData.map((data, index) => (
              <div key={index} style={{
                padding: '20px',
                border: '2px solid var(--secondary-200)',
                borderRadius: '12px',
                backgroundColor: 'var(--secondary-50)',
                transition: 'all 0.3s ease'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '12px' }}>
                  {data.category}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Tests:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-600)' }}>{data.tests}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Avg Score:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--success-600)' }}>{data.avgScore}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--secondary-600)' }}>Students:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--warning-600)' }}>{data.students}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Reports */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--secondary-200)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '24px' }}>
          Available Reports
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { id: 1, title: 'Test Completion Report', description: 'Overview of test completion rates', type: 'analytics' },
            { id: 2, title: 'Student Performance Report', description: 'Individual student performance analysis', type: 'performance' },
            { id: 3, title: 'Category Performance Report', description: 'Performance by test categories', type: 'category' }
          ].map((report) => (
            <div key={report.id} style={{
              padding: '24px',
              border: '2px solid var(--secondary-200)',
              borderRadius: '12px',
              backgroundColor: 'var(--secondary-50)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--secondary-900)', marginBottom: '12px' }}>
                {report.title}
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--secondary-600)', marginBottom: '20px', lineHeight: '1.5' }}>
                {report.description}
              </p>
              <button 
                className="btn btn-primary" 
                style={{ fontSize: '14px' }}
                onClick={() => {
                  // Generate report using analytics API
                  analyticsAPI.exportAnalytics({ type: report.type })
                    .then(response => {
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      toast.success('Report generated successfully!');
                    })
                    .catch(error => {
                      toast.error('Failed to generate report');
                    });
                }}
              >
                📊 Generate Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports; 