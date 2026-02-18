const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();


// -----------------------------
// CORS — must come BEFORE routes
// -----------------------------
app.use(cors({
  origin: [
    "http://localhost:5173",              // Vite dev
    "http://localhost:3000",              // CRA dev (if used)
    "https://your-frontend.onrender.com"  // ← change after frontend deploy
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// -----------------------------
// Body parser
// -----------------------------
app.use(express.json());


// -----------------------------
// Health check (useful for Render)
// -----------------------------
app.get("/", (req, res) => {
  res.send("API running");
});


// -----------------------------
// Routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


// -----------------------------
// MongoDB connect
// -----------------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });


// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
