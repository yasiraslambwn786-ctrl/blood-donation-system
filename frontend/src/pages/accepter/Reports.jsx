// FILE: src/pages/accepter/Reports.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.post('/accepter/generate-report', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    alert('PDF export functionality would be implemented here');
  };

  const exportToExcel = () => {
    alert('Excel export functionality would be implemented here');
  };

  const printReport = () => {
    window.print();
  };

  // Sample data for charts
  const donationTrendData = [
    { name: 'Jan', donations: 45, verifications: 40 },
    { name: 'Feb', donations: 52, verifications: 48 },
    { name: 'Mar', donations: 38, verifications: 35 },
    { name: 'Apr', donations: 65, verifications: 60 },
    { name: 'May', donations: 48, verifications: 45 },
    { name: 'Jun', donations: 55, verifications: 52 },
  ];

  const issuanceTrendData = [
    { name: 'Jan', issuances: 32 },
    { name: 'Feb', issuances: 45 },
    { name: 'Mar', issuances: 28 },
    { name: 'Apr', issuances: 52 },
    { name: 'May', issuances: 38 },
    { name: 'Jun', issuances: 42 },
  ];

  const bloodGroupDistribution = [
    { name: 'A+', value: 25 },
    { name: 'B+', value: 20 },
    { name: 'O+', value: 35 },
    { name: 'AB+', value: 8 },
    { name: 'A-', value: 5 },
    { name: 'B-', value: 4 },
    { name: 'O-', value: 2 },
    { name: 'AB-', value: 1 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  return (
    <div className="container-fluid">
      {/* Report Controls */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-chart-line me-2"></i>
            Generate Reports
          </h3>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Report Type</label>
              <select 
                className="form-control" 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <div className="d-grid">
                <button 
                  className="btn btn-primary"
                  onClick={generateReport}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-2"></i>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="col-md-12 mt-3">
              <div className="btn-group">
                <button className="btn btn-success" onClick={exportToExcel}>
                  <i className="fas fa-file-excel me-2"></i>
                  Export Excel
                </button>
                <button className="btn btn-danger" onClick={exportToPDF}>
                  <i className="fas fa-file-pdf me-2"></i>
                  Export PDF
                </button>
                <button className="btn btn-info" onClick={printReport}>
                  <i className="fas fa-print me-2"></i>
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-tint me-2"></i>
                Total Donations
              </h5>
              <h2 className="display-6">245</h2>
              <p className="card-text">This period</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-syringe me-2"></i>
                Total Issuances
              </h5>
              <h2 className="display-6">189</h2>
              <p className="card-text">This period</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-users me-2"></i>
                New Donors
              </h5>
              <h2 className="display-6">32</h2>
              <p className="card-text">This period</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-chart-pie me-2"></i>
                Utilization Rate
              </h5>
              <h2 className="display-6">77%</h2>
              <p className="card-text">Stock turnover</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        {/* Donation Trend Chart */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Donation & Verification Trend
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="donations" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="verifications" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Issuance Trend Chart */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-area me-2"></i>
                Blood Issuance Trend
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={issuanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="issuances" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        {/* Blood Group Distribution */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Blood Group Distribution
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bloodGroupDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bloodGroupDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Performance Metrics
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Verification Rate', value: 95 },
                  { name: 'Issuance Accuracy', value: 98 },
                  { name: 'Donor Satisfaction', value: 92 },
                  { name: 'Stock Accuracy', value: 96 },
                  { name: 'Response Time', value: 88 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      {reportData && (
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h3 className="card-title mb-0">
                  <i className="fas fa-table me-2"></i>
                  Detailed Report
                </h3>
              </div>
              
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Donations</th>
                        <th>Verifications</th>
                        <th>Issuances</th>
                        <th>New Donors</th>
                        <th>Stock In</th>
                        <th>Stock Out</th>
                        <th>Net Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.daily_summary?.map((day, index) => (
                        <tr key={index}>
                          <td>{day.date}</td>
                          <td>{day.donations}</td>
                          <td>{day.verifications}</td>
                          <td>{day.issuances}</td>
                          <td>{day.new_donors}</td>
                          <td className="text-success">{day.stock_in}</td>
                          <td className="text-danger">{day.stock_out}</td>
                          <td className={day.net_change >= 0 ? 'text-success' : 'text-danger'}>
                            {day.net_change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;