import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { assignVolunteerTask, getDisasters, getVolunteers, matchVolunteers } from "../api";
import "./adminVolunteers.css";

const skillOptions = [
  "medical",
  "logistics",
  "search_rescue",
  "translation",
  "engineering",
  "communications",
  "food_distribution",
  "water_sanitation"
];

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchDisasterId, setMatchDisasterId] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [assignForm, setAssignForm] = useState({
    disasterId: "",
    assignedTask: "",
    taskDescription: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [volRes, disRes] = await Promise.all([getVolunteers(), getDisasters()]);
      setVolunteers(volRes.data);
      setDisasters(disRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSkill = (skill) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
    );
  };

  const openAssign = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setAssignForm({ disasterId: "", assignedTask: "", taskDescription: "" });
    setAssignOpen(true);
  };

  const submitAssign = async () => {
    if (!selectedVolunteer) return;
    try {
      await assignVolunteerTask(selectedVolunteer._id, {
        ...assignForm,
        status: "deployed"
      });
      toast.success("Task assigned successfully");
      setAssignOpen(false);
      setSelectedVolunteer(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign task");
    }
  };

  const runMatch = async () => {
    if (!matchDisasterId || requiredSkills.length === 0) {
      toast.error("Select disaster and at least one skill");
      return;
    }

    try {
      const { data } = await matchVolunteers({
        disasterId: matchDisasterId,
        requiredSkills
      });
      setMatches(data.matches || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to match volunteers");
    }
  };

  return (
    <div className="volunteer-page">
      <div className="volunteer-head">
        <h2>Volunteer Management</h2>
        <button className="vp-btn vp-primary" onClick={() => setMatchOpen(true)}>
          Find Matching Volunteers
        </button>
      </div>

      <div className="vp-card">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Assigned Disaster</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6">Loading volunteers...</td>
              </tr>
            )}
            {!loading &&
              volunteers.map((item) => (
                <tr key={item._id}>
                  <td>{item.userId?.name || "-"}</td>
                  <td>{item.userId?.email || "-"}</td>
                  <td>
                    <div className="vp-chip-wrap">
                      {(item.skills || []).length === 0 && <span className="vp-chip">No skills</span>}
                      {(item.skills || []).map((skill) => (
                        <span key={skill} className="vp-chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`vp-pill ${item.status}`}>{item.status}</span>
                  </td>
                  <td>{item.disasterId?.title || "-"}</td>
                  <td>
                    <button className="vp-btn" onClick={() => openAssign(item)}>
                      Assign Task
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {assignOpen && (
        <div className="vp-modal-wrap">
          <div className="vp-modal-backdrop" onClick={() => setAssignOpen(false)} />
          <div className="vp-modal">
            <h3>Assign Task</h3>
            <select
              className="vp-input"
              value={assignForm.disasterId}
              onChange={(event) => setAssignForm((prev) => ({ ...prev, disasterId: event.target.value }))}
            >
              <option value="">Select Disaster</option>
              {disasters.map((disaster) => (
                <option key={disaster._id} value={disaster._id}>
                  {disaster.title}
                </option>
              ))}
            </select>
            <input
              className="vp-input"
              placeholder="Assigned task title"
              value={assignForm.assignedTask}
              onChange={(event) => setAssignForm((prev) => ({ ...prev, assignedTask: event.target.value }))}
            />
            <textarea
              className="vp-input"
              rows="4"
              placeholder="Task description"
              value={assignForm.taskDescription}
              onChange={(event) => setAssignForm((prev) => ({ ...prev, taskDescription: event.target.value }))}
            />
            <div className="vp-actions">
              <button className="vp-btn" onClick={() => setAssignOpen(false)}>
                Cancel
              </button>
              <button className="vp-btn vp-primary" onClick={submitAssign}>
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {matchOpen && (
        <div className="vp-modal-wrap">
          <div className="vp-modal-backdrop" onClick={() => setMatchOpen(false)} />
          <div className="vp-modal vp-wide">
            <h3>Find Matching Volunteers</h3>
            <select
              className="vp-input"
              value={matchDisasterId}
              onChange={(event) => setMatchDisasterId(event.target.value)}
            >
              <option value="">Select Disaster</option>
              {disasters.map((disaster) => (
                <option key={disaster._id} value={disaster._id}>
                  {disaster.title}
                </option>
              ))}
            </select>
            <div className="vp-skills-grid">
              {skillOptions.map((skill) => (
                <label key={skill} className="vp-check">
                  <input
                    type="checkbox"
                    checked={requiredSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
            <button className="vp-btn vp-primary" onClick={runMatch}>
              Search Matches
            </button>
            <div className="vp-match-list">
              {matches.map((matchItem) => (
                <div key={matchItem.volunteer._id} className="vp-match-item">
                  <strong>{matchItem.volunteer.userId?.name || "Volunteer"}</strong>
                  <span>{matchItem.volunteer.userId?.email || "-"}</span>
                  <span>Skill overlap score: {(matchItem.score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteers;
