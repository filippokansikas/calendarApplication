// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = 'appointments.json';

app.use(cors());
app.use(bodyParser.json());

// Load existing data or initialize
function loadAppointments() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveAppointments(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all appointments
app.get('/appointments', (req, res) => {
  const data = loadAppointments();
  res.json(data);
});

// POST new appointment
app.post('/appointments', (req, res) => {
  const { date, title, details } = req.body;
  if (!date || !title) {
    return res.status(400).json({ error: 'Date and title are required.' });
  }

  const data = loadAppointments();
  if (!data[date]) data[date] = [];
  data[date].push({ title, details });
  saveAppointments(data);
  res.status(201).json({ message: 'Appointment added.' });
});

// DELETE appointment by date and index
app.delete('/appointments', (req, res) => {
  const { date, index } = req.body;
  const data = loadAppointments();
  if (!data[date] || !data[date][index]) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  data[date].splice(index, 1);
  if (data[date].length === 0) delete data[date];
  saveAppointments(data);
  res.json({ message: 'Appointment deleted.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
