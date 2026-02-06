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
            to="/search"
            className={({ isActive }) =>
              isActive ? "nav-link search-icon active" : "nav-link search-icon"
            }
          >
            ⌕
          </NavLink>

          <div className="navbar-dropdown">
            <button className="dropdown-trigger">
              {token ? (
                <>
                  <span className="user-avatar">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </>
              ) : (
                <>
                  <span>Menu</span>
                  <span className="dropdown-arrow">▼</span>
                </>
              )}
            </button>
            <div className="dropdown-menu">
              {token ? (
                <>
                  <NavLink to="/profile" className="dropdown-item">
                    👤 Profile
                  </NavLink>
                  <button onClick={logout} className="dropdown-item">
                    🚪 Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="dropdown-item">
                    🔑 Log in
                  </NavLink>
                  <NavLink to="/register" className="dropdown-item">
                    ✨ Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
