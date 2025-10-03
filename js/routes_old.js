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
    lastBus: "09:50",
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
    lastBus: "13:30",
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
    lastBus: "13:50",
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
  updateCurrentTime();                  // 初始化一次
  setInterval(updateCurrentTime, 1000); // 每秒更新

  renderTimeButtons();

  // Select appropriate time period based on current day and time
  const currentPeriod = getCurrentTimePeriod();
  selectTimePeriod(currentPeriod);

  // Update current time info every minute
  setInterval(updateCurrentDate, 60000);
  initializeAutoRefresh();
}

// Function to update the current date and time display
function updateCurrentDate() {
  const now = new Date();
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const dayNames = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "en-US",
    dateOptions
  );
  document.getElementById("currentDayOfWeek").textContent =
    dayNames[now.getDay()];

  // Update current time period info
  const currentPeriod = getCurrentTimePeriod();
  const currentIndicator = document.getElementById("statusIndicator");
  const currentTimeRoute = document.getElementById("currentTimeRoute");

  if (currentPeriod === "none") {
    currentTimeRoute.innerHTML = `OFF SERVICE`;
    currentIndicator.className = "status-indicator status-off"
  } else {
    currentTimeRoute.innerHTML = `ON SERVICE`;
    currentIndicator.className = "status-indicator status-on"
  }

  console.log(currentPeriod);
}

function updateCurrentTime() {
  const timenow = new Date();

  const hours = String(timenow.getHours()).padStart(2, '0');
  const minutes = String(timenow.getMinutes()).padStart(2, '0');
  const seconds = String(timenow.getSeconds()).padStart(2, '0');

  const formatted = `${hours}:${minutes}:${seconds}`;
  document.getElementById('currentTime').innerHTML = formatted;
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
    if (!timeData || typeof timeData !== "object") return;
    
    const button = document.createElement("button");
    button.className = "btn rounded-pill btn-outline-primary";
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
  noServiceButton.className = "btn rounded-pill btn-outline-secondary";
  noServiceButton.setAttribute("data-period", "none");
  noServiceButton.textContent = "No Shuttle Service";

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
  // Handle invalid or undefined period
  if (!routeConfig.hasOwnProperty(period)) {
    console.warn(`Time period "${period}" not found in routeConfig.`);
    showNoServiceMessage();
    return;
  }
  
  // Handle no service period
  if (period === "none") {
    showNoServiceMessage();
    return;
  }

  const timeData = routeConfig[period];
  const container = document.getElementById("timetableContainer");

  // Get current time to highlight relevant bus schedules
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Create HTML content for the selected time period
  let html = `
    <div class="route-info">
      <h2 class="h4 mb-2">${timeData.name}</h2>
      <p class="mb-1"><strong>Route Info:</strong><br> ${
        timeData.description
      }</p>
      <p class="mb-1"><strong>Service Hours:</strong> ${
        timeData.operatingHours
      }</p>
    </div>
  `;

  // Display bus count if more than one
  if (timeData.buses > 1) {
    html += `<p class="mb-0"><strong>Number of Vehicles:</strong> ${timeData.buses} buses</p>`;
    html += `<p><strong>Frequency:</strong> Every ${timeData.busFrequency} minutes</p>`;
  }

  // Generate timetable
  html += `
    <div class="table-responsive">
      <table class="table table-sm table-bordered text-center timetable">
        <thead>
          <tr>
            ${
              period === "evening"
                ? "<th>No.</th><th>Buses</th>"
                : "<th>No.</th>"
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

  // Weekend - No service
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    showNoServiceMessage();
    return;
  }

  // Check if today's schedule is applicable for the selected period
  const isApplicableToday =
    period === "morning" || period === "evening"
      ? dayOfWeek >= 1 && dayOfWeek <= 5 // Weekdays only
      : period === "lunchMWF"
      ? dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 // Mon, Wed, Fri
      : dayOfWeek === 2 || dayOfWeek === 4; // Tue, Thu

  // Helper function to get bus status for each stop
  function getBusStatusAtStop(trip, stopIndex, currentTimeMinutes) {
    const stopTime = trip.times[stopIndex];
    const [stopHour, stopMinute] = stopTime.split(":").map(Number);
    const stopTimeMinutes = stopHour * 60 + stopMinute;
    
    // Calculate time difference in minutes
    const timeDiff = stopTimeMinutes - currentTimeMinutes;
    
    if (stopIndex === 0) {
      // First stop (departure)
      if (timeDiff <= 2 && timeDiff > 0) {
        return { status: 'departing-soon', badge: 'Departing Soon', badgeClass: 'bg-warning' };
      } else if (timeDiff <= 0 && timeDiff > -2) {
        return { status: 'departing', badge: 'Departing', badgeClass: 'bg-primary' };
      }
    } else {
      // Intermediate/final stops
      if (timeDiff <= 3 && timeDiff > 2) {
        return { status: 'arriving-soon', badge: 'Arriving Soon', badgeClass: 'bg-info' };
      } else if (timeDiff <= 2 && timeDiff > 0) {
        return { status: 'at-station', badge: 'At Station', badgeClass: 'bg-success' };
      }
    }

    console.log(timeDiff)
    
    return { status: 'normal', badge: '', badgeClass: '' };
  }

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

    // Calculate overall trip status
    let overallTimeStatus = "";
    let rowClass = "";
    
    if (isApplicableToday && period === getCurrentTimePeriod()) {
      // Check if entire trip is completed (15 minutes after last stop)
      const lastStopTime = trip.times[trip.times.length - 1];
      const [lastHour, lastMinute] = lastStopTime.split(":").map(Number);
      const lastStopTimeMinutes = lastHour * 60 + lastMinute;
      
      if (currentTimeMinutes > lastStopTimeMinutes) {
        overallTimeStatus = "completed";
        rowClass = "table-secondary text-muted";
      } else if (currentTimeMinutes >= departureTimeMinutes - 5) {
        overallTimeStatus = "active";
        rowClass = "table-light";
      } else {
        overallTimeStatus = "upcoming";
        rowClass = "";
      }
    }

    if (isLastTrip && overallTimeStatus !== "completed") {
      rowClass += " last-bus";
    }

    if (period === "evening") {
      html += `<tr class="${rowClass}">`;
      html += `<td>${trip.id}</td>`;
      html += `<td>Bus ${trip.bus}</td>`;
      
      trip.times.forEach((time, idx) => {
        let timeDisplay = time;
        
        if (isApplicableToday && period === getCurrentTimePeriod() && overallTimeStatus !== "completed") {
          const busStatus = getBusStatusAtStop(trip, idx, currentTimeMinutes);
          if (busStatus.badge) {
            timeDisplay = `${time} <span class="badge ${busStatus.badgeClass}">${busStatus.badge}</span>`;
          }
        }
        
        html += `<td>${timeDisplay}</td>`;
      });
      html += `</tr>`;
    } else {
      html += `<tr class="${rowClass}">`;
      html += `<td>${trip.id}</td>`;
      
      trip.times.forEach((time, idx) => {
        let timeDisplay = time;
        
        if (isApplicableToday && period === getCurrentTimePeriod() && overallTimeStatus !== "completed") {
          const busStatus = getBusStatusAtStop(trip, idx, currentTimeMinutes);
          if (busStatus.badge) {
            timeDisplay = `${time} <span class="badge ${busStatus.badgeClass}">${busStatus.badge}</span>`;
          }
        }
        
        html += `<td>${timeDisplay}</td>`;
      });
      html += `</tr>`;
    }
  });

  html += `
      </tbody>
    </table>
  `;

  // Add last bus info
  if (period === "evening") {
    html += `
      <p class="mb-0 text-danger">
        <small>
          <strong>Last Bus Time:</strong><br> 
          Bus 1: ${timeData.lastBus.bus1} (arrives at final stop at ${
      timeData.schedule.find(
        (s) => s.bus === 1 && s.times[0] === timeData.lastBus.bus1
      ).times[2] || timeData.schedule[timeData.schedule.length - 1].times[2]
    })
          <br>
          Bus 2: ${timeData.lastBus.bus2} (arrives at final stop at ${
      timeData.schedule.find(
        (s) => s.bus === 2 && s.times[0] === timeData.lastBus.bus2
      ).times[2] || ""
    })
        </small>
      </p>
    `;
  } else {
    html += `
      <p class="mb-0 text-danger">
        <small>
          <strong>Last Bus Time:</strong><br> ${timeData.lastBus}
          (arrives at final stop at ${
            timeData.schedule[timeData.schedule.length - 1]
              .times[2]
          })
        </small>
      </p>
    `;
  }

  html += `</div>`;

  container.innerHTML = html;
  
  // Manage auto-refresh when period is manually selected
  manageAutoRefresh(period);
}

// Function to show a message when no service is available
function showNoServiceMessage() {
  const container = document.getElementById("timetableContainer");

  container.innerHTML = `
    <div class="text-center py-3">
      <div class="mb-4">
        <i class="bi bi-moon-stars fs-1 text-secondary"></i>
      </div>
      <h3 class="h4 mb-3">The Shuttle Isn't Running <br>Right Now</h3>
      <p class="text-secondary">Check out the schedule below for our regular service times.</p>
      <div class="mt-4">
        <p><strong>Shuttle Hours:</strong></p>
        <ul class="list-unstyled">
          <li class="mb-2">Morning: 7:30 AM - 10:00 AM (Mon-Fri)</li>
          <li class="mb-2">Lunch Time: 11:30 AM - 2:00 PM (Mon-Fri)</li>
          <li class="mb-2">Evening: 5:00 PM - 7:30 PM (Mon-Fri)</li>
        </ul>
      </div>
    </div>
  `;

  // Stop auto-refresh when showing no service message
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log("Auto-refresh stopped - no service period");
  }
}

// Auto-refresh management
let autoRefreshInterval = null;

// Helper function to get current time period
function getCurrentTimePeriod() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  // Morning: 7:30 AM - 10:00 AM
  if (currentTime >= 450 && currentTime <= 600) {
    return "morning";
  }
  // Lunch: 11:30 AM - 2:00 PM
  else if (currentTime >= 690 && currentTime <= 840) {
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      return "lunchMWF";
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      return "lunchTT";
    }
  }
  // Evening: 5:00 PM - 7:30 PM
  else if (currentTime >= 1020 && currentTime <= 1170) {
    return "evening";
  }
  
  return "none";
}

// Check if current time is during service hours on weekdays
function isServiceTime() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Check if it's weekday (Monday = 1, Friday = 5)
  if (dayOfWeek < 1 || dayOfWeek > 5) {
    return false;
  }
  
  return getCurrentTimePeriod() !== "none";
}

// Start auto-refresh if in service time
function manageAutoRefresh(currentPeriod) {
  // Clear existing interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
  
  // Only start auto-refresh during service hours on weekdays
  if (isServiceTime() && currentPeriod !== "none") {
    console.log("Starting auto-refresh - service time detected");
    autoRefreshInterval = setInterval(() => {
      // Check if still in service time
      if (isServiceTime()) {
        console.log("Auto-refreshing page at", new Date().toLocaleTimeString());
        // Re-render the current time period
        const newPeriod = getCurrentTimePeriod();
        if (newPeriod !== "none") {
          selectTimePeriod(newPeriod);
        } else {
          // Service ended, stop auto-refresh and show no service message
          clearInterval(autoRefreshInterval);
          autoRefreshInterval = null;
          showNoServiceMessage();
        }
      } else {
        // No longer service time, stop auto-refresh
        console.log("Stopping auto-refresh - service time ended");
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        showNoServiceMessage();
      }
    }, 10000); // Refresh every 60 seconds (1 minute)
  } else {
    console.log("No auto-refresh - outside service hours");
  }
}

// Initialize auto-refresh on page load
function initializeAutoRefresh() {
  const currentPeriod = getCurrentTimePeriod();
  
  // Display current period
  if (currentPeriod !== "none") {
    selectTimePeriod(currentPeriod);
  } else {
    showNoServiceMessage();
  }
  
  // Start auto-refresh management
  manageAutoRefresh(currentPeriod);
}

// Initialize the app when the document is loaded
document.addEventListener("DOMContentLoaded", initApp);
