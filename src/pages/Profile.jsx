import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useParams } from "react-router";
import {
  getPostsByUserId,
  getUserProfile,
  updateUserProfile,
} from "../api/apicalls";
import { dummyUsers, dummyPosts } from "../data/dummyData";
import "../styles/Profile.css";

export default function Profile() {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    resume: "",
  });

  const isOwnProfile = !userId || (user && userId === String(user.id));

  useEffect(() => {
    fetchProfileData();
  }, [userId, user]);

  async function fetchProfileData() {
    setLoading(true);
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      setLoading(false);
      return;
    }

    // For dummy users, use dummy data
    if (userId && parseInt(userId) <= 6) {
      const dummyUser = dummyUsers.find((u) => u.id === parseInt(userId));
      const userPosts = dummyPosts.filter(
        (p) => p.user_id === parseInt(userId),
      );

      if (dummyUser) {
        setProfile({
          id: dummyUser.id,
          username: dummyUser.username,
          name: dummyUser.name,
          bio: `${dummyUser.specialty} specialist in ${dummyUser.location}`,
        });
        setPosts(userPosts);
        setLoading(false);
        return;
      }
    }

    const [profileData, userPosts] = await Promise.all([
      getUserProfile(targetUserId),
      getPostsByUserId(targetUserId),
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
              {profile?.username?.[0]?.toUpperCase() ||
                profile?.name?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="profile-info">
              <h1>{profile?.name || profile?.username || "User"}</h1>
              <p className="profile-email">{profile?.email || profile?.bio}</p>
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
                {!editing && isOwnProfile && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-secondary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing && isOwnProfile ? (
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
