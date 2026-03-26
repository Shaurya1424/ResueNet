import React, { useEffect, useState } from "react";
import api from "../services/api";

const ReliefCenterDashboard = () => {
  const [center, setCenter] = useState({ name: "", location: "", capacity: 0 });
  const [centerId, setCenterId] = useState("");
  const [resourcesNeeded, setResourcesNeeded] = useState("");
  const [resources, setResources] = useState([]);
  const [message, setMessage] = useState("");

  const fetchResources = async () => {
    const { data } = await api.get("/resources");
    setResources(data);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const registerCenter = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/centers", { ...center, capacity: Number(center.capacity) });
    setCenterId(data._id);
    setMessage("Relief center registered successfully");
  };

  const requestResource = async (e) => {
    e.preventDefault();
    await api.post("/centers/request", {
      centerId,
      resourcesNeeded: resourcesNeeded
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    });
    setMessage("Resource request submitted");
  };

  return (
    <div className="content-wrap">
      <h2>Relief Center Dashboard</h2>
      <p>Register your relief center and request required inventory.</p>

      <div className="card form-card">
        <h3>Register Center</h3>
        <form onSubmit={registerCenter} className="grid-form">
          <input className="input" placeholder="Name" value={center.name} onChange={(e) => setCenter({ ...center, name: e.target.value })} required />
          <input className="input" placeholder="Location" value={center.location} onChange={(e) => setCenter({ ...center, location: e.target.value })} required />
          <input className="input" type="number" placeholder="Capacity" value={center.capacity} onChange={(e) => setCenter({ ...center, capacity: e.target.value })} required />
          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h3>Request Resources</h3>
        <form onSubmit={requestResource} className="grid-form">
          <input className="input" value={centerId} onChange={(e) => setCenterId(e.target.value)} placeholder="Center ID" required />
          <input
            className="input"
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            placeholder="resources (comma-separated)"
            required
          />
          <button className="btn btn-primary" type="submit">
            Request
          </button>
        </form>
        {message && <p className="success-text">{message}</p>}
      </div>

      <div className="card table-card">
        <h3>Available Resources</h3>
        <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{r.type}</td>
              <td>{r.quantity}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReliefCenterDashboard;
