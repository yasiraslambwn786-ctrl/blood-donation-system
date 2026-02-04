import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from "axios";

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, last-month, last-year
  const donationsPerPage = 8;

  // Get donor from Redux
  const donor = useSelector((state) => state.donor?.donor);
  const [donorData, setDonorData] = useState(null);

  // Get donor data from localStorage if Redux doesn't have it
  useEffect(() => {
    if (donor) {
      setDonorData(donor);
    } else {
      try {
        const storedDonor = localStorage.getItem('donorData');
        if (storedDonor) {
          setDonorData(JSON.parse(storedDonor));
        }
      } catch (err) {
        console.log('Error parsing localStorage:', err);
      }
    }
  }, [donor]);

  // Fetch donation history - ONLY for current donor
  useEffect(() => {
    const fetchDonationHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get donor ID
        let donorId;
        
        if (donorData?.id) {
          donorId = donorData.id;
        } else {
          setError('Unable to identify donor. Please login again.');
          setLoading(false);
          return;
        }

        console.log('Fetching donation history for donor ID:', donorId);
        
        // Get token for authorization
        const token = localStorage.getItem('donorToken');
        
        // API endpoint - SPECIFIC to current donor
        const endpoint = `http://127.0.0.1:8000/api/donor/${donorId}/my-donations`;
        
        const config = token ? {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        } : {};
        
        const res = await axios.get(endpoint, config);
        console.log('Donation History API response:', res.data);
        
        // Handle different response formats
        let donationData = [];
        
        if (res.data.success) {
          if (Array.isArray(res.data.data)) {
            donationData = res.data.data;
          } else if (res.data.donations && Array.isArray(res.data.donations)) {
            donationData = res.data.donations;
          } else if (res.data.data?.donations) {
            donationData = res.data.data.donations;
          }
        } else if (Array.isArray(res.data)) {
          donationData = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          donationData = res.data.data;
        }
        
        // Ensure we only have current donor's data
        // Filter by donor_id if multiple donors data comes
        donationData = donationData.filter(donation => 
          donation.donor_id === donorId || donation.donor_id === undefined
        );
        
        // Sort by date (newest first)
        donationData.sort((a, b) => new Date(b.donation_date || b.created_at) - new Date(a.donation_date || a.created_at));
        
        setDonations(donationData);
        
      } catch (err) {
        console.error("Error loading donation history:", err);
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
        } else if (err.response?.status === 404) {
          setError('No donation history found.');
          setDonations([]);
        } else if (err.message === "Network Error") {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Failed to load your donation history. Please try again.');
        }
        
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };

    if (donorData?.id) {
      fetchDonationHistory();
    } else {
      setLoading(false);
    }
  }, [donorData]);

  // Filter donations by time
  const filteredDonations = donations.filter(donation => {
    // Apply time filter
    if (filter === 'all') return true;
    
    const donationDate = new Date(donation.donation_date || donation.created_at);
    const now = new Date();
    
    if (filter === 'last-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return donationDate >= oneMonthAgo;
    }
    
    if (filter === 'last-year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return donationDate >= oneYearAgo;
    }
    
    return true;
  });

  // Pagination logic
  const indexOfLastDonation = currentPage * donationsPerPage;
  const indexOfFirstDonation = indexOfLastDonation - donationsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstDonation, indexOfLastDonation);
  const totalPages = Math.ceil(filteredDonations.length / donationsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate statistics - ONLY for current donor
  const calculateStats = () => {
    const totalDonations = donations.length;
    const totalBloodDonated = donations.reduce((sum, donation) => 
      sum + (parseFloat(donation.blood_amount) || 450), 0);
    
    // Calculate lives saved (approx 3 lives per donation)
    const livesSaved = totalDonations * 3;
    
    // Calculate donor level
    let donorLevel = 'New Donor';
    let levelColor = 'secondary';
    
    if (totalDonations >= 100) {
      donorLevel = 'Hero Donor';
      levelColor = 'dark';
    } else if (totalDonations >= 50) {
      donorLevel = 'Legendary Donor';
      levelColor = 'primary';
    } else if (totalDonations >= 25) {
      donorLevel = 'Platinum Donor';
      levelColor = 'info';
    } else if (totalDonations >= 10) {
      donorLevel = 'Gold Donor';
      levelColor = 'warning';
    } else if (totalDonations >= 5) {
      donorLevel = 'Silver Donor';
      levelColor = 'secondary';
    } else if (totalDonations >= 1) {
      donorLevel = 'Bronze Donor';
      levelColor = 'danger';
    }
    
    // Get most recent donation
    const mostRecentDonation = donations.length > 0 ? donations[0] : null;
    
    return {
      totalDonations,
      totalBloodDonated: totalBloodDonated.toFixed(0),
      livesSaved,
      donorLevel,
      levelColor,
      mostRecentDonation
    };
  };

  const stats = calculateStats();

  // Export history as PDF (for personal use only)
  const exportToPDF = () => {
    if (donations.length === 0) {
      alert('No donation history to export.');
      return;
    }
    
    // In real implementation, use a library like jsPDF
    // For now, show a confirmation
    alert(`Your personal donation report is being generated.\n\nTotal Donations: ${stats.totalDonations}\nTotal Blood Donated: ${stats.totalBloodDonated} ml\nLives Saved: ${stats.livesSaved}`);
  };

  // Calculate next eligible donation date (minimum 56 days gap)
  const getNextEligibleDate = () => {
    if (donations.length === 0) return 'You can donate anytime!';
    
    const lastDonation = new Date(donations[0].donation_date || donations[0].created_at);
    const nextDate = new Date(lastDonation);
    nextDate.setDate(nextDate.getDate() + 56); // 8 weeks gap
    
    const today = new Date();
    
    if (nextDate <= today) {
      return 'You are eligible to donate now!';
    } else {
      return `Eligible after: ${formatDate(nextDate.toISOString())}`;
    }
  };

  return (
    <div className="donation-history-page">
      {/* Page Header - Emphasize it's PERSONAL */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">My Donation History</h2>
            <p className="text-muted mb-0">
              Your personal blood donation journey and impact
            </p>
          </div>
          
          {/* Export Button - Only if there's data */}
          {donations.length > 0 && (
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={exportToPDF}
                title="Export your personal donation report"
              >
                <i className="fas fa-file-pdf me-1"></i> Export Report
              </button>
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

      {/* Donor Information Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-3 text-center">
                  <div className="rounded-circle bg-danger d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-user fa-2x text-white"></i>
                  </div>
                  <h5 className="mb-1">{donorData?.full_name || 'Donor'}</h5>
                  <div className="badge bg-danger fs-6 px-3 py-2">
                    {donorData?.blood_type || 'Blood Type'}
                  </div>
                </div>
                
                <div className="col-md-9">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="text-center p-3">
                        <div className="text-primary fw-bold fs-3">{stats.totalDonations}</div>
                        <small className="text-muted">Total Donations</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3">
                        <div className="text-success fw-bold fs-3">{stats.totalBloodDonated} ml</div>
                        <small className="text-muted">Blood Donated</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3">
                        <div className="text-info fw-bold fs-3">{stats.livesSaved}</div>
                        <small className="text-muted">Lives Saved</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className={`badge bg-${stats.levelColor} fs-6 px-3 py-2`}>
                      <i className="fas fa-trophy me-2"></i>
                      {stats.donorLevel}
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="fas fa-calendar-check me-1"></i>
                        {getNextEligibleDate()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filters - Simple */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted me-2">Filter by:</span>
                <button 
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setFilter('all'); setCurrentPage(1); }}
                >
                  All Time
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'last-year' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setFilter('last-year'); setCurrentPage(1); }}
                >
                  Last Year
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'last-month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => { setFilter('last-month'); setCurrentPage(1); }}
                >
                  Last Month
                </button>
                
                <div className="ms-auto">
                  <small className="text-muted">
                    Showing {filteredDonations.length} of your donations
                  </small>
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
          <p className="mt-3">Loading your donation history...</p>
        </div>
      ) : (
        <>
          {/* Donations List */}
          <div className="row">
            {currentDonations.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-heart text-muted" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-secondary mb-3">Start Your Donation Journey</h4>
                    <p className="text-muted mb-4">
                      You haven't made any blood donations yet. <br />
                      Your first donation will save up to 3 lives!
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/donor/appointments-donor'}
                    >
                      <i className="fas fa-calendar-plus me-2"></i> Schedule Your First Donation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              currentDonations.map((donation, index) => (
                <div key={donation.id || index} className="col-12 mb-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-primary me-2">
                          Donation #{indexOfFirstDonation + index + 1}
                        </span>
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i> Completed
                        </span>
                      </div>
                      <div className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(donation.donation_date || donation.created_at)}
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-hospital me-2"></i>Where You Donated
                          </h6>
                          <div className="ps-3">
                            <p className="mb-2">
                              <strong>Hospital:</strong><br/>
                              {donation.hospital_name || donation.hospital?.name || 'Blood Donation Camp'}
                            </p>
                            {donation.hospital_address && (
                              <p className="mb-2">
                                <strong>Location:</strong><br/>
                                <small className="text-muted">{donation.hospital_address}</small>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-tint me-2"></i>Donation Details
                          </h6>
                          <div className="ps-3">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3"
                                   style={{ width: '50px', height: '50px' }}>
                                <span className="text-white fw-bold">
                                  {donation.blood_type || donorData?.blood_type || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <div className="fw-bold">{donation.blood_amount || '450'} ml</div>
                                <small className="text-muted">Blood Donated</small>
                              </div>
                            </div>
                            
                            {donation.hemoglobin_level && (
                              <div className="mt-3">
                                <small className="text-muted">Hemoglobin Level</small>
                                <div className={`fw-bold ${donation.hemoglobin_level >= 12.5 ? 'text-success' : 'text-warning'}`}>
                                  {donation.hemoglobin_level} g/dL
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-certificate me-2"></i>Your Certificate
                          </h6>
                          <div className="ps-3">
                            <p className="text-muted small mb-3">
                              Download your donation certificate to share your achievement
                            </p>
                            <div className="d-flex gap-2">
                              <button className="btn btn-outline-success btn-sm">
                                <i className="fas fa-download me-1"></i> Download
                              </button>
                              <button className="btn btn-outline-primary btn-sm">
                                <i className="fas fa-share-alt me-1"></i> Share
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {donation.notes && (
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="alert alert-light">
                              <small>
                                <strong>Notes:</strong> {donation.notes}
                              </small>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredDonations.length > donationsPerPage && (
            <div className="row mt-4">
              <div className="col-12">
                <nav aria-label="Your donations pagination">
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

      {/* Motivational Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">
                <i className="fas fa-star me-2"></i>Your Donation Impact
              </h5>
              <div className="row text-center">
                <div className="col-md-4 mb-3">
                  <div className="p-4">
                    <div className="text-success fw-bold display-6">
                      {stats.livesSaved}
                    </div>
                    <h6>Lives Saved</h6>
                    <small className="text-muted">
                      Each donation can save up to 3 lives
                    </small>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="p-4">
                    <div className="text-primary fw-bold display-6">
                      {stats.totalDonations}
                    </div>
                    <h6>Times Donated</h6>
                    <small className="text-muted">
                      Thank you for your consistent donations
                    </small>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="p-4">
                    <div className="text-danger fw-bold display-6">
                      {stats.totalBloodDonated}
                    </div>
                    <h6>ml Blood Donated</h6>
                    <small className="text-muted">
                      Every drop makes a difference
                    </small>
                  </div>
                </div>
              </div>
              
              {/* Progress to next level */}
              <div className="mt-4">
                <h6 className="mb-3">Progress to Next Level</h6>
                <div className="progress" style={{ height: '15px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${Math.min((stats.totalDonations / 10) * 100, 100)}%` }}
                    aria-valuenow={stats.totalDonations}
                    aria-valuemin="0"
                    aria-valuemax="10"
                  ></div>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <small>{stats.donorLevel}</small>
                  <small>{10 - stats.totalDonations} more to Gold</small>
                  <small>Gold Donor (10)</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Tips */}
      {donations.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body">
                <h5 className="card-title text-primary mb-3">
                  <i className="fas fa-lightbulb me-2"></i>Donation Tips
                </h5>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-utensils text-white"></i>
                      </div>
                      <h6>Eat Well</h6>
                      <small className="text-muted">
                        Have a healthy meal before donating
                      </small>
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-tint text-white"></i>
                      </div>
                      <h6>Stay Hydrated</h6>
                      <small className="text-muted">
                        Drink plenty of water before and after
                      </small>
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-info rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-bed text-white"></i>
                      </div>
                      <h6>Rest</h6>
                      <small className="text-muted">
                        Get a good night's sleep before donating
                      </small>
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-history text-white"></i>
                      </div>
                      <h6>Wait 56 Days</h6>
                      <small className="text-muted">
                        Minimum gap between donations
                      </small>
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

export default DonationHistory;