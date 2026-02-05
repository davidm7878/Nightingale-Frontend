import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  getPostsByUserId,
  getUserProfile,
  updateUserProfile,
} from "../api/apicalls";
import "../styles/Profile.css";

export default function Profile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    resume: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  async function fetchProfileData() {
    setLoading(true);
    const [profileData, userPosts] = await Promise.all([
      getUserProfile(user.id),
      getPostsByUserId(user.id),
    ]);

    setProfile(profileData);
    setPosts(userPosts);
    if (profileData) {
      setFormData({
        bio: profileData.bio || "",
        resume: profileData.resume || "",
      });
    }
    setLoading(false);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    const updated = await updateUserProfile(formData, token);
    if (updated) {
      setProfile(updated);
      setEditing(false);
    }
  }

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="container">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {user.username[0].toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>{user.username}</h1>
              <p className="profile-email">{profile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="profile-grid">
          <div className="profile-main">
            <div className="profile-card">
              <div className="card-header">
                <h2>About</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-secondary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="edit-form">
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="resume">Resume URL</label>
                    <input
                      id="resume"
                      type="url"
                      value={formData.resume}
                      onChange={(e) =>
                        setFormData({ ...formData, resume: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  {profile?.bio ? (
                    <p className="bio">{profile.bio}</p>
                  ) : (
                    <p className="empty-text">No bio added yet</p>
                  )}
                  {profile?.resume && (
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      View Resume →
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="profile-card">
              <h2>My Posts</h2>
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't posted anything yet</p>
                </div>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
                    <div key={post.id} className="post-item">
                      <p className="post-date">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="post-body">{post.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="profile-sidebar">
            <div className="stats-card">
              <h3>Activity</h3>
              <div className="stat">
                <span className="stat-label">Posts</span>
                <span className="stat-value">{posts.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {new Date(profile?.created_at).getFullYear() || "2026"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
