const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Initialize Express
const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, "appointments.json");

// Enhanced logging
console.log(`\n📅 Appointment Server Initializing...`);
console.log(`💾 Data file: ${DATA_FILE}`);

// ======================
// DATA STORAGE FUNCTIONS
// ======================

// Load data from JSON file (or create new)
function loadAppointments() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE);
      const data = JSON.parse(rawData);
      console.log(`🔃 Loaded ${Object.keys(data).length} appointment dates`);
      return data;
    } else {
      fs.writeFileSync(DATA_FILE, "{}");
      console.log("🆕 Created new appointments file");
      return {};
    }
  } catch (err) {
    console.error("❌ Failed to load data:", err.message);
    return {};
  }
}

// Save data to JSON file (with retries)
function saveAppointments(data) {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log(`💾 Saved ${Object.keys(data).length} appointment dates`);
      return true;
    } catch (err) {
      attempts++;
      console.error(`⚠️ Save attempt ${attempts} failed:`, err.message);
      if (attempts >= maxRetries) return false;
      new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
    }
  }
}

// Initialize data store
let appointments = loadAppointments();

// =================
// MIDDLEWARE SETUP
// =================
app.use(cors());
app.use(express.json());

// ================
// API ENDPOINTS
// ================

// GET all appointments for a date
app.get("/appointments/:date", (req, res) => {
  const { date } = req.params;
  console.log(`📋 GET request for ${date}`);
  
  if (!appointments[date]) {
    return res.json([]); // Return empty array if no appointments
  }
  
  res.json(appointments[date]);
});

// CREATE new appointment
app.post("/appointments/:date", (req, res) => {
  const { date } = req.params;
  const { time, note } = req.body;
  
  console.log(`➕ POST request for ${date} at ${time}`);

  // Validation
  if (!time || !note) {
    return res.status(400).json({ error: "Both time and note are required" });
  }

  // Initialize date array if needed
  if (!appointments[date]) {
    appointments[date] = [];
  }

  // Check for duplicate time
  if (appointments[date].some(a => a.time === time)) {
    return res.status(409).json({ error: "Time slot already booked" });
  }

  // Add appointment
  appointments[date].push({ time, note });
  
  // Save to file
  if (!saveAppointments(appointments)) {
    return res.status(500).json({ error: "Failed to save appointment" });
  }

  res.status(201).json({ success: true, date, time, note });
});

// DELETE appointment
app.delete("/appointments/:date", (req, res) => {
  const { date } = req.params;
  const { time } = req.body;
  
  console.log(`🗑️ DELETE request for ${date} at ${time}`);

  // Validation
  if (!time) {
    return res.status(400).json({ error: "Time is required" });
  }

  if (!appointments[date]) {
    return res.status(404).json({ error: "Date not found" });
  }

  // Filter out the appointment
  const initialLength = appointments[date].length;
  appointments[date] = appointments[date].filter(a => a.time !== time);

  if (appointments[date].length === initialLength) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  // Clean up empty dates
  if (appointments[date].length === 0) {
    delete appointments[date];
  }

  // Save to file
  if (!saveAppointments(appointments)) {
    return res.status(500).json({ error: "Failed to save changes" });
  }

  res.json({ success: true, date, time });
});

// ===================
// SERVER MAINTENANCE
// ===================

// Handle server shutdown gracefully
process.on("SIGINT", () => {
  console.log("\n🛑 Server shutting down...");
  saveAppointments(appointments);
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log(`GET    /appointments/:date`);
  console.log(`POST   /appointments/:date - Body: { time, note }`);
  console.log(`DELETE /appointments/:date - Body: { time }`);
  console.log("\nUse Ctrl+C to stop the server\n");
});