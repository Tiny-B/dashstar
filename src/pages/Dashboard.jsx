import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";
import TaskList from "../components/TaskList";
import TeamIconButton from "../components/TeamIconButton";
import TaskCreateModal from "../components/TaskCreateModal";
import ChatWidget from "../components/ChatWidget";
import "./CSS/dashboard.css";
import { Link, useNavigate } from "react-router-dom";

import avatarDefault from "../assets/avatardefault.svg";
import burgerMenuIcon from "../assets/BurgerMenuIcon.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [nextXp, setNextXp] = useState(0);
  const [xPSession, setXPSession] = useState(0);
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [inprogressList, setInprogressList] = useState([]);
  const [completeList, setCompleteList] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [workspaceSummary, setWorkspaceSummary] = useState(null);
  const [copyNotice, setCopyNotice] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [levelUpNotice, setLevelUpNotice] = useState(null);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveQuery, setArchiveQuery] = useState("");
  const xpRequiredForLevel = (lvl) => 100 + (Math.max(lvl, 1) - 1) * 50;
  const [navOpen, setNavOpen] = useState(false);
  const [showWorkspacePicker, setShowWorkspacePicker] = useState(false);
  const currentWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId);
  const canManageTasks = currentWorkspace?.role === "admin";

  useEffect(() => {
    setLevel(user.level);
    setTotalXp(user.xp);
    setUsername(user.username);
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchTeams(selectedWorkspaceId);
    } else {
      setSelectedTeamId(null);
      setTasks([]);
      partitionTasks([]);
    }
  }, [selectedWorkspaceId]);

  const fetchWorkspaces = async (preferredId = null) => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/workspaces/my`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load workspaces");
      const data = await res.json();
      setWorkspaces(data);
      if (data.length > 0) {
        const target = preferredId && data.find((ws) => ws.id === preferredId) ? preferredId : data[0].id;
        setSelectedWorkspaceId(target);
      } else {
        setSelectedWorkspaceId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeams = async (workspaceId) => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/teams`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load teams");
      const data = await res.json();
      if (data.length > 0) {
        setSelectedTeamId(data[0].id);
        await fetchTasks(data[0].id);
      } else {
        setSelectedTeamId(null);
        setTasks([]);
        partitionTasks([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (teamId) => {
    if (!API_BASE || !teamId) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/my`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      const filtered = data.filter((t) => t.team_id === teamId);
      setTasks(filtered);
      partitionTasks(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const partitionTasks = (list) => {
    setTaskList(list.filter((t) => t.status === "open"));
    setInprogressList(list.filter((t) => t.status === "inprogress"));
    setCompleteList(list.filter((t) => t.status === "complete"));
  };

  const loadArchived = async () => {
    if (!API_BASE || !selectedWorkspaceId) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/my?status=archived`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load archived tasks");
      const data = await res.json();
      const filtered = data.filter((t) => t.workspace_id === selectedWorkspaceId || t.team_id === selectedTeamId);
      setArchivedTasks(filtered);
      setShowArchivedModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load archived tasks");
    }
  };

  const createNewTask = async () => {
    if (!canManageTasks) return;
    setShowTaskModal(true);
  };

  const updateTaskStatus = async (taskId, status) => {
    if (!API_BASE) return;
    const prev = tasks;
    const optimistic = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(optimistic);
    partitionTasks(optimistic);

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update task");
      }
      const payload = await res.json();
      const updatedTask = payload.task || payload;
      const updated = optimistic.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(updated);
      partitionTasks(updated);
      if (payload.user) {
        if (payload.user.level && payload.user.level > level) {
          setLevelUpNotice(payload.user.level);
          setTimeout(() => setLevelUpNotice(null), 2000);
        }
        login({ ...user, ...payload.user });
        setLevel(payload.user.level);
        setTotalXp(payload.user.xp);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update task");
      setTasks(prev);
      partitionTasks(prev);
    }
  };

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const createWorkspace = async () => {
    if (!API_BASE) return;
    setShowCreateWorkspace(true);
  };

  const submitWorkspace = async () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
    try {
      const res = await fetch(`${API_BASE}/workspaces`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create workspace");
      const ws = await res.json();
      await fetchWorkspaces(ws.id);
      await fetchTeams(ws.id);
      setShowCreateWorkspace(false);
      setNewWorkspaceName("");
    } catch (err) {
      console.error(err);
      alert("Failed to create workspace");
    }
  };

  const joinWorkspace = async () => {
    if (!API_BASE || !joinCode) return;
    try {
      const res = await fetch(`${API_BASE}/workspaces/join`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      if (!res.ok) {
        const errText = await res.text();
        setJoinError(errText || "Failed to join workspace");
        return;
      }
      const ws = await res.json();
      setJoinCode("");
      setJoinError("");
      setShowJoinModal(false);
      await fetchWorkspaces(ws.id);
      await fetchTeams(ws.id);
    } catch (err) {
      console.error(err);
      setJoinError("Failed to join workspace");
    }
  };

  const loadWorkspaceSummary = async () => {
    if (!API_BASE || !selectedWorkspaceId) return;
    try {
      const res = await fetch(`${API_BASE}/workspaces/${selectedWorkspaceId}/summary`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load workspace info");
      const data = await res.json();
      setWorkspaceSummary(data);
      setShowInfoModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load workspace info");
    }
  };

  const copyWorkspaceCode = (code) => {
    if (!code) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopyNotice("Copied");
        setTimeout(() => setCopyNotice(""), 1500);
      });
    }
  };

  const TaskListPlaceHolder = () => {
    const placeholderStyle = {
      height: "100%",
      width: "100%",
      color: "#eba8ffff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "2rem",
      border: "2px solid rgb(76, 0, 57)",
      borderRadius: "20px",
    };
    return (
      <div style={placeholderStyle}>
        <p>No tasks in this list</p>
      </div>
    );
  };

  const CreateTaskList = ({ title, list, showCreateBtn }) => {
    return (
      <TaskList title={title} showCreateBtn={showCreateBtn} onClickHandler={createNewTask}>
        {list.length !== 0 ? (
          <ul className="task-list dash-bg dash-border dash-shadow">
            {list.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} onStatusChange={updateTaskStatus} userRole={user?.role} />
              </li>
            ))}
          </ul>
        ) : (
          <TaskListPlaceHolder />
        )}
      </TaskList>
    );
  };

  return (
    <div className="dashboard">
      {showJoinModal && (
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
              width: "320px",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Enter workspace code</h3>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Workspace code"
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #4c0039",
                background: "#2a0f24",
                color: "#fff",
              }}
            />
            {joinError && <p style={{ color: "#ff7676", marginBottom: "8px" }}>{joinError}</p>}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
              <button onClick={joinWorkspace}>Join</button>
            </div>
          </div>
        </div>
      )}

      {showCreateWorkspace && (
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
              width: "320px",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Create workspace</h3>
            <input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #4c0039",
                background: "#2a0f24",
                color: "#fff",
              }}
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreateWorkspace(false)}>Cancel</button>
              <button onClick={submitWorkspace}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && workspaceSummary && (
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
              maxHeight: "80vh",
              overflow: "hidden",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{workspaceSummary.name}</h3>
            <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Code: {workspaceSummary.code}</span>
              <button onClick={() => copyWorkspaceCode(workspaceSummary.code)}>Copy</button>
              {copyNotice && <span style={{ color: "#8be28b", fontSize: "0.85rem" }}>{copyNotice}</span>}
            </p>
            <p>Role: {workspaceSummary.role}</p>
            <p>
              Tasks: {workspaceSummary.taskCounts.total} (Completed: {workspaceSummary.taskCounts.complete})
            </p>
            <div style={{ marginTop: "10px", maxHeight: "300px", overflowY: "auto", border: "1px solid #4c0039", padding: "8px", borderRadius: "6px" }}>
              {workspaceSummary.members.map((m) => (
                <div key={m.id} style={{ padding: "4px 0", borderBottom: "1px solid #2a0f24" }}>
                  <p style={{ margin: 0 }}>{m.username}</p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#cbd5f5" }}>Role: {m.role}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button onClick={() => setShowInfoModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showArchivedModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "#1f0c1a",
              border: "2px solid rgb(76, 0, 57)",
              borderRadius: "12px",
              padding: "20px",
              width: "520px",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>Archived Tasks</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Search tasks"
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #4c0039",
                  background: "#2a0f24",
                  color: "#fff",
                }}
              />
              <button onClick={() => setArchiveQuery(archiveSearch)}>Search</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", border: "1px solid #4c0039", borderRadius: "6px", padding: "8px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {archivedTasks
                .filter((t) =>
                  t.task_name.toLowerCase().includes(archiveQuery.toLowerCase()) ||
                  t.task_desc?.toLowerCase().includes(archiveQuery.toLowerCase())
                )
                .map((t) => (
                  <div
                    key={t.id}
                    className="task-card dash-bg dash-border dash-shadow archived-card"
                    style={{ padding: "10px", borderRadius: "12px" }}
                  >
                    <p className="task-title" style={{ margin: "0 0 6px 0" }}>{t.task_name}</p>
                    <p className="task-desc" style={{ margin: "0 0 6px 0", color: "#cbd5f5" }}>{t.task_desc}</p>
                    <p className="task-meta" style={{ margin: 0, color: "#9ae6b4" }}>
                      Completed by: {t.completed_by_username || "N/A"}
                    </p>
                    <p className="task-meta" style={{ margin: 0, color: "#cbd5f5" }}>
                      Assigned to: {t.assigned_to_username || "N/A"}
                    </p>
                  </div>
                ))}
              {archivedTasks.filter((t) => t.task_name.toLowerCase().includes(archiveQuery.toLowerCase()) || t.task_desc?.toLowerCase().includes(archiveQuery.toLowerCase())).length === 0 && (
                <p style={{ margin: 0, color: "#cbd5f5" }}>No archived tasks found.</p>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowArchivedModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-header">
        <div className="burger-menu" onClick={() => setNavOpen(true)}>
          <img src={burgerMenuIcon} alt="Open menu icon" />
        </div>

        <h2 style={{ fontSize: "2rem" }}>{workspaces.find((w) => w.id === selectedWorkspaceId)?.name || "Select a workspace"}</h2>

        <div className="widgets">
          <div className="level-widget dash-bg dash-border dash-shadow">
            <div className="current-level">
              <p>Level: {level}</p>
              <p>Total XP: {totalXp}</p>
            </div>
            <p>Completed Tasks: {user?.numTasksCompleted ?? 0}</p>
            <p>XP To Next: {Math.max(0, xpRequiredForLevel(level) - totalXp)}</p>
            <div style={{ width: "100%", background: "#2a0f24", height: "10px", borderRadius: "6px", overflow: "hidden", marginTop: "6px", border: "1px solid #4c0039" }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round((totalXp / xpRequiredForLevel(level)) * 100))}%`,
                  background: "linear-gradient(90deg, #4caf50, #7cd957)",
                  height: "100%",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
          <div className="profile-widget dash-bg dash-border dash-shadow">
            <div className="user-info">
              <p>{username}</p>
            </div>
            <div className="profile-pic" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
              <img src={avatarDefault} alt="user profile picture" />
            </div>
          </div>
        </div>
      </div>

      <div className="dash-main">
        <div className="dash-buttons dash-border dash-shadow" style={{ padding: "1rem" }}>
          <div className="team-buttons-alignment" style={{ marginBottom: "20px" }}>
            <TeamIconButton teamName={"Create Workspace"} icon="+" onClickHandler={createWorkspace} />
          </div>
          <div className="team-buttons-alignment" style={{ marginBottom: "20px" }}>
            <TeamIconButton teamName={"Join Workspace"} icon=">" onClickHandler={() => setShowJoinModal(true)} />
          </div>
          <div className="team-buttons-alignment" style={{ marginBottom: "20px" }}>
            <TeamIconButton
              teamName={workspaces.find((w) => w.id === selectedWorkspaceId)?.name || "Select Workspace"}
              icon="W"
              onClickHandler={() => setShowWorkspacePicker(true)}
            />
          </div>
          {selectedWorkspaceId && (
            <div className="team-buttons-alignment" style={{ marginBottom: "20px" }}>
              <TeamIconButton teamName={"Workspace Info"} icon="i" onClickHandler={loadWorkspaceSummary} />
            </div>
          )}
          <div className="team-buttons-alignment" style={{ marginBottom: "20px" }}>
            <TeamIconButton teamName={"Archived Tasks"} icon="A" onClickHandler={loadArchived} />
          </div>
        </div>

        <div className="task-view-container dash-border dash-shadow">
          <CreateTaskList title="Tasks" list={taskList} showCreateBtn={!!canManageTasks} />
          <CreateTaskList title="In-progress" list={inprogressList} />
          <CreateTaskList title="Complete" list={completeList} />
        </div>
      </div>

      {showTaskModal && (
        <TaskCreateModal
          onClose={() => setShowTaskModal(false)}
          onCreate={async (name, desc, difficulty) => {
            if (!API_BASE || !selectedTeamId) return;
            try {
              const res = await fetch(`${API_BASE}/tasks`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  team_id: selectedTeamId,
                  task_name: name,
                  task_desc: desc,
                  difficulty,
                }),
              });
              if (!res.ok) throw new Error("Failed to create task");
              const created = await res.json();
              const updated = [...tasks, created];
              setTasks(updated);
              partitionTasks(updated);
              setShowTaskModal(false);
            } catch (err) {
              console.error(err);
              alert("Failed to create task");
            }
          }}
        />
      )}

      {showWorkspacePicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
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
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0" }}>Select Workspace</h3>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  border: "1px solid #4c0039",
                  background: ws.id === selectedWorkspaceId ? "#2a0f24" : "#1f0c1a",
                  color: "#fff",
                }}
                onClick={() => {
                  setSelectedWorkspaceId(ws.id);
                  setShowWorkspacePicker(false);
                }}
              >
                {ws.name || ws.code}
              </button>
            ))}
            {workspaces.length === 0 && <p>No workspaces found.</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button onClick={() => setShowWorkspacePicker(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {levelUpNotice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1f0c1a, #3b0f2a)",
              border: "3px solid #ffcc66",
              borderRadius: "16px",
              padding: "24px 32px",
              color: "#fff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", letterSpacing: "1px" }}>
              LEVEL UP!
            </h2>
            <p style={{ margin: 0, fontSize: "18px" }}>You reached level {levelUpNotice}</p>
          </div>
        </div>
      )}

      {navOpen && (
        <>
          <div className="nav-overlay" onClick={() => setNavOpen(false)} />
          <div className="nav-drawer">
            <Link to="/dashboard" onClick={() => setNavOpen(false)}>Dashboard</Link>
            <Link to="/profile" onClick={() => setNavOpen(false)}>Profile</Link>
            <Link to="/admin" onClick={() => setNavOpen(false)}>Admin</Link>
            <button
              style={{ marginTop: "auto", padding: "10px 12px", borderRadius: "10px", border: "1px solid #4c0039", background: "#2a0f24", color: "#fff" }}
              onClick={() => {
                setNavOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}

      <ChatWidget />
    </div>
  );
}
