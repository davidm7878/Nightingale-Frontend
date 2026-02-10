import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAllPosts, createPost } from "../api/apicalls";
import { Link } from "react-router";
import "../styles/HomePage.css";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostBody, setNewPostBody] = useState("");
  const [loading, setLoading] = useState(true);
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
    setPosts(data);
    setLoading(false);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!newPostBody.trim() || !token) return;

    const post = await createPost(newPostBody, token);
    if (post) {
      setPosts([post, ...posts]);
      setNewPostBody("");
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
                src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop"
                alt="Healthcare professionals collaborating"
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
                    <div className="post-header">
                      <div className="post-avatar">
                        {post.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="post-meta">
                        <h3>{post.username || "Anonymous"}</h3>
                        <p className="post-date">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="post-body">
                      <p>{post.body}</p>
                    </div>
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
