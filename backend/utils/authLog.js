const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
const logFile = path.join(logDir, "auth-events.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function logAuthEvent(data) {
  const entry = {
    time: new Date().toISOString(),
    ...data,
  };

  try {
    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
  } catch (e) {
    console.error("Auth log write failed:", e.message);
  }
}

module.exports = logAuthEvent;
