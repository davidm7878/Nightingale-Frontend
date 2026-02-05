import { useState } from "react";
import {
  searchHospitalsByCityState,
  searchHospitalsByName,
} from "../api/apicalls";
import "../styles/HospitalSearch.css";

export default function HospitalSearch() {
  const [searchType, setSearchType] = useState("location");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    let data = [];
    if (searchType === "location") {
      data = await searchHospitalsByCityState({ city, state });
    } else {
      data = await searchHospitalsByName(name);
    }

    setResults(data);
    setLoading(false);
  }

  function getRatingStars(rating) {
    if (!rating || rating === "Not Available") return "N/A";
    return "⭐".repeat(parseInt(rating));
  }

  return (
    <div className="hospital-search-page">
      <div className="search-hero">
        <div className="container">
          <h1>Find Healthcare Facilities</h1>
          <p className="subtitle">
            Search thousands of hospitals and medical centers nationwide
          </p>
        </div>
      </div>

      <div className="container">
        <div className="search-card">
          <div className="search-tabs">
            <button
              className={`tab ${searchType === "location" ? "active" : ""}`}
              onClick={() => setSearchType("location")}
            >
              Search by Location
            </button>
            <button
              className={`tab ${searchType === "name" ? "active" : ""}`}
              onClick={() => setSearchType("name")}
            >
              Search by Name
            </button>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            {searchType === "location" ? (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., New York"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., NY"
                    maxLength="2"
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="name">Hospital Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Memorial Hospital"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {searched && (
          <div className="results-section">
            <h2 className="results-title">
              {results.length} {results.length === 1 ? "Result" : "Results"}
            </h2>

            {loading ? (
              <div className="loading">Searching hospitals...</div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <p>No hospitals found. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="results-grid">
                {results.map((hospital) => (
                  <div key={hospital.cms_id} className="hospital-card">
                    <div className="hospital-header">
                      <h3>{hospital.name}</h3>
                      <div className="hospital-rating">
                        {getRatingStars(hospital.rating)}
                      </div>
                    </div>
                    <div className="hospital-details">
                      <p className="address">
                        📍 {hospital.street}, {hospital.city}, {hospital.state}{" "}
                        {hospital.zip_code}
                      </p>
                      {hospital.phone && (
                        <p className="phone">📞 {hospital.phone}</p>
                      )}
                      <div className="hospital-meta">
                        {hospital.hospital_type && (
                          <span className="badge">
                            {hospital.hospital_type}
                          </span>
                        )}
                        {hospital.ownership && (
                          <span className="badge badge-secondary">
                            {hospital.ownership}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
