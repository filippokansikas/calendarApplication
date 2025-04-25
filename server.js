// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory appointment store
let appointments = {};

// Get appointments for a date
app.get("/appointments/:date", (req, res) => {
    const date = req.params.date;
    res.json(appointments[date] || []);
});

// Add new appointment
app.post("/appointments/:date", (req, res) => {
    const date = req.params.date;
    const { time, note } = req.body;

    if (!appointments[date]) appointments[date] = [];
    appointments[date].push({ time, note });

    res.status(201).json({ success: true });
});

// Delete an appointment
app.delete("/appointments/:date", (req, res) => {
    const date = req.params.date;
    const { time } = req.body;

    if (!appointments[date]) return res.status(404).json({ error: "No appointments for that date" });

    appointments[date] = appointments[date].filter(appt => appt.time !== time);

    if (appointments[date].length === 0) delete appointments[date];

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
