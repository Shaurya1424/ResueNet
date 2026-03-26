import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [disaster, setDisaster] = useState({
    title: "",
    type: "flood",
    location: "",
    severity: "",
    description: ""
  });
  const [resource, setResource] = useState({
    name: "",
    type: "food",
    quantity: 0,
    disasterId: "",
    status: "available"
  });
  const [volunteerUpdate, setVolunteerUpdate] = useState({ id: "", assignedTask: "", status: "assigned" });
  const [disasters, setDisasters] = useState([]);
  const [resources, setResources] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [disasterRes, resourceRes, volunteerRes] = await Promise.all([
        api.get("/disasters"),
        api.get("/resources"),
        api.get("/volunteers")
      ]);
      setDisasters(disasterRes.data);
      setResources(resourceRes.data);
      setVolunteers(volunteerRes.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createDisaster = async (e) => {
    e.preventDefault();
    try {
      await api.post("/disasters", disaster);
      setDisaster({ title: "", type: "flood", location: "", severity: "", description: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create disaster");
    }
  };

  const addResource = async (e) => {
    e.preventDefault();
    try {
      await api.post("/resources", { ...resource, quantity: Number(resource.quantity) });
      setResource({ name: "", type: "food", quantity: 0, disasterId: "", status: "available" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add resource");
    }
  };

  const assignVolunteer = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/volunteers/${volunteerUpdate.id}`, {
        assignedTask: volunteerUpdate.assignedTask,
        status: volunteerUpdate.status
      });
      setVolunteerUpdate({ id: "", assignedTask: "", status: "assigned" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign volunteer");
    }
  };

  const statusClass = (status = "") => {
    const normalized = status.toLowerCase();
    if (["active", "available", "ongoing", "assigned", "completed"].includes(normalized)) return "badge green";
    if (["pending", "in_progress"].includes(normalized)) return "badge yellow";
    return "badge red";
  };

  const sidebarItem = (tab, label) => (
    <button className={`sidebar-item ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
      {label}
    </button>
  );

  const totalResourceQty = resources.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const renderTable = () => (
    <div className="card table-card">
      <h3>{activeTab === "disasters" ? "All Disasters" : "All Resources"}</h3>
      {activeTab === "disasters" ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {disasters.map((d) => (
              <tr key={d._id}>
                <td>{d.title}</td>
                <td>{d.type}</td>
                <td>{d.location}</td>
                <td>{d.severity}</td>
                <td>
                  <span className={statusClass("active")}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Assigned Disaster</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.quantity}</td>
                <td>{r.disasterId?.title || "-"}</td>
                <td>
                  <span className={statusClass(r.status)}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        {sidebarItem("dashboard", "Dashboard")}
        {sidebarItem("disasters", "Disasters")}
        {sidebarItem("resources", "Resources")}
        {sidebarItem("volunteers", "Volunteers")}
      </aside>

      <section className="dashboard-content">
        <h2>Admin Dashboard</h2>
        <p>Overview of all disaster relief operations.</p>

        {error && <p className="error-text">{error}</p>}

        <div className="stats-grid">
          <div className="card stat-card">
            <h4>Total Disasters</h4>
            <strong>{disasters.length}</strong>
          </div>
          <div className="card stat-card">
            <h4>Active Volunteers</h4>
            <strong>{volunteers.length}</strong>
          </div>
          <div className="card stat-card">
            <h4>Available Resources</h4>
            <strong>{totalResourceQty}</strong>
          </div>
          <div className="card stat-card">
            <h4>Relief Centers</h4>
            <strong>--</strong>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="card form-card">
              <h3>Create Disaster</h3>
              <form onSubmit={createDisaster} className="grid-form">
                <input className="input" placeholder="Title" value={disaster.title} onChange={(e) => setDisaster({ ...disaster, title: e.target.value })} required />
                <select className="input" value={disaster.type} onChange={(e) => setDisaster({ ...disaster, type: e.target.value })}>
                  <option value="flood">Flood</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="cyclone">Cyclone</option>
                </select>
                <input className="input" placeholder="Location" value={disaster.location} onChange={(e) => setDisaster({ ...disaster, location: e.target.value })} required />
                <input className="input" placeholder="Severity" value={disaster.severity} onChange={(e) => setDisaster({ ...disaster, severity: e.target.value })} required />
                <input className="input full" placeholder="Description" value={disaster.description} onChange={(e) => setDisaster({ ...disaster, description: e.target.value })} required />
                <button className="btn btn-primary" type="submit">
                  Add Disaster
                </button>
              </form>
            </div>
            {renderTable()}
          </>
        )}

        {activeTab === "disasters" && renderTable()}

        {activeTab === "resources" && (
          <>
            <div className="card form-card">
              <h3>Add New Resource</h3>
              <form onSubmit={addResource} className="grid-form">
                <input className="input" placeholder="Resource Name" value={resource.name} onChange={(e) => setResource({ ...resource, name: e.target.value })} required />
                <select className="input" value={resource.type} onChange={(e) => setResource({ ...resource, type: e.target.value })}>
                  <option value="food">Food</option>
                  <option value="water">Water</option>
                  <option value="medicine">Medicine</option>
                </select>
                <input className="input" type="number" placeholder="Quantity" value={resource.quantity} onChange={(e) => setResource({ ...resource, quantity: e.target.value })} required />
                <select className="input" value={resource.disasterId} onChange={(e) => setResource({ ...resource, disasterId: e.target.value })} required>
                  <option value="">Assign to Disaster</option>
                  {disasters.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.title}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" type="submit">
                  Save Resource
                </button>
              </form>
            </div>
            {renderTable()}
          </>
        )}

        {activeTab === "volunteers" && (
          <div className="card form-card">
            <h3>Assign Volunteer Task</h3>
            <form onSubmit={assignVolunteer} className="grid-form">
              <select className="input" value={volunteerUpdate.id} onChange={(e) => setVolunteerUpdate({ ...volunteerUpdate, id: e.target.value })} required>
                <option value="">Select Volunteer</option>
                {volunteers.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.userId?.name || "Volunteer"} ({v.status})
                  </option>
                ))}
              </select>
              <input className="input" placeholder="Assigned Task" value={volunteerUpdate.assignedTask} onChange={(e) => setVolunteerUpdate({ ...volunteerUpdate, assignedTask: e.target.value })} required />
              <input className="input" placeholder="Status" value={volunteerUpdate.status} onChange={(e) => setVolunteerUpdate({ ...volunteerUpdate, status: e.target.value })} required />
              <button className="btn btn-primary" type="submit">
                Assign Task
              </button>
            </form>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Disaster</th>
                  <th>Task</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v._id}>
                    <td>{v.userId?.name || "-"}</td>
                    <td>{v.disasterId?.title || "-"}</td>
                    <td>{v.assignedTask || "-"}</td>
                    <td>
                      <span className={statusClass(v.status)}>{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
