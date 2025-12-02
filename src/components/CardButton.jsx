import { useEffect, useState } from "react";

export default function CardButton({ taskId, initialStatus, onStatusChange, userRole }) {
  const [status, setStatus] = useState(initialStatus || "open");

  useEffect(() => {
    setStatus(initialStatus || "open");
  }, [initialStatus]);

  const buttonStyle = {
    assign: {
      backgroundColor: "rgb(56, 14, 134)",
    },
    complete: {
      backgroundColor: "rgb(14, 134, 94)",
    },
    archive: {
      backgroundColor: "#444",
    },
  };

  const nextStatus = status === "open" ? "inprogress" : "complete";

  const handleClick = () => {
    const next = nextStatus;
    setStatus(next);
    if (onStatusChange) onStatusChange(taskId, next);
  };

  const handleArchive = () => {
    setStatus("archived");
    if (onStatusChange) onStatusChange(taskId, "archived");
  };

  if (status === "archived") return null;

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {status !== "complete" ? (
        <button
          className="btn"
          style={status === "open" ? buttonStyle.assign : buttonStyle.complete}
          onClick={handleClick}
        >
          {status === "open" ? "Assign" : "Complete"}
        </button>
      ) : (
        <button className="btn" style={buttonStyle.archive} onClick={handleArchive}>
          Archive
        </button>
      )}
    </div>
  );
}
