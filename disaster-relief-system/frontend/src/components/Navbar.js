import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-logo">R</span>
        <NavLink to="/" className="brand-name">
          RescueNet
        </NavLink>
      </div>

      <nav className="topbar-nav">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        {user?.role === "admin" && (
          <NavLink to="/admin" className="nav-link">
            Dashboard
          </NavLink>
        )}
        {user?.role === "volunteer" && (
          <NavLink to="/volunteer" className="nav-link">
            Dashboard
          </NavLink>
        )}
        {user?.role === "relief_center" && (
          <NavLink to="/relief-center" className="nav-link">
            Dashboard
          </NavLink>
        )}
      </nav>

      <div className="topbar-actions">
        {!user && (
          <>
            <NavLink to="/login" className="btn btn-secondary">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        )}
        {user && (
          <>
            <span className="user-pill">{user.role.replace("_", " ")}</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
