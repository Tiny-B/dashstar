import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./CSS/profile.css";

function Profile() {
  const { user, login } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");
  const [theme, setTheme] = useState("");
  const [role, setRole] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [level, setLevel] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const xpRequiredForLevel = (lvl) => 100 + (Math.max(lvl, 1) - 1) * 50;

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
      setCity(user.city || "");
      setTimezone(user.timezone || "");
      setTheme(user.theme || "");
      setRole(user.role || "User");
      setAvatarUrl(user.avatar_url || "");
      setLevel(user.level || 0);
      setTotalXp(user.xp || 0);
      setCompletedTasks(user.numTasksCompleted || 0);
    }
  }, [user]);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const saveProfile = async () => {
    if (!API_BASE) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username,
          email,
          phone,
          country,
          city,
          timezone,
          theme,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Profile update failed");
      }
      const data = await res.json();
      if (data.user) login(data.user);
      setStatusMsg("Profile updated.");
    } catch (err) {
      console.error(err);
      setStatusMsg("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const nextXpTarget = xpRequiredForLevel(level);
  const progressPct = Math.min(100, Math.round((totalXp / nextXpTarget) * 100));

  return (
    <div className="profile-container">

      <div className="profile-header">
        <div className="profile-header-left">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>

          <div className="profile-header-text">
            <h2>{fullName || "Your Name"}</h2>
            <p>{role}</p>

            <div className="profile-header-levels">
              <span className="profile-pill">Level {level}</span>
              <span className="profile-pill">{totalXp} XP</span>
            </div>
          </div>
        </div>

        <div className="profile-header-right">
          <button className="header-btn" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

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

          <button type="button" className="save-btn" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {statusMsg && <p className="status-msg">{statusMsg}</p>}
        </form>
      </div>

      <div className="profile-section profile-achievements">
        <h2>Achievements</h2>

        <p>Completed Tasks: {completedTasks}</p>
        <p>Total XP: {totalXp}</p>
        <p>Current Level: {level}</p>
        <p>XP to Next: {xpRequiredForLevel(level) - totalXp}</p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

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
