import React from "react";
import PropTypes from "prop-types";
import { NavLink, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaChartBar, FaUsers, FaBoxes, FaHandsHelping, FaRegMap } from "react-icons/fa";

const roleLinks = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: <FaChartBar /> },
    { to: "/admin/disasters", label: "Disasters", icon: <FaRegMap /> },
    { to: "/admin/resources", label: "Resources", icon: <FaBoxes /> },
    { to: "/admin/volunteers", label: "Volunteers", icon: <FaUsers /> }
  ],
  volunteer: [{ to: "/volunteer", label: "Dashboard", icon: <FaHandsHelping /> }],
  relief_center: [{ to: "/relief-center", label: "Dashboard", icon: <FaBoxes /> }]
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const links = roleLinks[user?.role] || [];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className={`layout-sidebar ${isOpen ? "open" : ""}`}>
      <div className="layout-brand">
        <FaShieldAlt />
        <span>RescueNet</span>
      </div>
      <nav className="layout-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `layout-link ${isActive ? "active" : ""}`} onClick={onClose}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="layout-user">
        <div>{user?.name || "User"}</div>
        <div className="role-pill">{(user?.role || "unknown").replace("_", " ")}</div>
        <button className="layout-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Sidebar;
