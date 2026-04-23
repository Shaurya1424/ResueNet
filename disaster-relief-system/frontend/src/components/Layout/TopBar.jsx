import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FaBell, FaBars } from "react-icons/fa";
import { format } from "date-fns";
import { getNotifications, markNotificationRead } from "../../api";

const titleMap = {
  "/admin": "Admin Dashboard",
  "/admin/disasters": "Disaster Management",
  "/admin/resources": "Resource Management",
  "/admin/volunteers": "Volunteer Management",
  "/volunteer": "Volunteer Dashboard",
  "/volunteer/profile": "Volunteer Profile",
  "/relief-center": "Relief Center Dashboard"
};

const TopBar = ({ pathname, onToggleSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const pageTitle = useMemo(() => titleMap[pathname] || "Dashboard", [pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data.slice(0, 5));
      } catch (_error) {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [pathname]);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch (_error) {
      // Silent fail keeps top bar stable.
    }
  };

  return (
    <header className="layout-topbar">
      <div className="topbar-left">
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        <h2>{pageTitle}</h2>
      </div>

      <div className="topbar-left">
        <div className="notif-wrap">
          <button className="notif-btn" onClick={() => setOpenDropdown((prev) => !prev)}>
            <FaBell />
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
          {openDropdown && (
            <div className="notif-dropdown">
              {notifications.length === 0 && <div className="notif-item">No unread notifications.</div>}
              {notifications.map((notification) => (
                <div className="notif-item" key={notification._id}>
                  <div>{notification.message}</div>
                  <button onClick={() => handleRead(notification._id)}>Mark as read</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <span>{format(new Date(), "dd MMM yyyy")}</span>
      </div>
    </header>
  );
};

TopBar.propTypes = {
  pathname: PropTypes.string.isRequired,
  onToggleSidebar: PropTypes.func.isRequired
};

export default TopBar;
