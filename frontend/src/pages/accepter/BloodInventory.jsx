// src/pages/accepter/BloodInventory.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from '../../api/axiosInstance';

const BloodInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/blood-inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setInventory(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch blood inventory:', err);
      setError('Failed to load inventory data');
      // Mock data for testing
      setInventory([
        { id: 1, blood_group: 'A+', units: 45, status: 'Available', expiry_date: '2024-12-30' },
        { id: 2, blood_group: 'A-', units: 8, status: 'Low', expiry_date: '2024-12-25' },
        { id: 3, blood_group: 'B+', units: 67, status: 'Available', expiry_date: '2024-12-28' },
        { id: 4, blood_group: 'B-', units: 0, status: 'Urgent', expiry_date: '2024-12-20' },
        { id: 5, blood_group: 'O+', units: 89, status: 'Available', expiry_date: '2024-12-31' },
        { id: 6, blood_group: 'O-', units: 23, status: 'Available', expiry_date: '2024-12-29' },
        { id: 7, blood_group: 'AB+', units: 12, status: 'Low', expiry_date: '2024-12-24' },
        { id: 8, blood_group: 'AB-', units: 0, status: 'Urgent', expiry_date: '2024-12-22' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return <Badge bg="success">Available</Badge>;
      case 'low': return <Badge bg="warning">Low</Badge>;
      case 'urgent': return <Badge bg="danger">Urgent</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="blood-inventory-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-vial me-2"></i> Blood Inventory</h2>
        <Button variant="primary" onClick={fetchInventory} disabled={loading}>
          <i className="fas fa-sync-alt me-2"></i>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Alert variant="warning" className="mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Blood Stock Details</h5>
            <span className="badge bg-light text-dark">
              Total Units: {inventory.reduce((sum, item) => sum + (item.units || 0), 0)}
            </span>
          </div>
        </Card.Header>
        
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading inventory data...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No inventory data found</h5>
              <p className="text-muted">Try refreshing or contact administrator</p>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Blood Group</th>
                  <th>Units Available</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong className="text-danger">{item.blood_group}</strong>
                    </td>
                    <td>
                      <span className={item.units === 0 ? 'text-danger fw-bold' : ''}>
                        {item.units || 0} units
                      </span>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{formatDate(item.expiry_date)}</td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2">
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button size="sm" variant="outline-success">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        
        <Card.Footer className="bg-light">
          <div className="row">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <Badge bg="success" className="p-2"></Badge>
                </div>
                <small>Available (Sufficient Stock)</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <Badge bg="warning" className="p-2"></Badge>
                </div>
                <small>Low (Below Threshold)</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <Badge bg="danger" className="p-2"></Badge>
                </div>
                <small>Urgent (Critical Level)</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <Badge bg="secondary" className="p-2"></Badge>
                </div>
                <small>Other Status</small>
              </div>
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Quick Stats */}
      <div className="row mt-4">
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">
                {inventory.filter(item => item.status?.toLowerCase() === 'available').length}
              </h3>
              <Card.Text>Available Groups</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">
                {inventory.filter(item => item.status?.toLowerCase() === 'low').length}
              </h3>
              <Card.Text>Low Stock Groups</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">
                {inventory.filter(item => item.status?.toLowerCase() === 'urgent').length}
              </h3>
              <Card.Text>Urgent Groups</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">
                {inventory.reduce((sum, item) => sum + (item.units || 0), 0)}
              </h3>
              <Card.Text>Total Units</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BloodInventory; // ✅ This is important!