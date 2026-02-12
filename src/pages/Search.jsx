import { useState } from "react";
import { Link } from "react-router";
import {
  searchHospitalsByCityState,
  searchHospitalsByName,
  searchHospitalsByZipcode,
} from "../api/apicalls";
import "../styles/HospitalSearch.css";

export default function HospitalSearch() {
  const [searchType, setSearchType] = useState("location");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  async function getLocationFromCoordinates(latitude, longitude) {
    try {
      // Use OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      );
      const data = await response.json();

      console.log("Nominatim full response:", data);
      console.log("Address object:", data.address);

      if (data.address) {
        // Try multiple possible city fields (excluding county as it's too broad)
        const locationCity =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          data.address.hamlet ||
          data.address.suburb ||
          "";
        const locationState = data.address.state || "";
        const locationZipcode = data.address.postcode || "";

        console.log("Extracted city:", locationCity);
        console.log("Extracted state:", locationState);
        console.log("Extracted zipcode:", locationZipcode);

        // Extract state abbreviation if full name is given
        const stateAbbrev = getStateAbbreviation(locationState);

        console.log("State abbreviation:", stateAbbrev);

        return {
          city: locationCity,
          state: stateAbbrev,
          zipcode: locationZipcode,
        };
      }
      console.log("No address found in response");
      return null;
    } catch (error) {
      console.error("Error getting location details:", error);
      return null;
    }
  }

  function getStateAbbreviation(stateName) {
    const states = {
      Alabama: "AL",
      Alaska: "AK",
      Arizona: "AZ",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      Delaware: "DE",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
    };
    return states[stateName] || stateName;
  }

  async function handleUseMyLocation() {
    console.log("handleUseMyLocation called");

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Got position:", position);
        const { latitude, longitude } = position.coords;
        console.log("Coordinates:", latitude, longitude);

        const location = await getLocationFromCoordinates(latitude, longitude);
        console.log("Reverse geocoded location:", location);

        if (location) {
          setCity(location.city);
          setState(location.state);
          setZipcode(location.zipcode);
          setLocationLoading(false);

          // Alert user if no zipcode was found
          if (!location.zipcode && location.state) {
            alert(
              `We found your state (${location.state}) but couldn't determine your exact location. Please enter your zip code manually for better results.`,
            );
          }
        } else {
          alert("Could not determine your location. Please enter manually.");
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        let errorMessage = "Could not access your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Permission denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Request timed out.";
            break;
          default:
            errorMessage += "Please check your browser permissions.";
        }

        alert(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  async function handleSearch(e) {
    e.preventDefault();

    // Make sure that at least one search field is filled
    if (searchType === "location" && !city && !state && !zipcode) {
      alert("Please enter a zip code, city, and/or state to search");
      return;
    }

    if (searchType === "name" && !name.trim()) {
      alert("Please enter a hospital name to search");
      return;
    }

    setLoading(true);
    setSearched(true);

    let data = [];
    if (searchType === "location") {
      // Prioritize zipcode if provided and it's a valid 5-digit code
      if (zipcode && zipcode.trim().length === 5) {
        console.log("Searching by zipcode:", zipcode, "state:", state);
        data = await searchHospitalsByZipcode(zipcode.trim(), state);
      } else if (city || state) {
        console.log("Searching by city/state:", { city, state });
        data = await searchHospitalsByCityState({ city, state });
      } else {
        alert("Please enter a valid 5-digit zip code or city/state");
        setLoading(false);
        return;
      }
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
      <div className="container">
        <div className="search-card">
          <div className="search-hero">
            <div className="container">
              <h1>Find Healthcare Facilities</h1>
              <p className="subtitle">
                Search thousands of hospitals and medical centers nationwide
              </p>
            </div>
          </div>
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
              <>
                <div className="location-actions">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="btn btn-secondary"
                    disabled={locationLoading}
                  >
                    {locationLoading
                      ? "Getting location..."
                      : "📍 Use My Location"}
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipcode">Zip Code</label>
                    <input
                      id="zipcode"
                      type="text"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      placeholder="e.g., 10001"
                      maxLength="5"
                    />
                  </div>
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
              </>
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
                  <Link
                    key={hospital.cms_id}
                    to={`/hospital/${hospital.cms_id}`}
                    className="hospital-card-link"
                  >
                    <div className="hospital-card">
                      <div className="hospital-header">
                        <h3>{hospital.name}</h3>
                        <div className="hospital-rating">
                          {getRatingStars(hospital.rating)}
                        </div>
                      </div>
                      <div className="hospital-details">
                        <p className="address">
                          📍 {hospital.street}, {hospital.city},{" "}
                          {hospital.state} {hospital.zip_code}
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
