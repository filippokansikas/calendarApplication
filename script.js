const calendar = document.getElementById('calendar');
const form = document.getElementById('add-appointment-form');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const titleInput = document.getElementById('title');
const detailsInput = document.getElementById('details');
const monthYearLabel = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const fileInput = document.getElementById('file-input');

let appointments = JSON.parse(localStorage.getItem('appointments')) || {};
let currentDate = new Date();

function createCalendar() {
  calendar.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  monthYearLabel.textContent = `${monthNames[month]} ${year}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.dataset.date = dateStr;

    const dateLabel = document.createElement('div');
    dateLabel.className = 'date';
    dateLabel.textContent = day;
    dayDiv.appendChild(dateLabel);

    if (appointments[dateStr]) {
      const appointmentsDiv = document.createElement('div');
      appointmentsDiv.className = 'appointments';
      const sortedTimes = Object.keys(appointments[dateStr]).sort();
      appointmentsDiv.innerHTML = sortedTimes
        .map(time => `<div>• ${time} - ${appointments[dateStr][time].title}</div>`)
        .join('');
      dayDiv.appendChild(appointmentsDiv);
    }

    dayDiv.addEventListener('click', () => {
      showAppointments(dateStr);
    });

    calendar.appendChild(dayDiv);
  }
}

function showAppointments(dateStr) {
  if (!appointments[dateStr]) {
    alert(`No appointments on ${dateStr}.`);
    return;
  }

  const dayAppointments = appointments[dateStr];
  let text = `Appointments on ${dateStr}:\n\n`;
  const times = Object.keys(dayAppointments).sort();

  times.forEach((time, idx) => {
    const app = dayAppointments[time];
    text += `${idx + 1}. [${time}] ${app.title} - ${app.details}\n`;
  });

  text += "\nEnter number to delete an appointment, or Cancel.";
  const response = prompt(text);
  if (response) {
    const idx = parseInt(response) - 1;
    if (!isNaN(idx) && times[idx]) {
      delete dayAppointments[times[idx]];
      if (Object.keys(dayAppointments).length === 0) {
        delete appointments[dateStr];
      }
      createCalendar();
      alert('Appointment deleted. Remember to save!');
    }
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const date = dateInput.value;
  const time = timeInput.value;
  const title = titleInput.value;
  const details = detailsInput.value;

  if (!appointments[date]) {
    appointments[date] = {};
  }

  if (appointments[date][time]) {
    if (!confirm('Already booked at this time. Overwrite?')) {
      return;
    }
  }

  appointments[date][time] = { title, details };
  createCalendar();
  form.reset();
});

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  createCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  createCalendar();
});

saveBtn.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appointments, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "appointments.json");
  downloadAnchor.click();
});

loadBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      appointments = JSON.parse(event.target.result);
      createCalendar();
      alert('Appointments loaded!');
    } catch (err) {
      alert('Error loading file.');
    }
  };
  reader.readAsText(file);
});

function saveAppointments() {
  localStorage.setItem('appointments', JSON.stringify(appointments));
}

createCalendar();
