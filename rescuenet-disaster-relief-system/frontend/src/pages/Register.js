import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { registerUser } from "../api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer"
  });
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (!password || password.length < 6) return { label: "Weak", cls: "weak", width: "33%" };
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length >= 8 && hasSpecial) return { label: "Strong", cls: "strong", width: "100%" };
    return { label: "Medium", cls: "medium", width: "66%" };
  };

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      toast.success("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-split">
      <section className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-logo">
            <FaShieldAlt />
            <span>RescueNet</span>
          </div>
          <h1>Coordinating relief when it matters most</h1>
          <p>Join the network that powers rapid disaster response and relief operations.</p>
        </div>
      </section>
      <section className="auth-right">
        <form onSubmit={handleSubmit} className="card auth-card">
          <h2>Create account</h2>
          <p>Register as admin, volunteer, or relief center.</p>
          <input className="input" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <div className="strength-wrap">
            <div className="strength-bar">
              <span className={`strength-fill ${strength.cls}`} style={{ width: strength.width }} />
            </div>
            <small>Password strength: {strength.label}</small>
          </div>
          <select className="input" name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="volunteer">Volunteer</option>
            <option value="relief_center">Relief Center</option>
          </select>
          <button className="btn btn-primary auth-submit" type="submit">
            Register
          </button>
          <p className="auth-linkline">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Register;
