import { useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

export default function RecoverEmail() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter the name used on your account.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/recover-email", {
        name: name.trim(),
      });
      setMessage(data?.message || "No matching account found.");
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card section" style={{ maxWidth: 460, margin: "60px auto 0" }}>
        <div className="brand" style={{ marginBottom: 8 }}>
          <h2>Recover Email</h2>
          <p>Enter your account name to recover the email address (dev feature).</p>
        </div>

        {error && <div className="alert">{error}</div>}
        {message && (
          <div className="card section" style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              {message}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 10 }}>
          <label className="label">
            Account name
            <input
              className="input"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Recover email"}
          </button>

          <div className="row" style={{ justifyContent: "space-between", fontSize: 14 }}>
            <Link to="/login">Back to login</Link>
            <Link to="/forgot-password">Forgot password</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
