import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router";
import { getFollowingUsers, getFollowedHospitals } from "../api/apicalls";
import "../styles/Following.css";

export default function Following() {
  const { user, token } = useAuth();
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followedHospitals, setFollowedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchFollowing() {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const [following, hospitals] = await Promise.all([
      getFollowingUsers(user.id),
      getFollowedHospitals(token),
    ]);

    setFollowingUsers(following || []);
    setFollowedHospitals(hospitals || []);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Please log in to view your following</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="following-page">
      <div className="container">
        <div className="profile-card">
          <div className="card-header">
            <h2>Following</h2>
            <p className="subtitle">
              {followingUsers.length + followedHospitals.length} total
            </p>
          </div>

          {followingUsers.length === 0 && followedHospitals.length === 0 ? (
            <div className="empty-state">
              <h2>Not following anyone yet</h2>
              <p>Start following users and hospitals to see them here</p>
            </div>
          ) : (
            <div className="following-content">
              {followingUsers.length > 0 && (
                <div className="following-section">
                  <h3>Users ({followingUsers.length})</h3>
                  <div className="following-list">
                    {followingUsers
                      .filter((followedUser) => followedUser.id !== user.id)
                      .map((followedUser) => (
                        <Link
                          key={followedUser.id}
                          to={`/profile/${followedUser.id}`}
                          className="following-item"
                        >
                          <div className="following-avatar">
                            {followedUser.profile_picture ? (
                              <img
                                src={followedUser.profile_picture}
                                alt={followedUser.username}
                              />
                            ) : (
                              followedUser.username?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="following-info">
                            <span className="following-username">
                              {followedUser.username}
                            </span>
                            {followedUser.bio && (
                              <span className="following-bio">
                                {followedUser.bio}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {followedHospitals.length > 0 && (
                <div className="following-section">
                  <h3>Hospitals ({followedHospitals.length})</h3>
                  <div className="following-list">
                    {followedHospitals.map((hospital) => (
                      <Link
                        key={hospital.hospital_id}
                        to={`/hospital/${hospital.hospital_id}`}
                        className="following-item"
                      >
                        <div className="following-avatar hospital-avatar">
                          🏥
                        </div>
                        <div className="following-info">
                          <span className="following-username">
                            {hospital.name || hospital.hospital_id}
                          </span>
                          {hospital.city && hospital.state && (
                            <span className="following-bio">
                              {hospital.city}, {hospital.state}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
