import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createResource,
  dispatchResource,
  getDisasters,
  getReliefCenters,
  getResources
} from "../api";
import "./adminResources.css";

const initialResourceForm = {
  name: "",
  type: "food",
  quantity: 0,
  unit: "units",
  disasterId: ""
};

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [resourceForm, setResourceForm] = useState(initialResourceForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resourceRes, disasterRes, centerRes] = await Promise.all([
        getResources(),
        getDisasters(),
        getReliefCenters()
      ]);
      setResources(resourceRes.data);
      setDisasters(disasterRes.data);
      setCenters(centerRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summary = useMemo(() => {
    const totalItems = resources.length;
    const dispatched = resources.filter((item) => item.status === "dispatched").length;
    const lowStock = resources.filter((item) => Number(item.quantity) < 10).length;
    return { totalItems, dispatched, lowStock };
  }, [resources]);

  const handleCreateResource = async (event) => {
    event.preventDefault();
    try {
      await createResource({
        ...resourceForm,
        quantity: Number(resourceForm.quantity)
      });
      toast.success("Resource added");
      setResourceForm(initialResourceForm);
      setDrawerOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add resource");
    }
  };

  const openDispatchModal = (resource) => {
    setSelectedResource(resource);
    setSelectedCenterId("");
    setDispatchOpen(true);
  };

  const handleDispatch = async () => {
    if (!selectedResource || !selectedCenterId) {
      toast.error("Please select a relief center");
      return;
    }
    try {
      await dispatchResource(selectedResource._id, selectedCenterId);
      toast.success("Resource dispatched");
      setDispatchOpen(false);
      setSelectedResource(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Dispatch failed");
    }
  };

  return (
    <div className="resource-page">
      <div className="resource-head">
        <h2>Resource Management</h2>
        <button className="rp-btn rp-primary" onClick={() => setDrawerOpen(true)}>
          Add Resource
        </button>
      </div>

      <div className="resource-summary">
        <div className="rp-stat">
          <h4>Total Items</h4>
          <strong>{summary.totalItems}</strong>
        </div>
        <div className="rp-stat">
          <h4>Dispatched</h4>
          <strong>{summary.dispatched}</strong>
        </div>
        <div className="rp-stat amber">
          <h4>Low Stock (&lt;10)</h4>
          <strong>{summary.lowStock}</strong>
        </div>
      </div>

      <div className="rp-card">
        <table className="rp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Disaster</th>
              <th>Assigned Center</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7">Loading resources...</td>
              </tr>
            )}
            {!loading &&
              resources.map((resource) => (
                <tr key={resource._id} className={Number(resource.quantity) < 10 ? "rp-low-stock" : ""}>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>
                    {resource.quantity} {resource.unit}
                  </td>
                  <td>
                    <span className={`rp-pill ${resource.status}`}>{resource.status}</span>
                  </td>
                  <td>{resource.disasterId?.title || "-"}</td>
                  <td>{centers.find((center) => center._id === resource.assignedTo)?.name || "-"}</td>
                  <td>
                    {resource.status === "available" ? (
                      <button className="rp-btn" onClick={() => openDispatchModal(resource)}>
                        Dispatch
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={`rp-backdrop ${drawerOpen ? "show" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`rp-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="rp-drawer-head">
          <h3>Add Resource</h3>
          <button className="rp-btn" onClick={() => setDrawerOpen(false)}>
            X
          </button>
        </div>
        <form className="rp-form" onSubmit={handleCreateResource}>
          <input
            className="rp-input"
            placeholder="Resource name"
            value={resourceForm.name}
            onChange={(event) => setResourceForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <select
            className="rp-input"
            value={resourceForm.type}
            onChange={(event) => setResourceForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="food">food</option>
            <option value="water">water</option>
            <option value="medicine">medicine</option>
          </select>
          <input
            className="rp-input"
            type="number"
            min="0"
            placeholder="Quantity"
            value={resourceForm.quantity}
            onChange={(event) => setResourceForm((prev) => ({ ...prev, quantity: event.target.value }))}
            required
          />
          <input
            className="rp-input"
            placeholder="Unit (e.g. boxes, liters)"
            value={resourceForm.unit}
            onChange={(event) => setResourceForm((prev) => ({ ...prev, unit: event.target.value }))}
            required
          />
          <select
            className="rp-input"
            value={resourceForm.disasterId}
            onChange={(event) => setResourceForm((prev) => ({ ...prev, disasterId: event.target.value }))}
            required
          >
            <option value="">Assign Disaster</option>
            {disasters.map((disaster) => (
              <option key={disaster._id} value={disaster._id}>
                {disaster.title}
              </option>
            ))}
          </select>
          <button className="rp-btn rp-primary" type="submit">
            Save Resource
          </button>
        </form>
      </aside>

      {dispatchOpen && (
        <div className="rp-modal-wrap">
          <div className="rp-modal-backdrop" onClick={() => setDispatchOpen(false)} />
          <div className="rp-modal">
            <h3>Dispatch Resource</h3>
            <p>
              Resource: <strong>{selectedResource?.name}</strong>
            </p>
            <select className="rp-input" value={selectedCenterId} onChange={(event) => setSelectedCenterId(event.target.value)}>
              <option value="">Select Relief Center</option>
              {centers.map((center) => (
                <option key={center._id} value={center._id}>
                  {center.name}
                </option>
              ))}
            </select>
            <div className="rp-actions">
              <button className="rp-btn" onClick={() => setDispatchOpen(false)}>
                Cancel
              </button>
              <button className="rp-btn rp-primary" onClick={handleDispatch}>
                Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
