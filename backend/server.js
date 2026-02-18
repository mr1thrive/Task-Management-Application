const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
console.log("RUNNING SERVER FILE:", __filename);

// -----------------------------
// Trust proxy (Render / reverse proxy)
// -----------------------------
app.set("trust proxy", 1);

// -----------------------------
// CORS (production-safe)
// -----------------------------
const allowedOrigins = [
  "http://localhost:5173",                 // Vite dev
  "http://localhost:3000",                 // optional
  process.env.FRONTEND_URL,                // e.g. https://your-frontend.onrender.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (curl/postman) with no origin
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -----------------------------
// Body parsing
// -----------------------------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Health check (Render-friendly)
// -----------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// -----------------------------
// Routes
// -----------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// -----------------------------
// 404 handler
// -----------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -----------------------------
// Central error handler
// -----------------------------
app.use((err, req, res, next) => {
  // CORS errors or other thrown errors land here
  console.error("Server error:", err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// -----------------------------
// Start server AFTER DB connects
// -----------------------------
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down...`);
      server.close(() => process.exit(0));
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
})();
