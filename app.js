document.addEventListener("DOMContentLoaded", () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();

    const day = document.querySelector(".calendar-dates");
    const currdate = document.querySelector(".calendar-current-date");
    const prenexIcons = document.querySelectorAll(".calendar-navigation");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let appointments = JSON.parse(localStorage.getItem("appointments") || "{}");

    const renderCalendar = () => {
        const dayone = new Date(year, month, 1).getDay();
        const lastdate = new Date(year, month + 1, 0).getDate();
        const dayend = new Date(year, month, lastdate).getDay();
        const monthlastdate = new Date(year, month, 0).getDate();

        let html = "";

        for (let i = dayone; i > 0; i--) {
            html += `<li class="inactive">${monthlastdate - i + 1}</li>`;
        }

        for (let i = 1; i <= lastdate; i++) {
            const today = new Date();
            const isToday =
                i === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
                    ? "active"
                    : "";

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
            const hasAppointment = appointments[dateKey] ? "appointment" : "";

            html += `<li class="${isToday} ${hasAppointment}" data-date="${dateKey}">${i}</li>`;
        }

        for (let i = dayend; i < 6; i++) {
            html += `<li class="inactive">${i - dayend + 1}</li>`;
        }

        currdate.innerText = `${months[month]} ${year}`;
        day.innerHTML = html;

        addClickHandlers();
    };

    const addClickHandlers = () => {
        document.querySelectorAll(".calendar-dates li:not(.inactive)").forEach(li => {
            li.addEventListener("click", () => {
                const selectedDate = li.getAttribute("data-date");
                window.location.href = `book.html?date=${selectedDate}`;
            });
        });
    };

    prenexIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            month = icon.id === "calendar-prev" ? month - 1 : month + 1;
            if (month < 0 || month > 11) {
                date = new Date(year, month, 1);
                year = date.getFullYear();
                month = date.getMonth();
            }
            renderCalendar();
        });
    });

    renderCalendar();
});
const queryParams = new URLSearchParams(window.location.search);
const date = queryParams.get("date");
document.getElementById("selected-date").innerText = "Booking for: " + date;

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM"
];

const container = document.getElementById("time-container");
const appointmentsEl = document.getElementById("appointments");

const appointments = JSON.parse(localStorage.getItem("appointments") || "{}");
const dayAppointments = appointments[date] || [];

const isBooked = (time) => dayAppointments.some(appt => appt.time === time);
const getNote = (time) => {
  const appt = dayAppointments.find(appt => appt.time === time);
  return appt ? appt.note : "";
};

// Show current day's appointments
if (dayAppointments.length === 0) {
  appointmentsEl.innerHTML = "<li>No appointments booked yet.</li>";
} else {
  dayAppointments
    .sort((a, b) => timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time))
    .forEach(appt => {
      const li = document.createElement("li");
      li.textContent = `${appt.time} – ${appt.note}`;
      appointmentsEl.appendChild(li);
    });
}

// Create time slot buttons
timeSlots.forEach(time => {
  const btn = document.createElement("button");
  btn.textContent = isBooked(time)
    ? `${time} - Booked`
    : time;
  btn.disabled = isBooked(time);
  btn.className = isBooked(time) ? "booked" : "";

  btn.addEventListener("click", () => {
    const note = prompt(`Add a note for ${time} on ${date}:`);
    if (note !== null) {
      const newAppt = { time, note };
      if (!appointments[date]) appointments[date] = [];
      appointments[date].push(newAppt);
      localStorage.setItem("appointments", JSON.stringify(appointments));
      alert(`Appointment booked!\n\nDate: ${date}\nTime: ${time}\nNote: ${note}`);
      window.location.reload(); // Reload to show updated list
    }
  });

  container.appendChild(btn);
});