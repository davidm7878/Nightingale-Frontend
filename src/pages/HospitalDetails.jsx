import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import "../styles/HospitalDetails.css";

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  async function fetchHospitalDetails() {
    try {
      setLoading(true);
      const API = import.meta.env.VITE_API || "http://localhost:3000";
      const response = await fetch(`${API}/hospitals/search?facilityId=${id}`);

      if (!response.ok) throw new Error("Failed to fetch hospital");

      const data = await response.json();
      setHospital(data[0] || null);
    } catch (error) {
      console.error("Error fetching hospital details:", error);
    } finally {
      setLoading(false);
    }
  }

  function getRatingStars(rating) {
    if (!rating || rating === "Not Available") return "N/A";
    return "⭐".repeat(parseInt(rating));
  }

  if (loading) {
    return (
      <div className="hospital-details-page">
        <div className="container">
          <div className="loading">Loading hospital details...</div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="hospital-details-page">
        <div className="container">
          <div className="empty-state">
            <h2>Hospital not found</h2>
            <button
              onClick={() => navigate("/search")}
              className="btn btn-primary"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-details-page">
      <div className="container">
        <button onClick={() => navigate("/search")} className="back-button">
          ← Back to Search
        </button>

        <div className="details-card">
          <div className="details-header">
            <div>
              <h1>{hospital.name}</h1>
              <p className="facility-id">Facility ID: {hospital.cms_id}</p>
            </div>
            <div className="rating-large">
              {getRatingStars(hospital.rating)}
            </div>
          </div>

          <div className="details-grid">
            <div className="details-section">
              <h2>Contact Information</h2>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">
                  {hospital.street}
                  <br />
                  {hospital.city}, {hospital.state} {hospital.zip_code}
                </span>
              </div>
              {hospital.phone && (
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{hospital.phone}</span>
                </div>
              )}
            </div>

            <div className="details-section">
              <h2>Hospital Information</h2>
              {hospital.hospital_type && (
                <div className="info-item">
                  <span className="label">Type:</span>
                  <span className="value">{hospital.hospital_type}</span>
                </div>
              )}
              {hospital.ownership && (
                <div className="info-item">
                  <span className="label">Ownership:</span>
                  <span className="value">{hospital.ownership}</span>
                </div>
              )}
              {hospital.rating && (
                <div className="info-item">
                  <span className="label">Overall Rating:</span>
                  <span className="value">{hospital.rating} / 5</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
