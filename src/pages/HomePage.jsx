import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  getAllPosts,
  createPost,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
  getCommentsByPostId,
  createComment,
} from "../api/apicalls";
import { Link } from "react-router";
import { dummyPosts } from "../data/dummyData";
import "../styles/HomePage.css";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostBody, setNewPostBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const { user, token } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchPosts() {
    setLoading(true);
    const data = await getAllPosts();
    // Use dummy data if API returns empty or fails
    setPosts(data && data.length > 0 ? data : dummyPosts);
    setLoading(false);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!newPostBody.trim() || !token) return;

    const post = await createPost(newPostBody, token);
    if (post) {
      setPosts([post, ...posts]);
      setNewPostBody("");
    } else {
      // If API fails, create a local post object
      const localPost = {
        id: Date.now(),
        user_id: user.id,
        username: user.username,
        body: newPostBody,
        created_at: new Date().toISOString(),
        likes: 0,
        comments: 0,
      };
      setPosts([localPost, ...posts]);
      setNewPostBody("");
    }
  }

  async function handleLike(postId) {
    if (!token) return;

    const result = await likePost(postId, token);
    if (result) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: result.likes, dislikes: result.dislikes }
            : post,
        ),
      );
    }
  }

  async function handleUnlike(postId) {
    if (!token) return;

    const result = await unlikePost(postId, token);
    if (result) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: result.likes, dislikes: result.dislikes }
            : post,
        ),
      );
    }
  }

  async function handleDislike(postId) {
    if (!token) return;

    const result = await dislikePost(postId, token);
    if (result) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: result.likes, dislikes: result.dislikes }
            : post,
        ),
      );
    }
  }

  async function handleUndislike(postId) {
    if (!token) return;

    const result = await undislikePost(postId, token);
    if (result) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: result.likes, dislikes: result.dislikes }
            : post,
        ),
      );
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
      // Add new comment to local state
      const newComment = {
        ...result.comment,
        username: user.username,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      // Update post comment count
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: result.commentCount }
            : post,
        ),
      );
      // Clear input
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  }

  // Landing page for non-logged in users
  if (!user) {
    return (
      <div className="landing-page">
        <section className="hero-landing">
          <div className="container">
            <div className="hero-content">
              <h1>Welcome to Nightingale</h1>
              <p className="hero-tagline">
                The Professional Network for Healthcare Workers
              </p>
              <p className="hero-description">
                Connect with fellow nurses and healthcare professionals. Share
                experiences, discover hospitals, and advance your career in
                healthcare.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Log In
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1590105577767-e21a1067899f?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Three nurses making hearts with their hands"
              />
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2>Why Join Nightingale?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-image">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop"
                    alt="Nurses collaborating"
                  />
                </div>
                <h3>Connect with Peers</h3>
                <p>
                  Build meaningful connections with healthcare professionals
                  across the country. Share your experiences and learn from
                  others.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-image">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop"
                    alt="Hospital building"
                  />
                </div>
                <h3>Discover Hospitals</h3>
                <p>
                  Search thousands of hospitals nationwide. Read reviews from
                  fellow healthcare workers and make informed career decisions.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-image">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
                    alt="Healthcare team"
                  />
                </div>
                <h3>Grow Your Career</h3>
                <p>
                  Share your professional profile, showcase your experience, and
                  connect with opportunities that match your goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of healthcare professionals on Nightingale today.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Create Your Account
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Logged-in user feed
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1>Connect with Healthcare Professionals</h1>
          <p className="hero-subtitle">
            Share experiences, find opportunities, and grow your nursing career
          </p>
        </div>
      </div>

      <div className="container">
        {user && (
          <div className="create-post-card">
            <h2>Share an Update</h2>
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPostBody}
                onChange={(e) => setNewPostBody(e.target.value)}
                placeholder="What's on your mind?"
                rows="4"
                required
              />
              <button type="submit" className="btn btn-primary">
                Post
              </button>
            </form>
          </div>
        )}

        <div className="posts-section">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : (
            posts.length > 0 && (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <Link
                      to={`/profile/${post.user_id}`}
                      className="post-header-link"
                    >
                      <div className="post-header">
                        <div className="post-avatar">
                          {post.username?.[0]?.toUpperCase() || "U"}
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
                        className="action-btn like-btn"
                        onClick={() => handleLike(post.id)}
                        disabled={!token}
                      >
                        <span>👍</span>
                        <span className="count">{post.likes || 0}</span>
                      </button>
                      <button
                        className="action-btn dislike-btn"
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
                                {comment.username?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div className="comment-content">
                                <span className="comment-author">
                                  {comment.username}
                                </span>
                                <p className="comment-body">{comment.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {token && (
                          <div className="comment-input-wrapper">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleAddComment(post.id);
                                }
                              }}
                              className="comment-input"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="btn btn-sm btn-primary"
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
