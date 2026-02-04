// FILE: src/pages/accepter/Inventory.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUnits: 0,
    criticalGroups: [],
    lowStockGroups: [],
    lastUpdated: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.data);
      
      // Calculate stats
      let total = 0;
      const critical = [];
      const lowStock = [];
      
      response.data.data.forEach(item => {
        total += item.available_units;
        if (item.available_units === 0) {
          critical.push(item.blood_group);
        } else if (item.available_units < 5) {
          lowStock.push(item.blood_group);
        }
      });
      
      setStats({
        totalUnits: total,
        criticalGroups: critical,
        lowStockGroups: lowStock,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (bloodGroup, newStock) => {
    try {
      const token = localStorage.getItem('accepterToken');
      await axios.post('/accepter/update-inventory', {
        blood_group: bloodGroup,
        units: newStock
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Stock updated successfully!');
      fetchInventory();
    } catch (error) {
      alert('Error updating stock: ' + error.response?.data?.message);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Chart data
  const barData = inventory.map(item => ({
    name: item.blood_group,
    units: item.available_units,
    color: item.available_units === 0 ? '#dc3545' : 
           item.available_units < 5 ? '#ffc107' : '#28a745'
  }));

  const pieData = inventory.map(item => ({
    name: item.blood_group,
    value: item.available_units,
    color: item.available_units === 0 ? '#dc3545' : 
           item.available_units < 5 ? '#ffc107' : '#28a745'
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  return (
    <div className="container-fluid">
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-tint me-2"></i>
                Total Units
              </h5>
              <h2 className="display-4">{stats.totalUnits}</h2>
              <p className="card-text">Total blood units in stock</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-check-circle me-2"></i>
                Normal Stock
              </h5>
              <h2 className="display-4">
                {inventory.filter(i => i.available_units >= 5).length}
              </h2>
              <p className="card-text">Blood groups with normal stock</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Low Stock
              </h5>
              <h2 className="display-4">{stats.lowStockGroups.length}</h2>
              <p className="card-text">Blood groups with low stock</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-skull-crossbones me-2"></i>
                Critical
              </h5>
              <h2 className="display-4">{stats.criticalGroups.length}</h2>
              <p className="card-text">Blood groups out of stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Stock Level by Blood Group
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="units" name="Available Units">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Stock Distribution
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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
      </div>

      {/* Inventory Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title mb-0">
                  <i className="fas fa-boxes me-2"></i>
                  Blood Inventory Details
                </h3>
                <span className="text-muted">
                  Last Updated: {stats.lastUpdated}
                </span>
              </div>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Blood Group</th>
                        <th>Available Units</th>
                        <th>Minimum Required</th>
                        <th>Status</th>
                        <th>Last Donation</th>
                        <th>Last Issuance</th>
                        <th>Update Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(item => {
                        let status = 'Normal';
                        let statusClass = 'success';
                        let minRequired = 10;
                        
                        if (item.available_units === 0) {
                          status = 'Critical';
                          statusClass = 'danger';
                        } else if (item.available_units < 5) {
                          status = 'Low';
                          statusClass = 'warning';
                          minRequired = 5;
                        }

                        return (
                          <tr key={item.blood_group}>
                            <td>
                              <span className="badge bg-danger fs-6">
                                {item.blood_group}
                              </span>
                            </td>
                            <td>
                              <h4 className="mb-0">{item.available_units}</h4>
                            </td>
                            <td>{minRequired}</td>
                            <td>
                              <span className={`badge bg-${statusClass}`}>
                                {status}
                              </span>
                            </td>
                            <td>
                              {item.last_donation_date ? 
                                new Date(item.last_donation_date).toLocaleDateString() : 
                                'No donations yet'
                              }
                            </td>
                            <td>
                              {item.last_issuance_date ? 
                                new Date(item.last_issuance_date).toLocaleDateString() : 
                                'No issuances yet'
                              }
                            </td>
                            <td>
                              <div className="input-group input-group-sm">
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  defaultValue={item.available_units}
                                  style={{ width: '70px' }}
                                />
                                <button 
                                  className="btn btn-primary"
                                  onClick={(e) => {
                                    const input = e.target.previousElementSibling;
                                    handleUpdateStock(item.blood_group, input.value);
                                  }}
                                >
                                  <i className="fas fa-save"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Alerts Section */}
              <div className="row mt-4">
                {stats.criticalGroups.length > 0 && (
                  <div className="col-md-6">
                    <div className="alert alert-danger">
                      <h5>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Critical Alert!
                      </h5>
                      <p>The following blood groups are out of stock:</p>
                      <ul>
                        {stats.criticalGroups.map(group => (
                          <li key={group}><strong>{group}</strong></li>
                        ))}
                      </ul>
                      <button className="btn btn-outline-danger btn-sm">
                        Request Emergency Supply
                      </button>
                    </div>
                  </div>
                )}
                
                {stats.lowStockGroups.length > 0 && (
                  <div className="col-md-6">
                    <div className="alert alert-warning">
                      <h5>
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Low Stock Warning
                      </h5>
                      <p>The following blood groups have low stock:</p>
                      <ul>
                        {stats.lowStockGroups.map(group => (
                          <li key={group}><strong>{group}</strong></li>
                        ))}
                      </ul>
                      <button className="btn btn-outline-warning btn-sm">
                        Schedule Donation Camp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;