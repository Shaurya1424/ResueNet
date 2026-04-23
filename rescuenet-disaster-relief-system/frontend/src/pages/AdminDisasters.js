import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createDisaster, getDisasters, patchDisasterStatus } from "../api";
import "./adminDisasters.css";

const nextStatusMap = {
  reported: "assessed",
  assessed: "active",
  active: "contained",
  contained: "closed",
  closed: null
};

const severityOptions = ["low", "medium", "high", "critical"];
const statusOptions = ["reported", "assessed", "active", "contained", "closed"];
const typeOptions = ["flood", "earthquake", "cyclone"];

const initialForm = {
  title: "",
  type: "flood",
  location: {
    address: "",
    lat: "",
    lng: ""
  },
  severity: "medium",
  description: "",
  affectedPeople: 0
};

const AdminDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const { data } = await getDisasters();
      setDisasters(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch disasters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  const filteredDisasters = useMemo(() => {
    const term = search.trim().toLowerCase();
    return disasters.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(term) ||
        item.type?.toLowerCase().includes(term) ||
        item.location?.address?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
      const matchesSeverity = severityFilter === "all" ? true : item.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [disasters, search, statusFilter, severityFilter]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await createDisaster({
        ...formData,
        location: {
          address: formData.location.address,
          lat: Number(formData.location.lat),
          lng: Number(formData.location.lng)
        },
        affectedPeople: Number(formData.affectedPeople)
      });
      toast.success("Disaster created");
      setFormData(initialForm);
      setDrawerOpen(false);
      fetchDisasters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create disaster");
    }
  };

  const openStatusModal = (item) => {
    setSelectedDisaster(item);
    setConfirmOpen(true);
  };

  const handleStatusConfirm = async () => {
    const nextStatus = selectedDisaster ? nextStatusMap[selectedDisaster.status] : null;
    if (!selectedDisaster || !nextStatus) {
      setConfirmOpen(false);
      return;
    }

    try {
      await patchDisasterStatus(selectedDisaster._id, nextStatus);
      toast.success(`Status updated to ${nextStatus}`);
      fetchDisasters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    } finally {
      setConfirmOpen(false);
      setSelectedDisaster(null);
    }
  };

  const handleDelete = () => {
    toast("Delete endpoint is not implemented yet on backend.");
  };

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setLocationField = (key, value) => {
    setFormData((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }));
  };

  return (
    <div className="disaster-page">
      <div className="disaster-head">
        <h2>Disaster Management</h2>
        <button className="dp-btn dp-primary" onClick={() => setDrawerOpen(true)}>
          Create Disaster
        </button>
      </div>

      <div className="disaster-filters">
        <input
          className="dp-input"
          placeholder="Search by title, type, address..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="dp-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select className="dp-input" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
          <option value="all">All Severities</option>
          {severityOptions.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>

      <div className="dp-card">
        <table className="dp-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Affected</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7">Loading disasters...</td>
              </tr>
            )}
            {!loading &&
              filteredDisasters.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td>{item.location?.address || "-"}</td>
                  <td>
                    <span className={`dp-pill severity-${item.severity}`}>{item.severity}</span>
                  </td>
                  <td>
                    <span className={`dp-pill status-${item.status}`}>{item.status}</span>
                  </td>
                  <td>{item.affectedPeople || 0}</td>
                  <td>
                    <div className="dp-actions">
                      <button
                        className="dp-btn"
                        onClick={() => openStatusModal(item)}
                        disabled={!nextStatusMap[item.status]}
                      >
                        Change Status
                      </button>
                      <button className="dp-btn dp-danger" onClick={handleDelete}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={`dp-drawer-backdrop ${drawerOpen ? "show" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`dp-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="dp-drawer-head">
          <h3>Create Disaster</h3>
          <button className="dp-btn" onClick={() => setDrawerOpen(false)}>
            X
          </button>
        </div>
        <form className="dp-form" onSubmit={handleCreate}>
          <input
            className="dp-input"
            placeholder="Title"
            value={formData.title}
            onChange={(event) => setField("title", event.target.value)}
            required
          />
          <select className="dp-input" value={formData.type} onChange={(event) => setField("type", event.target.value)}>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="dp-input"
            placeholder="Location address"
            value={formData.location.address}
            onChange={(event) => setLocationField("address", event.target.value)}
            required
          />
          <input
            className="dp-input"
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.location.lat}
            onChange={(event) => setLocationField("lat", event.target.value)}
            required
          />
          <input
            className="dp-input"
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.location.lng}
            onChange={(event) => setLocationField("lng", event.target.value)}
            required
          />
          <select
            className="dp-input"
            value={formData.severity}
            onChange={(event) => setField("severity", event.target.value)}
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="dp-input"
            type="number"
            min="0"
            placeholder="Affected people"
            value={formData.affectedPeople}
            onChange={(event) => setField("affectedPeople", event.target.value)}
          />
          <textarea
            className="dp-input"
            rows="4"
            placeholder="Description"
            value={formData.description}
            onChange={(event) => setField("description", event.target.value)}
            required
          />
          <button className="dp-btn dp-primary" type="submit">
            Save Disaster
          </button>
        </form>
      </aside>

      {confirmOpen && selectedDisaster && (
        <div className="dp-modal-wrap">
          <div className="dp-modal-backdrop" onClick={() => setConfirmOpen(false)} />
          <div className="dp-modal">
            <h3>Confirm Status Change</h3>
            <p>
              Current status: <strong>{selectedDisaster.status}</strong>
            </p>
            <p>
              Next valid transition: <strong>{nextStatusMap[selectedDisaster.status] || "None"}</strong>
            </p>
            <div className="dp-actions">
              <button className="dp-btn" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button className="dp-btn dp-primary" onClick={handleStatusConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisasters;
