import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import "../styles/Auth.css";

/** A form that allows users to register for a new account */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onRegister = async (formData) => {
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await register({ email, username, password });
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
            <h1>Join Nightingale</h1>
            <p className="subtitle">
              Create an account to share and discover healthcare insights
            </p>
          </div>
          <form action={onRegister} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full">
              Register
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
