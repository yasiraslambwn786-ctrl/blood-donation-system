import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const FindDonors = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const donorsPerPage = 9;

  // Filters
  const [bloodType, setBloodType] = useState('');
  const [city, setCity] = useState('');
  const [availability, setAvailability] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const donor = useSelector((state) => state.donor?.donor);

  // Blood types
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Cities (you can update this based on your project)
  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Bahawalpur', 'Sukkur', 'Hyderabad'
  ];

  // Fetch all donors
  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('donorToken');
        
        // API endpoint - adjust according to your backend
        const endpoint = `http://127.0.0.1:8000/api/donors`;
        
        const config = token ? {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        } : {};
        
        const res = await axios.get(endpoint, config);
        console.log('Donors API response:', res.data);
        
        // Handle different response formats
        let donorsData = [];
        
        if (res.data.success) {
          if (Array.isArray(res.data.data)) {
            donorsData = res.data.data;
          } else if (res.data.donors && Array.isArray(res.data.donors)) {
            donorsData = res.data.donors;
          } else if (res.data.data?.donors) {
            donorsData = res.data.data.donors;
          }
        } else if (Array.isArray(res.data)) {
          donorsData = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          donorsData = res.data.data;
        }
        
        // Filter out current user from donors list
        const currentUserId = donor?.id || JSON.parse(localStorage.getItem('donorData'))?.id;
        if (currentUserId) {
          donorsData = donorsData.filter(d => d.id !== currentUserId);
        }
        
        // Add mock availability for demo (in real app, this should come from API)
        donorsData = donorsData.map(donor => ({
          ...donor,
          availability: donor.availability || (Math.random() > 0.5 ? 'Available' : 'Not Available'),
          last_donation: donor.last_donation || new Date(Date.now() - Math.random() * 31536000000).toISOString(),
          distance: Math.floor(Math.random() * 50) + 1 // Mock distance in km
        }));
        
        setDonors(donorsData);
        setFilteredDonors(donorsData);
        
      } catch (err) {
        console.error("Error loading donors:", err);
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
        } else if (err.message === "Network Error") {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Failed to load donors. Please try again.');
          // For demo purposes, load mock data
          loadMockData();
        }
        
      } finally {
        setLoading(false);
      }
    };

    // Load mock data for demo
    const loadMockData = () => {
      const mockDonors = [
        {
          id: 1,
          full_name: 'Ahmed Khan',
          blood_type: 'A+',
          city: 'Karachi',
          phone: '0300-1234567',
          availability: 'Available',
          last_donation: '2024-01-15',
          distance: 5
        },
        {
          id: 2,
          full_name: 'Sara Ali',
          blood_type: 'B-',
          city: 'Lahore',
          phone: '0312-9876543',
          availability: 'Available',
          last_donation: '2024-02-10',
          distance: 12
        },
        {
          id: 3,
          full_name: 'Usman Malik',
          blood_type: 'O+',
          city: 'Islamabad',
          phone: '0333-4567890',
          availability: 'Not Available',
          last_donation: '2024-01-20',
          distance: 25
        },
        {
          id: 4,
          full_name: 'Fatima Raza',
          blood_type: 'AB+',
          city: 'Rawalpindi',
          phone: '0345-6789012',
          availability: 'Available',
          last_donation: '2024-02-05',
          distance: 8
        },
        {
          id: 5,
          full_name: 'Bilal Ahmed',
          blood_type: 'A-',
          city: 'Faisalabad',
          phone: '0301-2345678',
          availability: 'Available',
          last_donation: '2024-01-30',
          distance: 18
        },
        {
          id: 6,
          full_name: 'Zainab Kareem',
          blood_type: 'B+',
          city: 'Multan',
          phone: '0321-3456789',
          availability: 'Not Available',
          last_donation: '2024-02-01',
          distance: 30
        },
        {
          id: 7,
          full_name: 'Omar Farooq',
          blood_type: 'O-',
          city: 'Karachi',
          phone: '0334-5678901',
          availability: 'Available',
          last_donation: '2024-01-25',
          distance: 3
        },
        {
          id: 8,
          full_name: 'Hina Shah',
          blood_type: 'AB-',
          city: 'Lahore',
          phone: '0305-6789012',
          availability: 'Available',
          last_donation: '2024-02-12',
          distance: 15
        },
        {
          id: 9,
          full_name: 'Kamran Ali',
          blood_type: 'A+',
          city: 'Islamabad',
          phone: '0314-7890123',
          availability: 'Available',
          last_donation: '2024-01-28',
          distance: 22
        }
      ];
      
      setDonors(mockDonors);
      setFilteredDonors(mockDonors);
    };

    fetchDonors();
  }, [donor]);

  // Apply filters
  useEffect(() => {
    let result = donors;
    
    // Apply blood type filter
    if (bloodType) {
      result = result.filter(donor => donor.blood_type === bloodType);
    }
    
    // Apply city filter
    if (city) {
      result = result.filter(donor => donor.city === city);
    }
    
    // Apply availability filter
    if (availability) {
      if (availability === 'available') {
        result = result.filter(donor => donor.availability === 'Available');
      } else if (availability === 'not-available') {
        result = result.filter(donor => donor.availability === 'Not Available');
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(donor => 
        donor.full_name.toLowerCase().includes(searchLower) ||
        donor.blood_type.toLowerCase().includes(searchLower) ||
        donor.city.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredDonors(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [bloodType, city, availability, searchTerm, donors]);

  // Pagination logic
  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = filteredDonors.slice(indexOfFirstDonor, indexOfLastDonor);
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate days since last donation
  const daysSinceLastDonation = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const lastDonation = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - lastDonation);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 'N/A';
    }
  };

  // Handle donor selection
  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor);
    setShowDonorModal(true);
  };

  // Handle request for donor
  const handleRequestDonor = (donor) => {
    if (!window.confirm(`Send blood request to ${donor.full_name}?`)) {
      return;
    }
    
    // In real app, make API call to send request
    alert(`Request sent to ${donor.full_name}. They will contact you soon.`);
    setShowDonorModal(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setBloodType('');
    setCity('');
    setAvailability('');
    setSearchTerm('');
  };

  // Get blood type color
  const getBloodTypeColor = (type) => {
    switch(type) {
      case 'A+': return 'danger';
      case 'A-': return 'warning';
      case 'B+': return 'success';
      case 'B-': return 'info';
      case 'AB+': return 'primary';
      case 'AB-': return 'secondary';
      case 'O+': return 'dark';
      case 'O-': return 'danger';
      default: return 'secondary';
    }
  };

  // Get availability badge
  const getAvailabilityBadge = (status) => {
    return status === 'Available' ? 'success' : 'danger';
  };

  return (
    <div className="find-donors-page">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Find Donors</h2>
            <p className="text-muted mb-0">
              Search for blood donors in your area
            </p>
          </div>
          
          {/* Quick Stats */}
          {!loading && (
            <div className="badge bg-primary fs-6 px-3 py-2">
              <i className="fas fa-users me-2"></i>
              {filteredDonors.length} Donor{filteredDonors.length !== 1 ? 's' : ''} Found
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Quick Stats Bar */}
      {!loading && donors.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="row g-3">
                  <div className="col-md-3 col-6">
                    <div className="text-center">
                      <div className="text-primary fw-bold fs-4">{donors.length}</div>
                      <small className="text-muted">Total Donors</small>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="text-center">
                      <div className="text-success fw-bold fs-4">
                        {donors.filter(d => d.availability === 'Available').length}
                      </div>
                      <small className="text-muted">Available Now</small>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="text-center">
                      <div className="text-info fw-bold fs-4">
                        {bloodTypes.length}
                      </div>
                      <small className="text-muted">Blood Types</small>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="text-center">
                      <div className="text-warning fw-bold fs-4">
                        {cities.length}
                      </div>
                      <small className="text-muted">Cities</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2 text-primary"></i>
            Filter Donors
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Blood Type Filter */}
            <div className="col-md-3">
              <label className="form-label">Blood Type</label>
              <select 
                className="form-select"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              >
                <option value="">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="col-md-3">
              <label className="form-label">City</label>
              <select 
                className="form-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="col-md-3">
              <label className="form-label">Availability</label>
              <select 
                className="form-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="available">Available Now</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>

            {/* Search Filter */}
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Actions */}
            <div className="col-12">
              <div className="d-flex justify-content-between">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times me-1"></i> Clear Filters
                </button>
                <div className="text-muted small">
                  Showing {filteredDonors.length} of {donors.length} donors
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Finding donors in your area...</p>
        </div>
      ) : (
        <>
          {/* Donors Grid */}
          <div className="row">
            {currentDonors.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-user-slash text-muted" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-secondary mb-3">No Donors Found</h4>
                    <p className="text-muted mb-4">
                      No donors match your current filters. <br />
                      Try adjusting your search criteria or clear filters to see all donors.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={clearFilters}
                    >
                      <i className="fas fa-redo me-2"></i> Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              currentDonors.map((donor) => (
                <div key={donor.id} className="col-md-4 mb-4">
                  <div className="card border-0 shadow-sm h-100 hover-shadow">
                    {/* Blood Type Badge */}
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className={`badge bg-${getBloodTypeColor(donor.blood_type)} fs-6 px-3 py-2`}>
                        {donor.blood_type}
                      </span>
                    </div>
                    
                    {/* Donor Avatar */}
                    <div className="text-center pt-4">
                      <div className="rounded-circle bg-danger d-inline-flex align-items-center justify-content-center mb-3"
                           style={{ width: '80px', height: '80px' }}>
                        <i className="fas fa-user fa-2x text-white"></i>
                      </div>
                      <h5 className="mb-1">{donor.full_name}</h5>
                      <div className="mb-3">
                        <span className={`badge bg-${getAvailabilityBadge(donor.availability)}`}>
                          <i className="fas fa-circle me-1" style={{ fontSize: '0.6rem' }}></i>
                          {donor.availability}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body pt-0">
                      {/* Donor Details */}
                      <div className="mb-3">
                        <div className="row g-2">
                          <div className="col-6">
                            <div className="bg-light rounded p-2 text-center">
                              <div className="text-primary fw-bold">{donor.distance} km</div>
                              <small className="text-muted">Distance</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-light rounded p-2 text-center">
                              <div className="text-success fw-bold">
                                {daysSinceLastDonation(donor.last_donation)}
                              </div>
                              <small className="text-muted">Days Since Last Donation</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <ul className="list-unstyled mb-3">
                        <li className="mb-2">
                          <i className="fas fa-map-marker-alt text-primary me-2"></i>
                          <strong>Location:</strong> {donor.city || 'N/A'}
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-phone text-success me-2"></i>
                          <strong>Phone:</strong> {donor.phone || 'N/A'}
                        </li>
                        <li>
                          <i className="fas fa-calendar-alt text-info me-2"></i>
                          <strong>Last Donation:</strong> {formatDate(donor.last_donation)}
                        </li>
                      </ul>
                      
                      {/* Action Buttons */}
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleDonorSelect(donor)}
                        >
                          <i className="fas fa-eye me-2"></i> View Details
                        </button>
                        {donor.availability === 'Available' && (
                          <button 
                            className="btn btn-success"
                            onClick={() => handleRequestDonor(donor)}
                          >
                            <i className="fas fa-handshake me-2"></i> Request Blood
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredDonors.length > donorsPerPage && (
            <div className="row mt-4">
              <div className="col-12">
                <nav aria-label="Donors pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left me-1"></i> Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li 
                        key={i} 
                        className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      {/* Emergency Section */}
      <div className="row mt-5">
        <div className="col-md-8">
          <div className="card border-0 bg-gradient-danger text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="mb-3">
                    <i className="fas fa-ambulance me-2"></i>
                    Need Blood Urgently?
                  </h4>
                  <p className="mb-4">
                    If you need blood urgently, post an emergency request. 
                    Our system will notify all available donors in your area immediately.
                  </p>
                  <button 
                    className="btn btn-light"
                    onClick={() => navigate('/emergency-request')}
                  >
                    <i className="fas fa-plus me-2"></i> Post Emergency Request
                  </button>
                </div>
                <div className="col-md-4 text-center">
                  <i className="fas fa-first-aid" style={{ fontSize: '5rem', opacity: '0.8' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 bg-gradient-primary text-white h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-share-alt" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Share with Friends</h5>
              <p className="mb-4 small">
                Help others find donors by sharing this page
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button className="btn btn-sm btn-light">
                  <i className="fab fa-facebook"></i>
                </button>
                <button className="btn btn-sm btn-light">
                  <i className="fab fa-twitter"></i>
                </button>
                <button className="btn btn-sm btn-light">
                  <i className="fab fa-whatsapp"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donor Details Modal */}
      {showDonorModal && selectedDonor && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Donor Details</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDonorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <div className="rounded-circle bg-danger d-inline-flex align-items-center justify-content-center mb-3"
                         style={{ width: '100px', height: '100px' }}>
                      <i className="fas fa-user fa-3x text-white"></i>
                    </div>
                    <h4>{selectedDonor.full_name}</h4>
                    <div className="mb-3">
                      <span className={`badge bg-${getBloodTypeColor(selectedDonor.blood_type)} fs-5 px-4 py-2`}>
                        {selectedDonor.blood_type}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className={`badge bg-${getAvailabilityBadge(selectedDonor.availability)}`}>
                        <i className="fas fa-circle me-1"></i>
                        {selectedDonor.availability}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-md-8">
                    <h6 className="text-primary mb-3">Contact Information</h6>
                    <div className="row mb-3">
                      <div className="col-6">
                        <p><strong>Phone:</strong></p>
                        <p className="fs-5">{selectedDonor.phone || 'N/A'}</p>
                      </div>
                      <div className="col-6">
                        <p><strong>City:</strong></p>
                        <p className="fs-5">{selectedDonor.city || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <h6 className="text-primary mb-3">Donation History</h6>
                    <div className="row mb-4">
                      <div className="col-6">
                        <div className="card border">
                          <div className="card-body text-center">
                            <div className="text-primary fw-bold fs-4">
                              {daysSinceLastDonation(selectedDonor.last_donation)}
                            </div>
                            <small className="text-muted">Days Since Last Donation</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card border">
                          <div className="card-body text-center">
                            <div className="text-success fw-bold fs-4">
                              {selectedDonor.distance} km
                            </div>
                            <small className="text-muted">Distance from You</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h6 className="text-primary mb-3">Last Donation</h6>
                    <p className="mb-4">{formatDate(selectedDonor.last_donation)}</p>
                    
                    {selectedDonor.availability === 'Available' && (
                      <div className="alert alert-success">
                        <i className="fas fa-check-circle me-2"></i>
                        This donor is currently available for blood donation
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDonorModal(false)}
                >
                  Close
                </button>
                {selectedDonor.availability === 'Available' && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => handleRequestDonor(selectedDonor)}
                  >
                    <i className="fas fa-handshake me-2"></i> Request Blood
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      {!loading && donors.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title text-primary mb-4">
                  <i className="fas fa-info-circle me-2"></i>Important Information
                </h5>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="d-flex">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                           style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        <i className="fas fa-shield-alt text-white"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Privacy Protected</h6>
                        <small className="text-muted">
                          Donor contact information is only shared with verified users
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <div className="d-flex">
                      <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3"
                           style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        <i className="fas fa-clock text-white"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Real-time Availability</h6>
                        <small className="text-muted">
                          Availability status is updated in real-time by donors
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <div className="d-flex">
                      <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                           style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        <i className="fas fa-comments text-white"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Contact Respectfully</h6>
                        <small className="text-muted">
                          Please be respectful when contacting donors
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDonors;