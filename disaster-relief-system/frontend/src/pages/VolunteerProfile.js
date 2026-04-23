import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getVolunteerMe, updateVolunteerMe } from "../api";
import "./volunteer.css";

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

const VolunteerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    password: "",
    status: "available",
    skills: []
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getVolunteerMe();
        setForm({
          name: data.user?.name || "",
          password: "",
          status: data.volunteer?.status || "available",
          skills: data.volunteer?.skills || []
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((item) => item !== skill)
        : [...prev.skills, skill]
    }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: form.name,
        status: form.status,
        skills: form.skills
      };
      if (form.password.trim()) payload.password = form.password;
      await updateVolunteerMe(payload);
      toast.success("Profile updated");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="vol-profile-page">
      <h2>Volunteer Profile</h2>
      <form className="vol-profile-form" onSubmit={submitProfile}>
        <label>
          Full Name
          <input
            className="vol-input"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>
        <label>
          Password (leave blank to keep current)
          <input
            className="vol-input"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>
        <label>
          Availability Status
          <select
            className="vol-input"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="available">Available</option>
            <option value="inactive">Inactive</option>
            <option value="deployed">Deployed</option>
          </select>
        </label>
        <div>
          <p>Skills</p>
          <div className="vol-skill-grid">
            {skillOptions.map((skill) => (
              <label key={skill} className="vol-check">
                <input type="checkbox" checked={form.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                {skill}
              </label>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" type="submit">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default VolunteerProfile;
