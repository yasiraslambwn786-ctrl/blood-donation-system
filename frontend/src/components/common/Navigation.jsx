import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';  // ✅ Fixed import
import { useDispatch } from 'react-redux';
import { logoutDonor } from '../../redux/slices/donorSlice';

const Navigation = ({
  username,
  homeColor,
  sentRequestsColor,
  acceptedRequestsColor,
  aboutTeamColor,
  contactTeamColor,
  profileColor,
}) => {
  const defaultTextColor = "white";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleLogout = () => {
    dispatch(logoutDonor());
    navigate('/login-donor');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ps-3 pe-1 text-${homeColor || defaultTextColor}`}
                  aria-current="page"
                  to="/request-donor"
                >
                  <i className="fa-solid fa-house p-1"></i>Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ps-3 pe-1 text-${sentRequestsColor || defaultTextColor}`}
                  to="/sent-requests"
                >
                  <i className="fa-solid fa-list p-1"></i>Sent Requests
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ps-3 pe-1 text-${acceptedRequestsColor || defaultTextColor}`}
                  to="/accepted-requests"
                >
                  <i className="fa-solid fa-calendar-check p-1"></i> Accepted Requests
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ps-3 pe-1 text-${aboutTeamColor || defaultTextColor}`}
                  to="/about-team"
                >
                  <i className="fa-solid fa-info p-1"></i> About Us
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ps-3 pe-1 text-${contactTeamColor || defaultTextColor}`}
                  to="/contact-team"
                >
                  <i className="fa-solid fa-phone p-1"></i> Contact Us
                </Link>
              </li>
            </ul>

            <ul className="navbar-nav ml-auto">
              <Dropdown
                username={username}
                defaultTextColor={defaultTextColor}
                profileColor={profileColor}
                profileRoute={'/profile-staff'}
              />

              <li className="nav-item">
                <form className="d-flex ps-3 pe-1" role="search" onSubmit={handleSubmit}>
                  <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                  />
                  <button className="btn btn-outline-success text-white" type="submit">
                    Search
                  </button>
                </form>
              </li>

              {/* ✅ Logout Button */}
              <li className="nav-item ps-3">
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
