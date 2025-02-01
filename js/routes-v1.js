// routes.js
const routeConfig = {
  morning: {
    name: "Morning Route",
    operatingHours: "07:30-10:00",
    stops: ["Buona Vista MRT", "one-north MRT", "Campus"],
    journeyTime: 20,
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
  },
  lunchMWF: {
    name: "Lunch Route (Mon/Wed/Fri)",
    operatingHours: "11:30-14:00",
    stops: ["Campus", "Holland Drive Food Centre", "Ghim Moh Food Centre"],
    journeyTime: 30,
    buses: 1,
    schedule: [
      { id: 1, times: ["11:30", "11:40", "11:45"] },
      { id: 2, times: ["12:00", "12:10", "12:15"] },
      { id: 3, times: ["12:30", "12:40", "12:45"] },
      { id: 4, times: ["13:00", "13:10", "13:15"] },
      { id: 5, times: ["13:30", "13:40", "13:45"] },
    ],
    lastBus: "13:45",
  },
  lunchTT: {
    name: "Lunch Route (Tue/Thu)",
    operatingHours: "11:30-14:00",
    stops: ["Campus", "one-north MRT", "The Star Vista"],
    journeyTime: 20,
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
  },
  evening: {
    name: "Evening Route",
    operatingHours: "17:00-19:30",
    stops: ["Campus", "one-north MRT", "Buona Vista MRT"],
    journeyTime: 10,
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
  },
};

class RouteScheduleHandler {
  constructor() {
    this.currentRoute = null;
    this.busLocations = [];
    this.lastUpdate = null;
  }

  getCurrentRoute() {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    // Weekend check
    if (day === 0 || day === 6) {
      this.currentRoute = null;
      return null;
    }

    // Weekday route determination
    if (currentTime >= "07:30" && currentTime < "10:00") {
      this.currentRoute = "morning";
    } else if (currentTime >= "11:30" && currentTime < "14:00") {
      if (day === 2 || day === 4) {
        // Tuesday or Thursday
        this.currentRoute = "lunchTT";
      } else if (day === 1 || day === 3 || day === 5) {
        // Monday, Wednesday, Friday
        this.currentRoute = "lunchMWF";
      }
    } else if (currentTime >= "17:00" && currentTime < "19:30") {
      this.currentRoute = "evening";
    } else {
      this.currentRoute = null;
    }

    return this.currentRoute;
  }

  updateBusLocations() {
    if (!this.currentRoute) {
      this.busLocations = [];
      return;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const route = routeConfig[this.currentRoute];
    const activeBuses = route.schedule.filter((schedule) => {
      const startTime = schedule.times[0];
      const endTime = schedule.times[schedule.times.length - 1];
      return currentTime >= startTime && currentTime <= endTime;
    });

    this.busLocations = activeBuses.map((bus) => {
      const times = bus.times;
      let currentStopIndex = -1;

      for (let i = 0; i < times.length; i++) {
        if (currentTime >= times[i]) {
          currentStopIndex = i;
        }
      }

      return {
        busId: bus.bus || 1,
        stopIndex: currentStopIndex,
        nextStopTime: times[currentStopIndex + 1] || null,
      };
    });
  }

  generateScheduleHTML() {
    if (!this.currentRoute) {
      return '<div class="text-center"><p>No service available</p></div>';
    }

    const route = routeConfig[this.currentRoute];
    let html = `
      <div class="schedule-container bg-white p-3 rounded shadow-sm">
        <h4>${route.name}</h4>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                ${route.buses > 1 ? "<th>Bus</th>" : ""}
                ${route.stops.map((stop) => `<th>${stop}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
    `;

    route.schedule.forEach((schedule) => {
      html += `
        <tr>
          ${route.buses > 1 ? `<td>${schedule.bus || 1}</td>` : ""}
          ${schedule.times.map((time) => `<td>${time}</td>`).join("")}
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  updateInterface() {
    this.getCurrentRoute();
    this.updateBusLocations();

    // Update journey time and service info
    if (this.currentRoute) {
      const route = routeConfig[this.currentRoute];
      document.querySelector(
        ".journey-time"
      ).innerHTML = `${route.journeyTime} <span class="fs-5">mins</span>`;

      // Update service times
      const serviceTimesContainer = document.querySelector(".service-times");
      if (route.buses === 1) {
        serviceTimesContainer.innerHTML = `
          <div>Service Hours: ${route.operatingHours}</div>
        `;
      } else {
        serviceTimesContainer.innerHTML = `
          <div>Bus 1: ${route.operatingHours}</div>
          <div>Bus 2: ${route.operatingHours}</div>
        `;
      }

      // Update last bus times
      const lastBusContainer = document.querySelector(".last-bus-times");
      if (route.buses === 1) {
        lastBusContainer.innerHTML = `
          <div class="text-danger">${route.lastBus}</div>
        `;
      } else {
        lastBusContainer.innerHTML = `
          <div class="text-danger">${route.lastBus.bus1}</div>
          <div class="text-danger">${route.lastBus.bus2}</div>
        `;
      }

      // Update stops and bus locations
      this.updateStopsDisplay();
    }

    // Update schedule display
    const scheduleContainer = document.querySelector(".col-6:last-child");
    scheduleContainer.innerHTML = this.generateScheduleHTML();
  }

  updateStopsDisplay() {
    if (!this.currentRoute) return;

    const route = routeConfig[this.currentRoute];
    const stopsContainer = document.querySelector(".col-6:first-child");
    let html = "";

    route.stops.forEach((stop, index) => {
      const busesAtStop = this.busLocations.filter(
        (bus) => bus.stopIndex === index
      );

      html += `
        <div class="station-container">
          <div class="station-marker">
            <i class="bi ${index === 0 ? "bi-arrow-up" : "bi-square"}"></i>
          </div>
          ${
            index < route.stops.length - 1
              ? '<div class="station-connector"></div>'
              : ""
          }
          <div class="ms-5">
            ${stop}
            ${busesAtStop
              .map(
                (bus) => `
              <div class="bus-icon">
                <i class="bi bi-bus-front"></i>
                ${
                  route.buses > 1
                    ? `<div class="bus-number">${bus.busId}</div>`
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    });

    stopsContainer.innerHTML = html;
  }

  start() {
    // Initial update
    this.updateInterface();

    // Set up periodic updates
    setInterval(() => this.updateInterface(), 60000); // Update every minute
  }
}

// Initialize and start the handler
const routeHandler = new RouteScheduleHandler();
routeHandler.start();
