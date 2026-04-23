import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaRadiation } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getNotifications, getVolunteerMe, updateVolunteerMe } from "../api";
import "./volunteer.css";

const VolunteerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("available");
  const [notifications, setNotifications] = useState([]);
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, notificationsRes] = await Promise.all([getVolunteerMe(), getNotifications()]);
        setProfile(profileRes.data);
        setStatus(profileRes.data?.volunteer?.status || "available");
        setNotifications((notificationsRes.data || []).slice(0, 5));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard");
      }
    };
    loadData();
  }, []);

  const updateStatus = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    try {
      await updateVolunteerMe({ status: newStatus });
      setProfile((prev) => ({ ...prev, volunteer: { ...prev.volunteer, status: newStatus } }));
      toast.success("Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const assignment = profile?.volunteer;
  const disasterLocation = assignment?.disasterId?.location;
  const coordinates =
    disasterLocation && Number.isFinite(disasterLocation.lat) && Number.isFinite(disasterLocation.lng)
      ? [disasterLocation.lat, disasterLocation.lng]
      : [20.5937, 78.9629];

  const notifIcon = (type) => {
    if (type === "critical") return <FaRadiation color="#dc2626" />;
    if (type === "warning") return <FaExclamationTriangle color="#f59e0b" />;
    if (type === "success") return <FaCheckCircle color="#16a34a" />;
    return <FaInfoCircle color="#2563eb" />;
  };

  return (
    <div className="vol-dash">
      <h2>Volunteer Dashboard</h2>

      <div className="vol-grid">
        <div className="vol-card">
          <h3>Hello {user?.name || "Volunteer"}</h3>
          <p>Track assignment and update your availability.</p>
          <select className="vol-input" value={status} onChange={updateStatus}>
            <option value="available">Available</option>
            <option value="deployed">Deployed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="vol-card">
          <h3>Current Assignment</h3>
          <p>
            <strong>Disaster:</strong> {assignment?.disasterId?.title || "Not assigned"}
          </p>
          <p>
            <strong>Task:</strong> {assignment?.assignedTask || "No task assigned"}
          </p>
          <p>
            <strong>Description:</strong> {assignment?.taskDescription || "-"}
          </p>
          <div className="vol-map">
            <MapContainer center={coordinates} zoom={6} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={coordinates}>
                <Popup>{assignment?.disasterId?.title || "Disaster location"}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="vol-card">
          <h3>Skills</h3>
          <div className="vol-chip-wrap">
            {(assignment?.skills || []).length === 0 && <span className="vol-chip">No skills set</span>}
            {(assignment?.skills || []).map((skill) => (
              <span key={skill} className="vol-chip">
                {skill}
              </span>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/volunteer/profile")}>
            Edit Skills
          </button>
        </div>

        <div className="vol-card">
          <h3>Unread Notifications</h3>
          <div className="vol-notifs">
            {notifications.length === 0 && <p>No unread notifications.</p>}
            {notifications.map((item) => (
              <div key={item._id} className="vol-notif-item">
                <span>{notifIcon(item.type)}</span>
                <div>
                  <strong>{item.type}</strong>
                  <p>{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
