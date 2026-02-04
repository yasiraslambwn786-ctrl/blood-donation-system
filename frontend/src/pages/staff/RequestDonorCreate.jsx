import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RequestDonorCreate = () => {
  const [formData, setFormData] = useState({
    donor_id: "",
    message: "",
    blood_group: "",
    units: "",
  });

  const [donors, setDonors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🧠 Get staff info from localStorage
  const staff_id = localStorage.getItem("staff_id");
  const staff_email = localStorage.getItem("staff_email");
  const token = localStorage.getItem("staff_token");

  useEffect(() => {
    // If not logged in → redirect to login
    if (!staff_id || !staff_email) {
      navigate("/login-staff");
      return;
    }

    // Fetch all donors from backend
    const fetchDonors = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/donors");
        setDonors(response.data.donors || []);
      } catch (err) {
        console.error("Error fetching donors:", err);
        setError("Failed to load donor list.");
      }
    };

    fetchDonors();
  }, [navigate, staff_id, staff_email]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit → Send donor request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.donor_id) {
      setError("Please select a donor.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/donor/${formData.donor_id}/request`,
        {
          staff_id,
          staff_email,
          message: formData.message,
          blood_group: formData.blood_group,
          units: formData.units,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Request sent successfully ✅");
        navigate("/sent-requests"); // 👉 Go to SentRequests page
      } else {
        setError(response.data.message || "Request failed.");
      }
    } catch (err) {
      console.error("Error sending request:", err);
      setError("Server error while sending request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Send Blood Request</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow rounded-4">
        {/* Donor Dropdown */}
        <div className="mb-3">
          <label className="form-label">Select Donor</label>
          <select
            className="form-select"
            name="donor_id"
            value={formData.donor_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Donor --</option>
            {donors.map((donor) => (
              <option key={donor.id} value={donor.id}>
                {donor.name} ({donor.blood_group})
              </option>
            ))}
          </select>
        </div>

        {/* Blood Group */}
        <div className="mb-3">
          <label className="form-label">Blood Group</label>
          <input
            type="text"
            name="blood_group"
            className="form-control"
            placeholder="e.g. O+, A-, B+"
            value={formData.blood_group}
            onChange={handleChange}
            required
          />
        </div>

        {/* Units */}
        <div className="mb-3">
          <label className="form-label">Required Units</label>
          <input
            type="number"
            name="units"
            className="form-control"
            placeholder="Number of units"
            value={formData.units}
            onChange={handleChange}
            required
          />
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="form-label">Message (optional)</label>
          <textarea
            name="message"
            className="form-control"
            placeholder="Type a message..."
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestDonorCreate;
