import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ NEW
import API from "../api";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import TaskControls from "../components/TaskControls";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  // filter/sort UI state
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // applied filter state (prevents refetch on every keystroke)
  const [applied, setApplied] = useState({
    status: "all",
    q: "",
    sortBy: "createdAt",
    order: "desc",
  });

  // ---------------------------
  // Fetch tasks from backend
  // ---------------------------
  const fetchTasks = async (params = applied) => {
    setError("");
    try {
      const query = new URLSearchParams();

      if (params.status && params.status !== "all") {
        query.set("status", params.status);
      }
      if (params.q && params.q.trim()) {
        query.set("q", params.q.trim());
      }
      if (params.sortBy) query.set("sortBy", params.sortBy);
      if (params.order) query.set("order", params.order);

      const url = `/tasks${query.toString() ? `?${query.toString()}` : ""}`;

      const { data } = await API.get(url);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    }
  };

  // initial + applied-filter fetch
  useEffect(() => {
    fetchTasks(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied]);

  // ---------------------------
  // Filter control handlers
  // ---------------------------
  const onApply = () => {
    setApplied({ status, q, sortBy, order });
  };

  const onReset = () => {
    setStatus("all");
    setQ("");
    setSortBy("createdAt");
    setOrder("desc");
    setApplied({
      status: "all",
      q: "",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  // ---------------------------
  // Update task in local state after edit
  // ---------------------------
  const handleUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>Task Manager</h1>

        {/* ✅ Header actions */}
        <div style={styles.headerActions}>
          <Link to="/change-password" style={styles.secondaryBtn}>
            Change Password
          </Link>

          <button onClick={onLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Create Task */}
      <TaskForm onCreated={() => fetchTasks(applied)} />

      {/* Filter + Sort Controls */}
      <TaskControls
        status={status}
        setStatus={setStatus}
        q={q}
        setQ={setQ}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        onApply={onApply}
        onReset={onReset}
      />

      {/* Task List */}
      <div style={styles.listCard}>
        <h2>Your Tasks</h2>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        {tasks.length === 0 ? (
          <p>No tasks match your filters.</p>
        ) : (
          <div style={styles.list}>
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onUpdated={handleUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------
// Styles
// ---------------------------
const styles = {
  page: {
    padding: 20,
    display: "grid",
    gap: 16,
    maxWidth: 900,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  secondaryBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    cursor: "pointer",
  },
  listCard: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
  },
  list: {
    display: "grid",
    gap: 10,
  },
};
