function scorePassword(pw = "") {
  let score = 0;
  if (!pw) return 0;

  // length
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;

  // variety
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  // cap 0..5
  return Math.min(score, 5);
}

function labelFromScore(score) {
  if (score <= 1) return { text: "Weak", className: "danger" };
  if (score === 2) return { text: "Fair", className: "warn" };
  if (score === 3) return { text: "Good", className: "warn" };
  return { text: "Strong", className: "ok" };
}

export default function PasswordStrength({ password }) {
  const score = scorePassword(password);
  const pct = (score / 5) * 100;
  const lbl = labelFromScore(score);

  return (
    <div className="pwMeter">
      <div className="pwMeta">
        <span className={`badge ${lbl.className}`}>Password: {lbl.text}</span>
        <span className="pwHint">Use 10+ chars, mixed case, number & symbol.</span>
      </div>

      <div className="pwBar">
        <div className="pwFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
