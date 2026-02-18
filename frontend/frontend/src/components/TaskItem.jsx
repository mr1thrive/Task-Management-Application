import { useState } from "react";
import API from "../api";

export default function TaskItem({ task, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    status: task.status,
    deadline: task.deadline?.slice(0, 10) || "",
  });

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    const { data } = await API.put(`/tasks/${task._id}`, form);
    setEditing(false);
    onUpdated(data);
  };

  if (editing) {
    return (
      <div style={styles.card}>
        <input name="title" value={form.title} onChange={onChange} />

        <select name="status" value={form.status} onChange={onChange}>
          <option value="pending">pending</option>
          <option value="in-progress">in-progress</option>
          <option value="completed">completed</option>
        </select>

        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={onChange}
        />

        <button onClick={save}>Save</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3>{task.title}</h3>
      <p>Status: {task.status}</p>
      <p>
        Deadline:{" "}
        {task.deadline
          ? new Date(task.deadline).toLocaleDateString()
          : "—"}
      </p>

      <button onClick={() => setEditing(true)}>Edit</button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: 12,
    borderRadius: 10,
  },
};
