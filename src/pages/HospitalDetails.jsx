import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import {
  getRatingsByHospitalId,
  createRating,
  getReviewsByHospitalId,
  createReview,
  deleteReview,
  followHospital,
  unfollowHospital,
  isFollowingHospital,
} from "../api/apicalls";
import "../styles/HospitalDetails.css";

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({ ratings: [], average: 0, total: 0 });
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchHospitalDetails();
    fetchRatingsAndReviews();
    checkFollowStatus();
  }, [id, token]);

  async function fetchHospitalDetails() {
    try {
      setLoading(true);
      const API = import.meta.env.VITE_API || "http://localhost:3000";

      // Try CMS API first
      let response = await fetch(`${API}/hospitals/search?facilityId=${id}`);
      if (!response.ok) throw new Error("Failed to fetch hospital");

      let data = await response.json();

      // If CMS API returns empty, try local database
      if (!data || data.length === 0) {
        response = await fetch(`${API}/hospitals/${id}`);
        if (response.ok) {
          const localHospital = await response.json();
          if (localHospital) {
            data = [localHospital];
          }
        }
      }

      setHospital(data[0] || null);
    } catch (error) {
      console.error("Error fetching hospital details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRatingsAndReviews() {
    const [ratingsData, reviewsData] = await Promise.all([
      getRatingsByHospitalId(id),
      getReviewsByHospitalId(id),
    ]);
    setRatings(ratingsData);
    setReviews(reviewsData);
  }

  async function handleRatingSubmit() {
    if (!token || !userRating) return;

    setSubmitting(true);
    const result = await createRating(id, userRating, token);
    if (result) {
      await fetchRatingsAndReviews();
      setUserRating(0);
    } else {
      alert(
        "Failed to submit rating. You may have already rated this hospital.",
      );
    }
    setSubmitting(false);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!token || !reviewText.trim()) return;

    setSubmitting(true);
    const result = await createReview(id, reviewText, token);
    if (result) {
      setReviews([result, ...reviews]);
      setReviewText("");
      alert("Review submitted successfully!");
    } else {
      alert("Failed to submit review.");
    }
    setSubmitting(false);
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const result = await deleteReview(reviewId, token);
    if (result) {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    }
  }

  async function checkFollowStatus() {
    if (token && id) {
      const following = await isFollowingHospital(id, token);
      setIsFollowing(following);
    }
  }

  async function handleFollowToggle() {
    if (!token) return;

    if (isFollowing) {
      const result = await unfollowHospital(id, token);
      if (result) {
        setIsFollowing(false);
      }
    } else {
      const result = await followHospital(id, token);
      if (result) {
        setIsFollowing(true);
      }
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
            {token && (
              <button
                onClick={handleFollowToggle}
                className={`btn ${isFollowing ? "btn-secondary" : "btn-primary"}`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
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
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="details-card">
          <h2>Ratings & Reviews</h2>

          {ratings.total > 0 && (
            <div className="ratings-summary">
              <div className="average-rating">{ratings.average.toFixed(1)}</div>
              <div className="ratings-info">
                <div className="stars-display">
                  {getRatingStars(Math.round(ratings.average))}
                </div>
                <div className="rating-count">
                  Based on {ratings.total}{" "}
                  {ratings.total === 1 ? "rating" : "ratings"}
                </div>
              </div>
            </div>
          )}

          {token ? (
            <div className="rating-input-section">
              <h3>Rate this Hospital</h3>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star ${star <= (hoverRating || userRating) ? "filled" : ""} ${star <= hoverRating ? "hover" : ""}`}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={submitting}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <button
                  onClick={handleRatingSubmit}
                  className="submit-rating-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
              )}
            </div>
          ) : (
            <p className="login-prompt">Please log in to rate this hospital</p>
          )}

          <div className="reviews-divider"></div>

          {token ? (
            <div className="review-form-section">
              <h3>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <textarea
                  className="review-textarea"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this hospital..."
                  rows="4"
                  disabled={submitting}
                  required
                />
                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={submitting || !reviewText.trim()}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          ) : (
            <p className="login-prompt">Please log in to write a review</p>
          )}

          <div className="reviews-list">
            <h3>Community Reviews</h3>
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-user-info">
                      {review.user_profile_picture ? (
                        <img
                          src={review.user_profile_picture}
                          alt={review.username}
                          className="review-avatar"
                        />
                      ) : (
                        <div className="review-avatar">
                          {review.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <div className="review-user-name">
                          {review.username}
                        </div>
                        <div className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {user && user.id === review.user_id && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="delete-review-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="review-body">{review.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
