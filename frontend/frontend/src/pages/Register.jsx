import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import AuthLayout from "../components/AuthLayout";
import PasswordStrength from "../components/PasswordStrength";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const fieldErrors = useMemo(() => {
    const errs = {};

    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address.";

    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters.";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";

    return errs;
  }, [form]);

  const canSubmit = Object.keys(fieldErrors).length === 0 && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // mark all touched so inline errors show
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(fieldErrors).length > 0) return;

    try {
      setLoading(true);

      const { data } = await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to manage your tasks.">
      {error && <div className="alert">{error}</div>}

      <form onSubmit={onSubmit} className="grid">
        <label className="label">
          Name
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={onChange}
            onBlur={onBlur}
            autoComplete="name"
          />
          {touched.name && fieldErrors.name && (
            <div className="fieldError">{fieldErrors.name}</div>
          )}
        </label>

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
              autoComplete="new-password"
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
          <PasswordStrength password={form.password} />
        </div>

        <div className="label">
          Confirm Password
          <div className="inputRow">
            <input
              className="input"
              name="confirmPassword"
              type={showConfirmPw ? "text" : "password"}
              value={form.confirmPassword}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btnGhost"
              onClick={() => setShowConfirmPw((s) => !s)}
            >
              {showConfirmPw ? "Hide" : "Show"}
            </button>
          </div>
          {touched.confirmPassword && fieldErrors.confirmPassword && (
            <div className="fieldError">{fieldErrors.confirmPassword}</div>
          )}
        </div>

        <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div style={{ fontSize: 14 }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
