import React, { useState } from "react";
import "./CSS/profile.css";

function Profile() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");
  const [theme, setTheme] = useState("");
  const [role, setRole] = useState("User");

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="profile-container">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-header-left">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-header-text">
            <h2>{fullName || "Your Name"}</h2>
            <p>{role}</p>

            <div className="profile-header-levels">
              <span className="profile-pill">Level 12</span>
              <span className="profile-pill">2,450 XP</span>
            </div>
          </div>
        </div>

        <div className="profile-header-right">
          <button className="header-btn">Edit Profile</button>
          <button className="header-btn">Change Password</button>
        </div>
      </div>

      {/* REMOVED PAGE TITLE */}

      {/* PERSONAL DETAILS */}
      <div className="profile-section profile-personal">
        <h2>Personal Details</h2>

        <form className="profile-form">
          <label className="label-full">Full Name</label>
          <input
            className="input-full"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="label-username">Username</label>
          <input
            className="input-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label-email">Email</label>
          <input
            className="input-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label-phone">Phone</label>
          <input
            className="input-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="label-country">Country</label>
          <select
            className="input-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select Country</option>
            <option value="uk">United Kingdom</option>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="au">Australia</option>
            <option value="de">Germany</option>
          </select>

          <label className="label-city">City</label>
          <input
            className="input-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <label className="label-timezone">Timezone</label>
          <select
            className="input-timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option value="">Select Timezone</option>
            <option value="Europe/London">GMT / Europe-London</option>
            <option value="Europe/Paris">CET / Europe-Paris</option>
            <option value="America/New_York">EST / New York</option>
            <option value="America/Los_Angeles">PST / Los Angeles</option>
            <option value="Asia/Kolkata">IST / India</option>
          </select>

          <label className="label-theme">Theme</label>
          <select
            className="input-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="">Select Theme</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>

          <button type="button" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="profile-section profile-achievements">
        <h2>Achievements</h2>

        <p>Completed Tasks: 0</p>
        <p>Total XP: 0</p>
        <p>Current Level: 0</p>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      {/* TEAM DETAILS */}
      <div className="profile-section profile-team">
        <h2>Team Details</h2>

        <p>Team:</p>
        <p>Role: {role}</p>
        <p>Manager:</p>
        <p>Team Members:</p>
      </div>
    </div>
  );
}

export default Profile;
