import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import "../styles/Auth.css";

/** A form that allows users to log into an existing account. */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onLogin = async (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await login({ username, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p className="subtitle">
              Log in to connect with healthcare professionals
            </p>
          </div>
          <form action={onLogin} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input type="username" name="username" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full">
              Log In
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Need an account?{" "}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
