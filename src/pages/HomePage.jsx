import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAllPosts, createPost } from "../api/apicalls";
import "../styles/HomePage.css";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostBody, setNewPostBody] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

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
