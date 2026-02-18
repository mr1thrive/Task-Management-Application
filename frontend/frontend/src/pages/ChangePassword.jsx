import { useMemo, useState } from "react";
import axios from "axios";

/**
 * ChangePassword Page
 * - Requires current password
 * - New password + confirm
 * - Strength meter + inline validation
 * - Show/Hide toggle for each password field
 * - Calls PUT /api/auth/change-password
 */
export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [serverError, setServerError] = useState("");

  // --- Password strength + validation rules (edit to match your policy)
  const rules = useMemo(() => {
    const minLen = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const notSameAsCurrent =
      currentPassword.length > 0 && newPassword.length > 0
        ? currentPassword !== newPassword
        : true;

    return {
      minLen,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      notSameAsCurrent,
    };
  }, [newPassword, currentPassword]);

  const strengthScore = useMemo(() => {
    // Simple scoring (0-5) based on rules
    const { minLen, hasUpper, hasLower, hasNumber, hasSpecial } = rules;
    return [minLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean)
      .length;
  }, [rules]);

  const strengthLabel = useMemo(() => {
    if (newPassword.length === 0) return "—";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore === 3) return "Medium";
    if (strengthScore >= 4) return "Strong";
    return "—";
  }, [strengthScore, newPassword.length]);

  const clientErrors = useMemo(() => {
    const errs = {};
    if (!currentPassword) errs.currentPassword = "Current password is required.";

    if (!newPassword) {
      errs.newPassword = "New password is required.";
    } else {
      const failed = [];
      if (!rules.minLen) failed.push("at least 8 characters");
      if (!rules.hasUpper) failed.push("one uppercase letter");
      if (!rules.hasLower) failed.push("one lowercase letter");
      if (!rules.hasNumber) failed.push("one number");
      if (!rules.hasSpecial) failed.push("one special character");
      if (!rules.notSameAsCurrent) failed.push("different from current password");

      if (failed.length) {
        errs.newPassword = `New password must contain ${failed.join(", ")}.`;
      }
    }

    if (!confirmNewPassword) {
      errs.confirmNewPassword = "Please confirm your new password.";
    } else if (newPassword && confirmNewPassword !== newPassword) {
      errs.confirmNewPassword = "Passwords do not match.";
    }

    return errs;
  }, [currentPassword, newPassword, confirmNewPassword, rules]);

  const canSubmit =
    Object.keys(clientErrors).length === 0 && !loading && !successMsg;

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    // final guard on client
    if (Object.keys(clientErrors).length > 0) return;

    setLoading(true);
    try {
      // Adjust token retrieval to your app:
      const token = localStorage.getItem("token"); // or sessionStorage / context

      await axios.put(
        "/api/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      setSuccessMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to change password. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Change Password</h1>
        <p style={styles.subtitle}>
          Update your password securely. Make sure it’s strong and unique.
        </p>

        {serverError ? <div style={styles.alertError}>{serverError}</div> : null}
        {successMsg ? (
          <div style={styles.alertSuccess}>{successMsg}</div>
        ) : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Current Password */}
          <label style={styles.label}>
            Current Password
            <div style={styles.inputRow}>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={styles.input}
                autoComplete="current-password"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                style={styles.toggleBtn}
                aria-label="Toggle current password visibility"
              >
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
            {clientErrors.currentPassword ? (
              <span style={styles.error}>{clientErrors.currentPassword}</span>
            ) : null}
          </label>

          {/* New Password */}
          <label style={styles.label}>
            New Password
            <div style={styles.inputRow}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                style={styles.toggleBtn}
                aria-label="Toggle new password visibility"
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>

            {/* Strength Meter */}
            <div style={styles.meterWrap}>
              <div style={styles.meterBar}>
                <div
                  style={{
                    ...styles.meterFill,
                    width: `${(strengthScore / 5) * 100}%`,
                  }}
                />
              </div>
              <div style={styles.meterText}>
                Strength: <strong>{strengthLabel}</strong>
              </div>
            </div>

            {clientErrors.newPassword ? (
              <span style={styles.error}>{clientErrors.newPassword}</span>
            ) : null}

            {/* Rule checklist */}
            <ul style={styles.ruleList}>
              <Rule ok={rules.minLen} text="At least 8 characters" />
              <Rule ok={rules.hasUpper} text="One uppercase letter" />
              <Rule ok={rules.hasLower} text="One lowercase letter" />
              <Rule ok={rules.hasNumber} text="One number" />
              <Rule ok={rules.hasSpecial} text="One special character" />
              <Rule ok={rules.notSameAsCurrent} text="Different from current" />
            </ul>
          </label>

          {/* Confirm Password */}
          <label style={styles.label}>
            Confirm New Password
            <div style={styles.inputRow}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={styles.toggleBtn}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {clientErrors.confirmNewPassword ? (
              <span style={styles.error}>{clientErrors.confirmNewPassword}</span>
            ) : null}
          </label>

          <button type="submit" disabled={!canSubmit} style={styles.submitBtn}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Rule({ ok, text }) {
  return (
    <li style={{ ...styles.ruleItem, opacity: ok ? 1 : 0.6 }}>
      <span style={{ display: "inline-block", width: 18 }}>
        {ok ? "✅" : "⬜"}
      </span>
      {text}
    </li>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 24,
    color: "#fff",
    backdropFilter: "blur(10px)",
  },
  title: { margin: 0, fontSize: 28, fontWeight: 800 },
  subtitle: { marginTop: 8, marginBottom: 16, opacity: 0.85, lineHeight: 1.4 },
  form: { display: "grid", gap: 14 },
  label: { display: "grid", gap: 8, fontSize: 14, fontWeight: 600 },
  inputRow: { display: "flex", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.2)",
    color: "#fff",
    outline: "none",
  },
  toggleBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  meterWrap: { display: "grid", gap: 6, marginTop: 6 },
  meterBar: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 999,
    background: "rgba(34,197,94,0.9)",
    transition: "width 180ms ease",
  },
  meterText: { fontSize: 12, opacity: 0.9 },
  ruleList: {
    listStyle: "none",
    padding: 0,
    margin: "6px 0 0 0",
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  ruleItem: { display: "flex", gap: 8, alignItems: "center" },
  error: { color: "#fecaca", fontSize: 12, fontWeight: 600 },
  alertError: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.35)",
    marginBottom: 12,
  },
  alertSuccess: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(34,197,94,0.15)",
    border: "1px solid rgba(34,197,94,0.35)",
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    opacity: 1,
  },
};
