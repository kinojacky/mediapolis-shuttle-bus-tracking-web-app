// Sample JSON route configuration (in real-world usage, this would be loaded from an external source)
const routeConfig = {
  morning: {
    name: "Morning Route",
    operatingHours: "07:30-10:00",
    stops: ["Buona Vista MRT", "one-north MRT", "Campus"],
    busFrequency: 20,
    buses: 1,
    schedule: [
      { id: 1, times: ["07:30", "07:35", "07:40"] },
      { id: 2, times: ["07:50", "07:55", "08:00"] },
      { id: 3, times: ["08:10", "08:15", "08:20"] },
      { id: 4, times: ["08:30", "08:35", "08:40"] },
      { id: 5, times: ["08:50", "08:55", "09:00"] },
      { id: 6, times: ["09:10", "09:15", "09:20"] },
      { id: 7, times: ["09:30", "09:35", "09:40"] },
      { id: 8, times: ["09:50", "09:55", "10:00"] },
    ],
    lastBus: "09:55",
    description: "Buona Vista MRT → one-north MRT → Campus",
  },
  lunchMWF: {
    name: "Lunch Route (Mon/Wed/Fri)",
    operatingHours: "11:30-14:00",
    stops: ["Campus", "Holland Drive Food Centre", "Ghim Moh Food Centre"],
    busFrequency: 30,
    buses: 1,
    schedule: [
      { id: 1, times: ["11:30", "11:40", "11:45"] },
      { id: 2, times: ["12:00", "12:10", "12:15"] },
      { id: 3, times: ["12:30", "12:40", "12:45"] },
      { id: 4, times: ["13:00", "13:10", "13:15"] },
      { id: 5, times: ["13:30", "13:40", "13:45"] },
    ],
    lastBus: "13:45",
    description: "Campus → Holland Drive Food Centre → Ghim Moh Food Centre",
  },
  lunchTT: {
    name: "Lunch Route (Tue/Thu)",
    operatingHours: "11:30-14:00",
    stops: ["Campus", "one-north MRT", "The Star Vista"],
    busFrequency: 20,
    buses: 1,
    schedule: [
      { id: 1, times: ["11:30", "11:35", "11:40"] },
      { id: 2, times: ["11:50", "11:55", "12:00"] },
      { id: 3, times: ["12:10", "12:15", "12:20"] },
      { id: 4, times: ["12:30", "12:35", "12:40"] },
      { id: 5, times: ["12:50", "12:55", "13:00"] },
      { id: 6, times: ["13:10", "13:15", "13:20"] },
      { id: 7, times: ["13:30", "13:35", "13:40"] },
      { id: 8, times: ["13:50", "13:55", "14:00"] },
    ],
    lastBus: "14:00",
    description: "Campus → one-north MRT → The Star Vista",
  },
  evening: {
    name: "Evening Route",
    operatingHours: "17:00-19:30",
    stops: ["Campus", "one-north MRT", "Buona Vista MRT"],
    busFrequency: 10,
    buses: 2,
    schedule: [
      { id: 1, bus: 1, times: ["17:00", "17:05", "17:10"] },
      { id: 1, bus: 2, times: ["17:10", "17:15", "17:20"] },
      { id: 2, bus: 1, times: ["17:20", "17:25", "17:30"] },
      { id: 2, bus: 2, times: ["17:30", "17:35", "17:40"] },
      { id: 3, bus: 1, times: ["17:40", "17:45", "17:50"] },
      { id: 3, bus: 2, times: ["17:50", "17:55", "18:00"] },
      { id: 4, bus: 1, times: ["18:00", "18:05", "18:10"] },
      { id: 4, bus: 2, times: ["18:10", "18:15", "18:20"] },
      { id: 5, bus: 1, times: ["18:20", "18:25", "18:30"] },
      { id: 5, bus: 2, times: ["18:30", "18:35", "18:40"] },
      { id: 6, bus: 1, times: ["18:40", "18:45", "18:50"] },
      { id: 6, bus: 2, times: ["18:50", "18:55", "19:00"] },
      { id: 7, bus: 1, times: ["19:00", "19:05", "19:10"] },
      { id: 7, bus: 2, times: ["19:10", "19:15", "19:20"] },
      { id: 8, bus: 1, times: ["19:20", "19:25", "19:30"] },
    ],
    lastBus: {
      bus1: "19:20",
      bus2: "19:10",
    },
    description: "Campus → one-north MRT → Buona Vista MRT",
  },
};

// Function to initialize the app
function initApp() {
  updateCurrentDate();
  renderTimeButtons();

  // Select appropriate time period based on current day and time
  const currentPeriod = getCurrentTimePeriod();
  selectTimePeriod(currentPeriod);

  // Update current time info every minute
  setInterval(updateCurrentDate, 60000);
}

// Function to update the current date display
function updateCurrentDate() {
  const now = new Date();
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const dayNames = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];

  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "zh-TW",
    dateOptions
  );
  document.getElementById("currentDayOfWeek").textContent =
    dayNames[now.getDay()];

  // Update current time period info
  const currentPeriod = getCurrentTimePeriod();
  const currentTimeInfo = document.getElementById("currentTimeInfo");
  const currentTimeRoute = document.getElementById("currentTimeRoute");

  if (currentPeriod === "none") {
    currentTimeRoute.textContent = "目前無班車服務";
    currentTimeRoute.className = "badge bg-secondary";
  } else {
    currentTimeRoute.textContent = `目前班次: ${routeConfig[currentPeriod].name}`;
    currentTimeRoute.className = "badge bg-primary";
  }
}

// Function to determine current time period based on day and time
function getCurrentTimePeriod() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes since midnight

  // Weekend - No service
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return "none";
  }

  // Weekday schedule
  if (currentTime >= 7 * 60 && currentTime < 10 * 60) {
    return "morning";
  } else if (currentTime >= 11 * 60 + 30 && currentTime < 14 * 60) {
    // Check for lunch routes based on day of week
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      // Mon, Wed, Fri
      return "lunchMWF";
    } else {
      // Tue, Thu
      return "lunchTT";
    }
  } else if (currentTime >= 17 * 60 && currentTime < 19 * 60 + 30) {
    return "evening";
  }

  // No service time
  return "none";
}

// Function to render time selection buttons
function renderTimeButtons() {
  const timeSelector = document.getElementById("timeSelector");
  timeSelector.innerHTML = "";

  Object.keys(routeConfig).forEach((period) => {
    const timeData = routeConfig[period];
    const button = document.createElement("button");
    button.className = "btn btn-outline-primary";
    button.setAttribute("data-period", period);
    button.textContent = timeData.name;

    button.addEventListener("click", () => {
      // Remove active class from all buttons
      document.querySelectorAll(".time-selector .btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      button.classList.add("active");

      // Display timetable for selected period
      selectTimePeriod(period);
    });

    timeSelector.appendChild(button);
  });

  // Add "No Service" button for completeness
  const noServiceButton = document.createElement("button");
  noServiceButton.className = "btn btn-outline-secondary";
  noServiceButton.setAttribute("data-period", "none");
  noServiceButton.textContent = "非服務時段";

  noServiceButton.addEventListener("click", () => {
    document.querySelectorAll(".time-selector .btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    noServiceButton.classList.add("active");
    showNoServiceMessage();
  });

  timeSelector.appendChild(noServiceButton);
}

// Function to select and display a time period
function selectTimePeriod(period) {
  // Handle no service period
  if (period === "none") {
    showNoServiceMessage();
    return;
  }

  const timeData = routeConfig[period];
  const container = document.getElementById("timetableContainer");

  // Update active button
  document.querySelectorAll(".time-selector .btn").forEach((btn) => {
    if (btn.getAttribute("data-period") === period) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Get current time to highlight relevant bus schedules
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Create HTML content for the selected time period
  let html = `
                <div class="route-info">
                    <h2 class="h4 mb-2">${timeData.name}</h2>
                    <p class="mb-1"><strong>路線描述:</strong> ${
                      timeData.description
                    }</p>
                    <p class="mb-1"><strong>營運時間:</strong> ${
                      timeData.operatingHours
                    }</p>
                    <p class="mb-0"><strong>營運日:</strong> 
                        <span class="operation-days">
                            ${
                              period.includes("lunch")
                                ? period === "lunchMWF"
                                  ? "星期一/三/五"
                                  : "星期二/四"
                                : "星期一至星期五"
                            }
                        </span>
                    </p>
                </div>
            `;

  // Display bus count if more than one
  if (timeData.buses > 1) {
    html += `<p><strong>車輛數量:</strong> ${timeData.buses} 輛</p>`;
    html += `<p><strong>車輛頻率:</strong> 每 ${timeData.busFrequency} 分鐘一班</p>`;
  }

  // Generate timetable
  html += `
                <div class="mb-4">
                    <div class="table-responsive">
                        <table class="table table-bordered timetable">
                            <thead>
                                <tr>
                                    ${
                                      period === "evening"
                                        ? "<th>車次</th><th>車輛</th>"
                                        : "<th>車次</th>"
                                    }
                                    ${timeData.stops
                                      .map((stop) => `<th>${stop}</th>`)
                                      .join("")}
                                </tr>
                            </thead>
                            <tbody>
            `;

  // Get today's day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = now.getDay();

  // Check if today's schedule is applicable for the selected period
  const isApplicableToday =
    period === "morning" || period === "evening"
      ? dayOfWeek >= 1 && dayOfWeek <= 5 // Weekdays only
      : period === "lunchMWF"
      ? dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 // Mon, Wed, Fri
      : dayOfWeek === 2 || dayOfWeek === 4; // Tue, Thu

  // Add schedule rows
  timeData.schedule.forEach((trip) => {
    const isLastTrip =
      trip.id === timeData.schedule[timeData.schedule.length - 1].id;

    // Parse departure time to check if it's past, current, or upcoming
    const departureTime = trip.times[0];
    const [departureHour, departureMinute] = departureTime
      .split(":")
      .map(Number);
    const departureTimeMinutes = departureHour * 60 + departureMinute;

    // Calculate time status (only apply to today's applicable schedule)
    let timeStatus = "";
    if (isApplicableToday && period === getCurrentTimePeriod()) {
      if (departureTimeMinutes < currentTimeMinutes) {
        timeStatus = "past"; // Already departed
      } else if (departureTimeMinutes <= currentTimeMinutes + 15) {
        timeStatus = "current"; // Departing soon or now
      } else {
        timeStatus = "upcoming"; // Future departure
      }
    }

    // Class for row styling based on time status
    let rowClass = "";
    if (timeStatus === "past") {
      rowClass = "table-secondary text-muted";
    } else if (timeStatus === "current") {
      rowClass = "table-success fw-bold";
    } else if (isLastTrip) {
      rowClass = "last-bus";
    }

    if (period === "evening") {
      html += `<tr class="${rowClass}">`;
      html += `<td>${trip.id}</td>`;
      html += `<td>巴士 ${trip.bus}</td>`;
      trip.times.forEach((time, idx) => {
        // Add badge for departing soon
        const timeDisplay =
          timeStatus === "current" && idx === 0
            ? `${time} <span class="badge bg-danger">即將發車</span>`
            : time;
        html += `<td>${timeDisplay}</td>`;
      });
      html += `</tr>`;
    } else {
      html += `<tr class="${rowClass}">`;
      html += `<td>${trip.id}</td>`;
      trip.times.forEach((time, idx) => {
        // Add badge for departing soon
        const timeDisplay =
          timeStatus === "current" && idx === 0
            ? `${time} <span class="badge bg-danger">即將發車</span>`
            : time;
        html += `<td>${timeDisplay}</td>`;
      });
      html += `</tr>`;
    }
  });

  html += `
                            </tbody>
                        </table>
                    </div>
            `;

  // Add last bus info
  if (period === "evening") {
    html += `
                    <p class="text-end mb-0 text-danger">
                        <small>
                            <strong>末班車時間:</strong> 
                            巴士 1: ${timeData.lastBus.bus1} (抵達終點站 ${
      timeData.schedule.find(
        (s) => s.bus === 1 && s.times[0] === timeData.lastBus.bus1
      ).times[2] || timeData.schedule[timeData.schedule.length - 1].times[2]
    })
                            <br>
                            巴士 2: ${timeData.lastBus.bus2} (抵達終點站 ${
      timeData.schedule.find(
        (s) => s.bus === 2 && s.times[0] === timeData.lastBus.bus2
      ).times[2] || ""
    })
                        </small>
                    </p>
                `;
  } else {
    html += `
                    <p class="text-end mb-0 text-danger">
                        <small>
                            <strong>末班車時間:</strong> ${timeData.lastBus}
                            (抵達終點站 ${
                              timeData.schedule[timeData.schedule.length - 1]
                                .times[2]
                            })
                        </small>
                    </p>
                `;
  }

  html += `</div>`;

  container.innerHTML = html;
}

// Function to show a message when no service is available
function showNoServiceMessage() {
  const container = document.getElementById("timetableContainer");

  container.innerHTML = `
                <div class="text-center py-5">
                    <div class="mb-4">
                        <i class="bi bi-moon-stars fs-1 text-secondary"></i>
                    </div>
                    <h3 class="h4 mb-3">目前非接駁車服務時段</h3>
                    <p class="text-secondary">請查看其他時段的班次資訊</p>
                    <div class="mt-4">
                        <p><strong>服務時段：</strong></p>
                        <ul class="list-unstyled">
                            <li class="mb-2">早晨: 07:30 - 10:00 (週一至週五)</li>
                            <li class="mb-2">午餐: 11:30 - 14:00 (週一至週五)</li>
                            <li class="mb-2">晚間: 17:00 - 19:30 (週一至週五)</li>
                        </ul>
                    </div>
                </div>
            `;
}

// Initialize the app when the document is loaded
document.addEventListener("DOMContentLoaded", initApp);
