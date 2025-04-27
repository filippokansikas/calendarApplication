
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

// -------------------- Booking Page Script --------------------

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

// Show current day's appointments with delete buttons
if (dayAppointments.length === 0) {
    appointmentsEl.innerHTML = "<li>No appointments booked yet.</li>";
} else {
    dayAppointments
        .sort((a, b) => timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time))
        .forEach((appt, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${appt.time} – ${appt.note} 
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            appointmentsEl.appendChild(li);
        });

    // Handle delete
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            if (confirm("Are you sure you want to delete this appointment?")) {
                dayAppointments.splice(index, 1);
                if (dayAppointments.length === 0) {
                    delete appointments[date];
                }
                localStorage.setItem("appointments", JSON.stringify(appointments));
                window.location.reload();
            }
        });
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
            window.location.reload();
        }
    });

    container.appendChild(btn);
});
document.getElementById("download-appointments").addEventListener("click", () => {
    const appointments = JSON.parse(localStorage.getItem("appointments") || "{}");

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appointments, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "appointments.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});


