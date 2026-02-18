import { useState } from "react";
import API from "../api";

export default function TaskForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    status: "pending",
    deadline: "",
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        status: form.status,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      };

      const { data } = await API.post("/tasks", payload);

      setForm({ title: "", status: "pending", deadline: "" });
      onCreated?.(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "grid",
        gap: 10,
        maxWidth: 700,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 10,
      }}
    >
      <h2 style={{ margin: 0 }}>Create Task</h2>

      {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

      <input
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={onChange}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <select name="status" value={form.status} onChange={onChange}>
          <option value="pending">pending</option>
          <option value="in-progress">in-progress</option>
          <option value="completed">completed</option>
        </select>

        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={onChange}
        />
      </div>

      <button type="submit">Add Task</button>
    </form>
  );
}
