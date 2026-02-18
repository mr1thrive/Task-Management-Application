import { useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setMessage(data?.message || "If account exists, reset instructions generated.");
      setEmail("");
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
          <h2>Forgot Password</h2>
          <p>Enter your email to generate a reset token (dev mode prints it in the backend console).</p>
        </div>

        {error && <div className="alert">{error}</div>}
        {message && (
          <div
            className="card section"
            style={{
              borderColor: "rgba(45, 212, 191, 0.35)",
              background: "rgba(45, 212, 191, 0.10)",
            }}
          >
            <div style={{ color: "rgba(152, 251, 229, 0.95)", fontSize: 13 }}>
              {message}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 10 }}>
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link/token"}
          </button>

          <div className="row" style={{ justifyContent: "space-between", fontSize: 14 }}>
            <Link to="/login">Back to login</Link>
            <Link to="/recover-email">Recover email</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
