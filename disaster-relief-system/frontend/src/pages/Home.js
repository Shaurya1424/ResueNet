import React from "react";
import { Link } from "react-router-dom";

const Home = () => (
  <div>
    <section className="hero">
      <div className="hero-content">
        <p className="hero-kicker">Emergency response platform</p>
        <h1>Coordinating Disaster Relief Efficiently</h1>
        <p>
          A centralized platform to manage disasters, volunteers, and relief resources while helping teams
          respond faster when it matters most.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </div>
    </section>

    <section className="feature-section">
      <h2>How RescueNet Helps</h2>
      <p>Our platform streamlines every aspect of disaster relief coordination.</p>
      <div className="feature-grid">
        <article className="feature-card">
          <h3>Disaster Tracking</h3>
          <p>Track active events across locations with severity and status updates.</p>
        </article>
        <article className="feature-card">
          <h3>Resource Management</h3>
          <p>Allocate food, water, and medicine to the right location at the right time.</p>
        </article>
        <article className="feature-card">
          <h3>Volunteer Coordination</h3>
          <p>Assign volunteers to tasks and monitor progress from a central dashboard.</p>
        </article>
      </div>
    </section>
  </div>
);

export default Home;
