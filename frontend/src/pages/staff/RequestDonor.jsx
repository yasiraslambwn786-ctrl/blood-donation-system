import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Footer, Navigation } from '../../components/common';
import { useNavigate } from 'react-router-dom';

const RequestDonor = () => {
  const [allDonors, setAllDonors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 8;
  const navigate = useNavigate();

  // Fetch donors
  const fetchDonors = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/donors');
      const donors = response.data?.donors || response.data || [];
      const sortedDonors = donors.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAllDonors(sortedDonors);
      localStorage.setItem('allDonors', JSON.stringify(sortedDonors));
    } catch (error) {
      const backup = JSON.parse(localStorage.getItem('allDonors')) || [];
      setAllDonors(
        backup.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    }
  };

  useEffect(() => {
    fetchDonors();
    const interval = setInterval(fetchDonors, 5000);
    return () => clearInterval(interval);
  }, []);

  // Pagination
  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = allDonors.slice(indexOfFirstDonor, indexOfLastDonor);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ✅ Fixed Handle Send Request
  const handleRequest = async (donor) => {
    try {
      const staffData = localStorage.getItem('staffData');
      const staff = staffData ? JSON.parse(staffData) : {};

      if (!staff?.id) {
        alert('Staff not logged in! Please log in again.');
        navigate('/login');
        return;
      }

      const payload = {
        staff_id: staff.id, // ✅ Ensure backend gets this
        donor_id: donor.id,
      };

      console.log('🟢 Sending payload:', payload); // Debugging line

     const token = localStorage.getItem('staffToken');

      const response = await axios.post(
        'http://127.0.0.1:8000/api/request-donors',
        payload,
        {
          headers: {
            'Content-Type': 'application/json', // ✅ important
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data?.success) {
        alert('Request sent successfully!');
      } else {
        alert(response.data?.message || 'Failed to send request.');
      }
    } catch (error) {
      console.error('❌ Error sending request:', error);
      if (error.response) {
        alert(error.response.data?.message || 'Validation/Server error!');
      } else {
        alert('Network/Server error!');
      }
    }
  };

  return (
    <div>
      <Navigation username="Mike Junior" homeColor="primary" />

      <div className="container">
        <div className="row">
          {currentDonors.map((donor) => (
            <article className="col-md-4 col-lg-3" key={donor.id}>
              <div className="card bg-light rounded-4 shadow">
                <div className="card-body">
                  <h5 className="card-title text-center text-uppercase mb-4 text-primary">
                    Donor Information
                  </h5>
                  <ul className="list-unstyled">
                    <li><strong>Name:</strong> {donor.full_name || 'N/A'}</li>
                    <li><strong>Gender:</strong> {donor.gender || 'N/A'}</li>
                    <li><strong>Location:</strong> {donor.address || 'N/A'}</li>
                    <li><strong>Blood Group:</strong> {donor.blood_type || 'N/A'}</li>
                    <li><strong>Health:</strong> {donor.status || 'Active'}</li>
                  </ul>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        localStorage.setItem('selectedDonorEmail', donor.email);
                        navigate('/request-create');
                      }}
                    >
                      More...
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!JSON.parse(localStorage.getItem('staffData') || '{}').id}
                      onClick={() => handleRequest(donor)}
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-12">
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: Math.ceil(allDonors.length / donorsPerPage) }).map(
                  (_, index) => (
                    <li
                      key={index}
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      <button className="page-link" onClick={() => paginate(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${
                    currentPage === Math.ceil(allDonors.length / donorsPerPage) ? 'disabled' : ''
                  }`}
                >
                  <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RequestDonor;
