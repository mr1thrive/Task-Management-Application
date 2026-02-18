import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const fieldErrors = useMemo(() => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    return errs;
  }, [form]);

  const canSubmit = Object.keys(fieldErrors).length === 0 && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setTouched({ email: true, password: true });
    if (Object.keys(fieldErrors).length > 0) return;

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue.">
      {error && <div className="alert">{error}</div>}

      <form onSubmit={onSubmit} className="grid">
        <label className="label">
          Email
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            onBlur={onBlur}
            autoComplete="email"
          />
          {touched.email && fieldErrors.email && (
            <div className="fieldError">{fieldErrors.email}</div>
          )}
        </label>

        <div className="label">
          Password
          <div className="inputRow">
            <input
              className="input"
              name="password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="btnGhost"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {touched.password && fieldErrors.password && (
            <div className="fieldError">{fieldErrors.password}</div>
          )}
        </div>

        <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="grid" style={{ gap: 6, fontSize: 14 }}>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/recover-email">Recover account email</Link>
          <Link to="/register">Create account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
