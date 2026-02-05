import { NavLink } from "react-router";
import { useAuth } from "../auth/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { token, user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink className="navbar-brand" to="/">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">Nightingale</span>
        </NavLink>

        <nav className="navbar-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Find Hospitals
          </NavLink>

          {token ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Profile
              </NavLink>
              <button onClick={logout} className="btn btn-secondary">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-secondary">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
