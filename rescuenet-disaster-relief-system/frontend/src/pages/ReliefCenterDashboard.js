import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  FaBuilding,
  FaUsers,
  FaBoxOpen,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaBell,
  FaInfoCircle,
  FaCheckCircle,
  FaRadiation
} from "react-icons/fa";
import {
  getMyReliefCenter,
  registerReliefCenter,
  updateMyReliefCenter,
  requestCenterResources,
  getNotifications
} from "../api";
import {
  StatCard,
  StatusBadge,
  SlideOver,
  SkeletonLoader,
  DisasterMap
} from "../components/ui";
import "./reliefCenter.css";

const URGENCY_OPTIONS = ["low", "medium", "high", "critical"];
const STATUS_OPTIONS = ["active", "inactive", "overwhelmed"];

const emptyResourceRow = () => ({ resourceType: "", quantity: 1, urgency: "medium" });

const blankCenterForm = {
  name: "",
  location: { address: "", lat: "", lng: "" },
  capacity: 0,
  currentOccupancy: 0
};

const ReliefCenterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(null);
  const [receivedResources, setReceivedResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [centerForm, setCenterForm] = useState(blankCenterForm);
  const [updateForm, setUpdateForm] = useState(null);
  const [requestRows, setRequestRows] = useState([emptyResourceRow()]);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const loadCenter = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: centerData }, { data: notificationData }] = await Promise.all([
        getMyReliefCenter(),
        getNotifications().catch(() => ({ data: [] }))
      ]);
      setCenter(centerData.center);
      setReceivedResources(centerData.receivedResources || []);
      setNotifications((notificationData || []).slice(0, 6));
      if (centerData.center) {
        setRequestRows(
          centerData.center.resourcesNeeded?.length
            ? centerData.center.resourcesNeeded.map((item) => ({
                resourceType: item.resourceType,
                quantity: item.quantity,
                urgency: item.urgency
              }))
            : [emptyResourceRow()]
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load relief center");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCenter();
  }, [loadCenter]);

  const occupancyRatio = useMemo(() => {
    if (!center || !center.capacity) return 0;
    return Math.min(100, Math.round(((center.currentOccupancy || 0) / center.capacity) * 100));
  }, [center]);

  const openRequestsCount = center?.resourcesNeeded?.length || 0;

  const occupancyTone = occupancyRatio >= 90 ? "red" : occupancyRatio >= 70 ? "amber" : "green";

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      await registerReliefCenter({
        name: centerForm.name.trim(),
        location: {
          address: centerForm.location.address.trim(),
          lat: Number(centerForm.location.lat),
          lng: Number(centerForm.location.lng)
        },
        capacity: Number(centerForm.capacity),
        currentOccupancy: Number(centerForm.currentOccupancy) || 0
      });
      toast.success("Relief center registered");
      setRegisterOpen(false);
      setCenterForm(blankCenterForm);
      loadCenter();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const openUpdatePanel = () => {
    if (!center) return;
    setUpdateForm({
      name: center.name,
      address: center.location?.address || "",
      lat: center.location?.lat ?? "",
      lng: center.location?.lng ?? "",
      capacity: center.capacity,
      currentOccupancy: center.currentOccupancy || 0,
      status: center.status || "active"
    });
    setUpdateOpen(true);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!updateForm) return;
    try {
      await updateMyReliefCenter({
        name: updateForm.name.trim(),
        location: {
          address: updateForm.address.trim(),
          lat: Number(updateForm.lat),
          lng: Number(updateForm.lng)
        },
        capacity: Number(updateForm.capacity),
        currentOccupancy: Number(updateForm.currentOccupancy) || 0,
        status: updateForm.status
      });
      toast.success("Center updated");
      setUpdateOpen(false);
      loadCenter();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleRequestChange = (index, key, value) => {
    setRequestRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRequestRow = () => setRequestRows((prev) => [...prev, emptyResourceRow()]);

  const removeRequestRow = (index) =>
    setRequestRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const submitRequests = async (event) => {
    event.preventDefault();
    if (!center) return;
    const payload = requestRows
      .map((row) => ({
        resourceType: row.resourceType.trim(),
        quantity: Number(row.quantity),
        urgency: row.urgency
      }))
      .filter((row) => row.resourceType && row.quantity > 0);

    try {
      await requestCenterResources({ centerId: center._id, resourcesNeeded: payload });
      toast.success("Resource request submitted");
      setRequestOpen(false);
      loadCenter();
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  const notifIcon = (type) => {
    if (type === "critical") return <FaRadiation color="#dc2626" />;
    if (type === "warning") return <FaExclamationTriangle color="#f59e0b" />;
    if (type === "success") return <FaCheckCircle color="#16a34a" />;
    return <FaInfoCircle color="#2563eb" />;
  };

  // --- Not yet registered state ---
  if (!loading && !center) {
    return (
      <div className="rc-page">
        <div className="rc-empty">
          <div className="rc-empty-icon">
            <FaBuilding />
          </div>
          <h2>Welcome {user?.name || "Relief Partner"}</h2>
          <p>You haven't registered a relief center yet. Set up your center to start coordinating resources.</p>
          <button className="ui-btn primary" onClick={() => setRegisterOpen(true)}>
            <FaPlus style={{ marginRight: 6 }} /> Register My Center
          </button>
        </div>

        <SlideOver open={registerOpen} title="Register Relief Center" onClose={() => setRegisterOpen(false)}>
          <form className="rc-form" onSubmit={handleRegister}>
            <label>Center Name</label>
            <input
              className="rc-input"
              value={centerForm.name}
              onChange={(event) => setCenterForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <label>Address</label>
            <input
              className="rc-input"
              value={centerForm.location.address}
              onChange={(event) =>
                setCenterForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, address: event.target.value }
                }))
              }
              required
            />
            <div className="rc-form-grid">
              <div>
                <label>Latitude</label>
                <input
                  className="rc-input"
                  type="number"
                  step="any"
                  value={centerForm.location.lat}
                  onChange={(event) =>
                    setCenterForm((prev) => ({
                      ...prev,
                      location: { ...prev.location, lat: event.target.value }
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label>Longitude</label>
                <input
                  className="rc-input"
                  type="number"
                  step="any"
                  value={centerForm.location.lng}
                  onChange={(event) =>
                    setCenterForm((prev) => ({
                      ...prev,
                      location: { ...prev.location, lng: event.target.value }
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label>Capacity</label>
                <input
                  className="rc-input"
                  type="number"
                  min="0"
                  value={centerForm.capacity}
                  onChange={(event) => setCenterForm((prev) => ({ ...prev, capacity: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label>Current Occupancy</label>
                <input
                  className="rc-input"
                  type="number"
                  min="0"
                  value={centerForm.currentOccupancy}
                  onChange={(event) =>
                    setCenterForm((prev) => ({ ...prev, currentOccupancy: event.target.value }))
                  }
                />
              </div>
            </div>
            <button className="ui-btn primary" type="submit">
              Save Center
            </button>
          </form>
        </SlideOver>
      </div>
    );
  }

  return (
    <div className="rc-page">
      <div className="rc-head">
        <div>
          <h2>{center?.name || "Relief Center"}</h2>
          <p className="rc-subtitle">
            {center?.location?.address || "Location unavailable"} ·{" "}
            <StatusBadge label={center?.status || "active"} />
          </p>
        </div>
        <div className="rc-head-actions">
          <button className="ui-btn" onClick={openUpdatePanel}>
            Update Info
          </button>
          <button className="ui-btn primary" onClick={() => setRequestOpen(true)}>
            <FaPlus style={{ marginRight: 6 }} /> Request Resources
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rc-stats">
          <SkeletonLoader height={100} count={4} />
        </div>
      ) : (
        <div className="rc-stats">
          <StatCard
            label="Capacity"
            value={center.capacity}
            subtext={`${center.currentOccupancy || 0} currently housed`}
            icon={<FaBuilding />}
            tone="blue"
          />
          <StatCard
            label="Occupancy"
            value={`${occupancyRatio}%`}
            subtext={occupancyRatio >= 90 ? "Near capacity" : occupancyRatio >= 70 ? "Filling fast" : "Comfortable"}
            icon={<FaUsers />}
            tone={occupancyTone}
          />
          <StatCard
            label="Open Requests"
            value={openRequestsCount}
            subtext={openRequestsCount ? "Awaiting dispatch" : "All needs met"}
            icon={<FaExclamationTriangle />}
            tone={openRequestsCount ? "amber" : "green"}
          />
          <StatCard
            label="Received Resources"
            value={receivedResources.length}
            subtext="Items dispatched to you"
            icon={<FaBoxOpen />}
            tone="green"
          />
        </div>
      )}

      <div className="rc-main-grid">
        <div className="rc-card">
          <div className="rc-card-head">
            <h3>Occupancy</h3>
          </div>
          <div className="rc-occupancy">
            <div className="rc-occupancy-bar">
              <div
                className={`rc-occupancy-fill tone-${occupancyTone}`}
                style={{ width: `${occupancyRatio}%` }}
              />
            </div>
            <div className="rc-occupancy-meta">
              <span>
                <strong>{center?.currentOccupancy || 0}</strong> / {center?.capacity || 0} people
              </span>
              <span>{occupancyRatio}% full</span>
            </div>
          </div>
        </div>

        <div className="rc-card">
          <div className="rc-card-head">
            <h3>Location</h3>
          </div>
          {center?.location?.lat && center?.location?.lng ? (
            <DisasterMap
              markers={[
                {
                  _id: center._id,
                  title: center.name,
                  description: center.location.address,
                  location: center.location,
                  severity: "medium"
                }
              ]}
              center={[center.location.lat, center.location.lng]}
              zoom={10}
              height={240}
              useMarker
            />
          ) : (
            <p className="rc-muted">No coordinates set.</p>
          )}
        </div>
      </div>

      <div className="rc-card">
        <div className="rc-card-head">
          <h3>Active Resource Requests</h3>
          <span className="rc-muted">{openRequestsCount} open</span>
        </div>
        {openRequestsCount === 0 ? (
          <p className="rc-muted">No pending requests. Click "Request Resources" to submit one.</p>
        ) : (
          <table className="rc-table">
            <thead>
              <tr>
                <th>Resource Type</th>
                <th>Quantity</th>
                <th>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {center.resourcesNeeded.map((row, idx) => (
                <tr key={`${row.resourceType}-${idx}`}>
                  <td>{row.resourceType}</td>
                  <td>{row.quantity}</td>
                  <td>
                    <StatusBadge label={row.urgency} kind="severity" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rc-main-grid">
        <div className="rc-card">
          <div className="rc-card-head">
            <h3>Received Resources</h3>
            <span className="rc-muted">{receivedResources.length} items</span>
          </div>
          {receivedResources.length === 0 ? (
            <p className="rc-muted">No resources have been dispatched to this center yet.</p>
          ) : (
            <table className="rc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Disaster</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {receivedResources.map((resource) => (
                  <tr key={resource._id}>
                    <td>{resource.name}</td>
                    <td>{resource.type}</td>
                    <td>
                      {resource.quantity} {resource.unit || ""}
                    </td>
                    <td>{resource.disasterId?.title || "-"}</td>
                    <td>
                      {resource.lastUpdated
                        ? format(new Date(resource.lastUpdated), "dd MMM yyyy HH:mm")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rc-card">
          <div className="rc-card-head">
            <h3>
              <FaBell style={{ marginRight: 6 }} />
              Notifications
            </h3>
          </div>
          {notifications.length === 0 ? (
            <p className="rc-muted">No unread notifications.</p>
          ) : (
            <div className="rc-notifs">
              {notifications.map((item) => (
                <div className="rc-notif" key={item._id}>
                  <span className="rc-notif-icon">{notifIcon(item.type)}</span>
                  <div>
                    <strong>{item.type}</strong>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Resources SlideOver */}
      <SlideOver open={requestOpen} title="Request Resources" onClose={() => setRequestOpen(false)}>
        <form className="rc-form" onSubmit={submitRequests}>
          <p className="rc-muted">Submit the list of resources your center needs. Existing requests will be replaced.</p>
          {requestRows.map((row, index) => (
            <div className="rc-request-row" key={index}>
              <input
                className="rc-input"
                placeholder="e.g. water"
                value={row.resourceType}
                onChange={(event) => handleRequestChange(index, "resourceType", event.target.value)}
                required
              />
              <input
                className="rc-input"
                type="number"
                min="1"
                value={row.quantity}
                onChange={(event) => handleRequestChange(index, "quantity", event.target.value)}
                required
              />
              <select
                className="rc-input"
                value={row.urgency}
                onChange={(event) => handleRequestChange(index, "urgency", event.target.value)}
              >
                {URGENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ui-btn danger rc-remove"
                onClick={() => removeRequestRow(index)}
                disabled={requestRows.length === 1}
                aria-label="Remove row"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button type="button" className="ui-btn" onClick={addRequestRow}>
            <FaPlus style={{ marginRight: 6 }} /> Add another item
          </button>
          <button className="ui-btn primary" type="submit">
            Submit Request
          </button>
        </form>
      </SlideOver>

      {/* Update Info SlideOver */}
      <SlideOver open={updateOpen} title="Update Center Info" onClose={() => setUpdateOpen(false)}>
        {updateForm && (
          <form className="rc-form" onSubmit={handleUpdate}>
            <label>Name</label>
            <input
              className="rc-input"
              value={updateForm.name}
              onChange={(event) => setUpdateForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <label>Address</label>
            <input
              className="rc-input"
              value={updateForm.address}
              onChange={(event) => setUpdateForm((prev) => ({ ...prev, address: event.target.value }))}
              required
            />
            <div className="rc-form-grid">
              <div>
                <label>Latitude</label>
                <input
                  className="rc-input"
                  type="number"
                  step="any"
                  value={updateForm.lat}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, lat: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label>Longitude</label>
                <input
                  className="rc-input"
                  type="number"
                  step="any"
                  value={updateForm.lng}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, lng: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label>Capacity</label>
                <input
                  className="rc-input"
                  type="number"
                  min="0"
                  value={updateForm.capacity}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, capacity: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label>Current Occupancy</label>
                <input
                  className="rc-input"
                  type="number"
                  min="0"
                  value={updateForm.currentOccupancy}
                  onChange={(event) =>
                    setUpdateForm((prev) => ({ ...prev, currentOccupancy: event.target.value }))
                  }
                />
              </div>
            </div>
            <label>Status</label>
            <select
              className="rc-input"
              value={updateForm.status}
              onChange={(event) => setUpdateForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button className="ui-btn primary" type="submit">
              Save Changes
            </button>
          </form>
        )}
      </SlideOver>
    </div>
  );
};

export default ReliefCenterDashboard;
