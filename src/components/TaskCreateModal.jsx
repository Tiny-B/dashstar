import { useState } from "react";
import "./CSS/taskcard.css";

export default function TaskCreateModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), desc.trim(), difficulty);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#1f0c1a",
          border: "2px solid rgb(76, 0, 57)",
          borderRadius: "12px",
          padding: "20px",
          width: "360px",
          color: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Create Task</h3>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px", border: "1px solid #4c0039", background: "#2a0f24", color: "#fff" }}
        />
        <label>Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px", border: "1px solid #4c0039", background: "#2a0f24", color: "#fff" }}
        />
        <label>Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #4c0039", background: "#2a0f24", color: "#fff" }}
        >
          <option value="easy">Easy (10 XP)</option>
          <option value="medium">Medium (25 XP)</option>
          <option value="hard">Hard (50 XP)</option>
          <option value="insane">Insane (100 XP)</option>
        </select>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit}>Create</button>
        </div>
      </div>
    </div>
  );
}
