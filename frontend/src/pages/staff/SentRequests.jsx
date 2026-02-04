import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Footer, Navigation } from '../../components/common';

const SentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 8;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const staff = JSON.parse(localStorage.getItem('staffData') || '{}');
        if (!staff?.id) return;

        const response = await axios.get(
          `http://127.0.0.1:8000/api/requests/${staff.id}`
        );

        if (response.data?.success) {
          setRequests(response.data.requests);
        }
      } catch (error) {
        console.error('Error fetching sent requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const indexOfLast = currentPage * donorsPerPage;
  const indexOfFirst = indexOfLast - donorsPerPage;
  const currentRequests = requests.slice(indexOfFirst, indexOfLast);

  const paginate = (num) => setCurrentPage(num);

  const handleCancel = async (requestId) => {
    alert(`Cancel request ${requestId} clicked`);
  };

  return (
    <div>
      <Navigation username={'Mike Junior'} sentRequestsColor={'primary'} />
      <div id="carouselExample" className="carousel">
        <div className="carousel-inner"></div>
      </div>

      <div className="container">
        <div className="row">
          {currentRequests.map((req) => (
            <article className="col-md-4 col-lg-3" key={req.id}>
              <div className="card bg-light rounded-4 shadow">
                <div className="card-body">
                  <h5 className="card-title text-center text-uppercase mb-4 text-primary">
                    Donor Request
                  </h5>
                  <ul className="list-unstyled">
                    <li><strong>Name:</strong> {req.donor?.full_name}</li>
                    <li><strong>Gender:</strong> {req.donor?.gender}</li>
                    <li><strong>Blood Group:</strong> {req.donor?.blood_type}</li>
                    <li><strong>Phone:</strong> {req.donor?.phone_number}</li>
                    <li><strong>Status:</strong> {req.status}</li>
                  </ul>
                  <div className="d-grid mt-4">
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={() => handleCancel(req.id)}
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="container">
        <nav aria-label="Page navigation example">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <a className="page-link" href="#" onClick={() => paginate(currentPage - 1)}>Previous</a>
            </li>
            {Array.from({ length: Math.ceil(requests.length / donorsPerPage) }).map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <a className="page-link" href="#" onClick={() => paginate(i + 1)}>{i + 1}</a>
              </li>
            ))}
            <li className={`page-item ${currentPage === Math.ceil(requests.length / donorsPerPage) ? 'disabled' : ''}`}>
              <a className="page-link" href="#" onClick={() => paginate(currentPage + 1)}>Next</a>
            </li>
          </ul>
        </nav>
      </div>

      <Footer />
    </div>
  );
};

export default SentRequests;
