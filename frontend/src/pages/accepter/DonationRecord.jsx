import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DonationRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState({
    id: id || '12345',
    donorName: 'John Doe',
    donorId: 'D12345',
    donorAge: 28,
    donorGender: 'Male',
    donorWeight: '72 kg',
    donorContact: '+92 300 1234567',
    donorEmail: 'john.doe@example.com',
    bloodGroup: 'A+',
    hemoglobin: '13.5 g/dL',
    donationDate: '2024-02-05',
    donationTime: '10:30 AM',
    units: 1,
    bloodVolume: '450 ml',
    collectionMethod: 'Whole Blood',
    collectionSite: 'Right Arm',
    testResults: {
      hiv: 'Negative',
      hepatitisB: 'Negative',
      hepatitisC: 'Negative',
      syphilis: 'Negative',
      malaria: 'Negative'
    },
    status: 'Verified',
    verifiedBy: 'Dr. Ahmed',
    verificationDate: '2024-02-05',
    remarks: 'Donor in good health. No complications.',
    storageLocation: 'Refrigerator A1-45',
    expiryDate: '2024-05-05'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/accepter/donation-records');
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">
            <i className="fas fa-file-medical-alt me-2"></i>
            Donation Record #{record.id}
          </h3>
          <div>
            <button className="btn btn-light btn-sm me-2" onClick={handleBack}>
              <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <button className="btn btn-light btn-sm" onClick={handlePrint}>
              <i className="fas fa-print me-1"></i> Print
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            {/* Donor Information */}
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Donor Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Donor Name</label>
                      <p className="fw-bold">{record.donorName}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Donor ID</label>
                      <p className="fw-bold">{record.donorId}</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Age</label>
                      <p>{record.donorAge} years</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Gender</label>
                      <p>{record.donorGender}</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Weight</label>
                      <p>{record.donorWeight}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Contact</label>
                      <p>{record.donorContact}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Email</label>
                      <p>{record.donorEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Information */}
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-tint me-2"></i>
                    Donation Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Blood Group</label>
                      <p>
                        <span className="badge bg-danger fs-6">
                          {record.bloodGroup}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Hemoglobin</label>
                      <p className="fw-bold">{record.hemoglobin}</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Status</label>
                      <p>
                        <span className="badge bg-success">
                          {record.status}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Donation Date</label>
                      <p>{record.donationDate}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Donation Time</label>
                      <p>{record.donationTime}</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Units</label>
                      <p className="fw-bold">{record.units}</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Volume</label>
                      <p>{record.bloodVolume}</p>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Method</label>
                      <p>{record.collectionMethod}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Collection Site</label>
                      <p>{record.collectionSite}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Storage Location</label>
                      <p>{record.storageLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="row">
            <div className="col-12">
              <div className="card mb-4">
                <div className="card-header bg-warning text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-flask me-2"></i>
                    Laboratory Test Results
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {Object.entries(record.testResults).map(([test, result], index) => (
                      <div className="col-md-2 mb-3 text-center" key={test}>
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="text-uppercase text-muted small mb-2">
                              {test.toUpperCase()}
                            </h6>
                            <span className={`badge ${result === 'Negative' ? 'bg-success' : 'bg-danger'} fs-6`}>
                              {result}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Remarks */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-check-circle me-2"></i>
                    Verification Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Verified By</label>
                      <p className="fw-bold">{record.verifiedBy}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Verification Date</label>
                      <p>{record.verificationDate}</p>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label text-muted">Remarks</label>
                      <div className="border rounded p-3 bg-light">
                        {record.remarks}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Storage & Expiry
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Storage Location</label>
                      <p className="fw-bold">{record.storageLocation}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Expiry Date</label>
                      <p className="fw-bold text-danger">{record.expiryDate}</p>
                    </div>
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Blood unit will expire in <strong>90 days</strong> from donation date.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-primary" onClick={handleBack}>
                  <i className="fas fa-list me-1"></i>
                  Back to Records
                </button>
                <div>
                  <button className="btn btn-success me-2">
                    <i className="fas fa-edit me-1"></i>
                    Edit Record
                  </button>
                  <button className="btn btn-primary me-2">
                    <i className="fas fa-certificate me-1"></i>
                    Generate Certificate
                  </button>
                  <button className="btn btn-warning" onClick={handlePrint}>
                    <i className="fas fa-print me-1"></i>
                    Print Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationRecord;