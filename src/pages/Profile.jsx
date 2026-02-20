import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useParams, Link } from "react-router";
import {
  getPostsByUserId,
  getPostsFeed,
  getUserProfile,
  updateUserProfile,
  deletePost,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
  getCommentsByPostId,
  createComment,
  followUser,
  unfollowUser,
  isFollowingUser,
  getFollowingUsers,
  getFollowedHospitals,
} from "../api/apicalls";
import { dummyUsers, dummyPosts } from "../data/dummyData";
import "../styles/Profile.css";

export default function Profile() {
  const { user, token, loading: authLoading } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [userDislikes, setUserDislikes] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followedHospitals, setFollowedHospitals] = useState([]);
  const [formData, setFormData] = useState({
    bio: "",
    resume: "",
    profile_picture: "",
  });

  // Calculate isOwnProfile based on loaded profile, not just URL params
  const isOwnProfile = profile && user && profile.id === user.id;

  useEffect(() => {
    // Reset follow state when userId changes
    setIsFollowing(false);
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user]);

  async function fetchProfileData() {
    setLoading(true);
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      setLoading(false);
      return;
    }

    // For dummy users, use dummy data
    if (userId && parseInt(userId) >= 4 && parseInt(userId) <= 9) {
      const dummyUser = dummyUsers.find((u) => u.id === parseInt(userId));
      const userPosts = dummyPosts.filter(
        (p) => p.user_id === parseInt(userId),
      );

      if (dummyUser) {
        const dummyProfile = {
          id: dummyUser.id,
          username: dummyUser.username,
          name: dummyUser.name,
          bio: `${dummyUser.specialty} specialist in ${dummyUser.location}`,
        };
        setProfile(dummyProfile);
        setPosts(userPosts);

        // Check follow status for dummy users too
        if (token && user && dummyUser.id !== user.id) {
          const following = await isFollowingUser(dummyUser.id, token);
          console.log(
            `Follow status check for dummy user ${dummyUser.id}, isFollowing:`,
            following,
          );
          setIsFollowing(following);
        }

        setLoading(false);
        return;
      }
    }

    const [profileData, userPosts] = await Promise.all([
      getUserProfile(targetUserId),
      // Get posts based on whether viewing own profile or someone else's
      user && targetUserId === user.id && token
        ? getPostsFeed(targetUserId, token)
        : getPostsByUserId(targetUserId),
    ]);

    setProfile(profileData);
    setPosts(userPosts);
    if (profileData) {
      setFormData({
        bio: profileData.bio || "",
        resume: profileData.resume || "",
        profile_picture: profileData.profile_picture || "",
      });
    }

    // Check if this is own profile
    const isViewingOwnProfile =
      user && profileData && profileData.id === user.id;

    // Check if current user is following this profile (if not own profile)
    if (!isViewingOwnProfile && token && profileData) {
      console.log("Checking follow status for user:", profileData.id);
      const following = await isFollowingUser(profileData.id, token);
      console.log(
        `Follow status check: viewing user ${profileData.id}, isFollowing:`,
        following,
      );
      console.log("Setting isFollowing state to:", following);
      setIsFollowing(following);
      console.log("isFollowing state has been set");
    } else {
      console.log("Not checking follow status:", {
        isViewingOwnProfile,
        hasToken: !!token,
        hasProfileData: !!profileData,
      });
    }

    // If it's own profile, fetch following data
    if (isViewingOwnProfile && token) {
      const [following, hospitals] = await Promise.all([
        getFollowingUsers(targetUserId),
        getFollowedHospitals(token),
      ]);
      setFollowingUsers(following);
      setFollowedHospitals(hospitals);
    }

    setLoading(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Compress and resize image before converting to base64
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      // Create canvas for resizing
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set max dimensions (to reduce file size)
      const maxWidth = 400;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with reduced quality (0.7 = 70% quality)
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

      // Check if compressed size is reasonable (< 500KB as base64)
      if (compressedBase64.length > 500000) {
        alert(
          "Image is still too large after compression. Please try a smaller image.",
        );
        return;
      }

      setFormData({
        ...formData,
        profile_picture: compressedBase64,
      });
    };

    reader.readAsDataURL(file);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    console.log("Updating profile with data:", formData);
    console.log("Token:", token);

    try {
      const updated = await updateUserProfile(formData, token);
      console.log("Update response:", updated);
      setProfile(updated);
      setEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      alert(`Failed to update profile: ${error.message}`);
    }
  }

  async function handleDeletePost(postId) {
    if (!token) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    const success = await deletePost(postId, token);
    if (success) {
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    } else {
      alert("Failed to delete post. Please try again.");
    }
  }

  async function handleLike(postId) {
    if (!token) return;

    const post = posts.find((p) => p.id === postId);
    if (post?.isDummy) return;

    if (userLikes[postId]) {
      const result = await unlikePost(postId, token);
      if (result) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, likes: result.likes, dislikes: result.dislikes }
              : p,
          ),
        );
        setUserLikes((prev) => ({ ...prev, [postId]: false }));
      }
      return;
    }

    const result = await likePost(postId, token);
    if (result) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, likes: result.likes, dislikes: result.dislikes }
            : p,
        ),
      );
      setUserLikes((prev) => ({ ...prev, [postId]: true }));
      setUserDislikes((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function handleDislike(postId) {
    if (!token) return;

    const post = posts.find((p) => p.id === postId);
    if (post?.isDummy) return;

    if (userDislikes[postId]) {
      const result = await undislikePost(postId, token);
      if (result) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, likes: result.likes, dislikes: result.dislikes }
              : p,
          ),
        );
        setUserDislikes((prev) => ({ ...prev, [postId]: false }));
      }
      return;
    }

    const result = await dislikePost(postId, token);
    if (result) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, likes: result.likes, dislikes: result.dislikes }
            : p,
        ),
      );
      setUserDislikes((prev) => ({ ...prev, [postId]: true }));
      setUserLikes((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function toggleComments(postId) {
    const isExpanded = expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !comments[postId]) {
      const postComments = await getCommentsByPostId(postId);
      setComments((prev) => ({ ...prev, [postId]: postComments }));
    }
  }

  async function handleAddComment(postId) {
    if (!token || !commentInputs[postId]?.trim()) return;

    const result = await createComment(postId, commentInputs[postId], token);
    if (result) {
      const newComment = {
        ...result.comment,
        username: user.username,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p,
        ),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  }

  async function handleFollowToggle() {
    if (!token || !profile) return;

    console.log("Follow toggle - profile.id:", profile.id, "user.id:", user.id);
    console.log("Current isFollowing state:", isFollowing);

    // Extra safety check: don't allow following yourself
    if (profile.id === user.id || parseInt(profile.id) === parseInt(user.id)) {
      console.error("Cannot follow yourself");
      alert("You cannot follow yourself!");
      return;
    }

    if (isFollowing) {
      const result = await unfollowUser(profile.id, token);
      console.log("Unfollow result:", result);
      if (result) {
        setIsFollowing(false);
        console.log("Set isFollowing to false");
      }
    } else {
      const result = await followUser(profile.id, token);
      console.log("Follow result:", result);
      if (result) {
        setIsFollowing(true);
        console.log("Set isFollowing to true");
      }
    }
  }

  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
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
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="profile-picture-img"
                  />
                ) : (
                  profile?.username?.[0]?.toUpperCase() ||
                  profile?.name?.[0]?.toUpperCase() ||
                  "U"
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-update-picture"
                  title="Update profile picture"
                >
                  +
                </button>
              )}
            </div>
            <div className="profile-info">
              <h1>{profile?.username || "User"}</h1>
              <p className="profile-email">{profile?.email || profile?.bio}</p>
              {!isOwnProfile && token && (
                <button
                  onClick={handleFollowToggle}
                  className={`btn ${isFollowing ? "btn-secondary" : "btn-primary"}`}
                  style={{ marginTop: "12px" }}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
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
                    <label>Profile Picture</label>
                    <div className="picture-upload-options">
                      <div className="upload-option">
                        <label
                          htmlFor="file-upload"
                          className="file-upload-label"
                        >
                          <span className="upload-icon">📷</span>
                          Choose from device
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="file-input"
                        />
                      </div>
                      <div className="upload-divider">
                        <span>OR</span>
                      </div>
                      <div className="upload-option">
                        <input
                          id="profile_picture"
                          type="url"
                          value={
                            formData.profile_picture.startsWith("data:")
                              ? ""
                              : formData.profile_picture
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile_picture: e.target.value,
                            })
                          }
                          placeholder="Enter image URL (https://...)"
                          className="url-input"
                        />
                      </div>
                    </div>
                    {formData.profile_picture && (
                      <div className="picture-preview">
                        <img src={formData.profile_picture} alt="Preview" />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, profile_picture: "" })
                          }
                          className="btn-remove-picture"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
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

            {isOwnProfile &&
              (followingUsers.length > 0 || followedHospitals.length > 0) && (
                <div className="profile-card">
                  <div className="card-header">
                    <h2>Following</h2>
                    <Link to="/following" className="btn btn-secondary">
                      View All
                    </Link>
                  </div>
                  <div className="following-row-container">
                    {followingUsers.length > 0 && (
                      <div className="following-section">
                        <h3>Users</h3>
                        <div className="following-list">
                          {followingUsers
                            .filter(
                              (followedUser) => followedUser.id !== user.id,
                            )
                            .slice(0, 3)
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
                                    followedUser.username?.[0]?.toUpperCase() ||
                                    "U"
                                  )}
                                </div>
                                <div className="following-info">
                                  <span className="following-username">
                                    {followedUser.username}
                                  </span>
                                  {followedUser.bio && (
                                    <span className="following-bio">
                                      {followedUser.bio.substring(0, 60)}
                                      {followedUser.bio.length > 60
                                        ? "..."
                                        : ""}
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
                        <h3>Hospitals</h3>
                        <div className="following-list">
                          {followedHospitals.slice(0, 3).map((hospital) => (
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
                </div>
              )}

            <div className="profile-card">
              <h2>
                {isOwnProfile
                  ? "My Feed"
                  : `${profile?.username || "User"}'s Posts`}
              </h2>
              {isOwnProfile && posts.length > 0 && (
                <p className="feed-description">
                  Posts from you and people you follow
                </p>
              )}
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {isOwnProfile
                      ? "No posts yet. Start following users to see their posts here!"
                      : "This user hasn't posted anything yet"}
                  </p>
                </div>
              ) : (
                <div className="posts-grid">
                  {posts.map((post) => (
                    <div key={post.id} className="post-card">
                      {user && user.id === post.user_id && (
                        <button
                          className="delete-btn-corner"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete post"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      )}
                      <Link
                        to={`/profile/${post.user_id}`}
                        className="post-header-link"
                      >
                        <div className="post-header">
                          <div className="post-avatar">
                            {post.profile_picture ? (
                              <img
                                src={post.profile_picture}
                                alt={post.username}
                                className="avatar-img"
                              />
                            ) : (
                              post.username?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="post-meta">
                            <h3>{post.username || "Anonymous"}</h3>
                            <p className="post-date">
                              {new Date(post.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="post-body">
                        <p>{post.body}</p>
                      </div>
                      <div className="post-actions">
                        <button
                          className={`action-btn like-btn ${
                            userLikes[post.id] ? "active" : ""
                          }`}
                          onClick={() => handleLike(post.id)}
                          disabled={!token}
                        >
                          <span>👍</span>
                          <span className="count">{post.likes || 0}</span>
                        </button>
                        <button
                          className={`action-btn dislike-btn ${
                            userDislikes[post.id] ? "active" : ""
                          }`}
                          onClick={() => handleDislike(post.id)}
                          disabled={!token}
                        >
                          <span>👎</span>
                          <span className="count">{post.dislikes || 0}</span>
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => toggleComments(post.id)}
                          disabled={!token}
                        >
                          <span>💬</span>
                          {post.comments && (
                            <span className="count">{post.comments}</span>
                          )}
                        </button>
                      </div>

                      {expandedComments[post.id] && (
                        <div className="comments-section">
                          <div className="comments-list">
                            {comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="comment">
                                <div className="comment-avatar">
                                  {comment.profile_picture ? (
                                    <img
                                      src={comment.profile_picture}
                                      alt={comment.username}
                                      className="avatar-img"
                                    />
                                  ) : (
                                    comment.username?.[0]?.toUpperCase() || "U"
                                  )}
                                </div>
                                <div className="comment-content">
                                  <div className="comment-header">
                                    <span className="comment-author">
                                      {comment.username || "Anonymous"}
                                    </span>
                                    <span className="comment-date">
                                      {new Date(
                                        comment.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="comment-text">{comment.body}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="comment-form">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
