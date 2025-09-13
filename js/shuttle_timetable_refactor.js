/*
  Shuttle Timetable Refactor (drop-in for routes.js + inline greeting script)
  Goals:
  - Single source of truth for time periods
  - Fix duplicated/conflicting getCurrentTimePeriod
  - Align greetings with service windows & weekends
  - Safer DOM updates (prefer textContent, minimize innerHTML)
  - Deterministic status badges
  - Robust auto-refresh with pause outside service
  - Light i18n hook & timezone awareness (Asia/Singapore default)

  Usage:
  1) Replace your <script src="js/routes.js"></script> with this file
     (or include after Bootstrap). Ensure this runs after the DOM is ready.
  2) Remove the inline <script> that contained greetingsConfig/serviceConfig.
  3) Keep existing HTML IDs/classes; rendering is compatible.
*/

// ======= Configuration ================================================
const TZ = "Asia/Singapore"; // Force display timezone (optional). Set to null to use browser local.

// Operating blocks drive both status and greetings
const SERVICE_BLOCKS = [
  {
    id: "morning",
    name: "Morning Route",
    days: [1, 2, 3, 4, 5], // Mon-Fri
    start: "07:30",
    end: "10:00",
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
  {
    id: "lunchMWF",
    name: "Lunch Route (Mon/Wed/Fri)",
    days: [1, 3, 5],
    start: "11:30",
    end: "14:00",
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
  {
    id: "lunchTT",
    name: "Lunch Route (Tue/Thu)",
    days: [2, 4],
    start: "11:30",
    end: "14:00",
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
  {
    id: "evening",
    name: "Evening Route",
    days: [1, 2, 3, 4, 5],
    start: "17:00",
    end: "19:30",
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
    lastBus: { bus1: "19:20", bus2: "19:10" },
    description: "Campus → one-north MRT → Buona Vista MRT",
  },
];

// Greetings (derived from blocks; text can be swapped for i18n)
const GREETINGS = {
  MORNING: "Good Morning, Mate!",
  LUNCH: "Good Afternoon, Eater!",
  EVENING: "Good Evening, Off-Duty Hero!",
  BREAK: "Our Driver Need a Break!",
  GOODNIGHT: "Sorry! Off Service already!",
  WEEKEND: "Sorry! Off Service today!",
};

const DAILY_MESSAGES = {
  Monday: [
    "Monday? Let's make it a fun day!",
    "New week, new goals. Let's go!",
    "Monday blues? Nah, we got this!",
    "Wake up. Kick ass. Repeat. It's Monday!",
    "Hello, Monday. Be gentle, please.",
  ],
  Tuesday: [
    "Keep the momentum, it's Tuesday!",
    "Tuesday: One step closer to Friday!",
    "You survived Monday. You got this!",
    "Tuesdays are for making progress!",
    "Stay strong, Tuesday won't last forever!",
  ],
  Wednesday: [
    "Halfway there! Happy Wednesday!",
    "It's Wednesday, keep pushing!",
    "The weekend is in sight!",
    "Work hard, Wednesday harder!",
    "Wednesdays are for warriors!",
  ],
  Thursday: [
    "Thursday vibes: Almost there!",
    "Push through, the weekend is calling!",
    "One more day to go, stay strong!",
    "Thirsty for Friday? Hold on!",
    "Thursday: The weekend's warm-up!",
  ],
  Friday: [
    "Finally Friday! Let's rock!",
    "It's Fri-YAY! Let the fun begin!",
    "Work hard, party harder. Happy Friday!",
    "Weekend mode: ON!",
    "Cheers to the weekend!",
  ],
};

// ======= Utilities =====================================================
const pad2 = (n) => String(n).padStart(2, "0");

function parseHHMM(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesNow(date = new Date()) {
  const d = TZ ? new Date(date.toLocaleString("en-US", { timeZone: TZ })) : date;
  return d.getHours() * 60 + d.getMinutes();
}

function weekdayName(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: TZ || undefined }).format(date);
}
function getJsDay(date = new Date()) {
  const d = TZ ? new Date(date.toLocaleString("en-US", { timeZone: TZ })) : date;
  return d.getDay(); // 0=Sun..6=Sat
}
function isWeekend(date = new Date()) {
  const day = getJsDay(date); // 0=Sun..6=Sat
  return day === 0 || day === 6;
}

function getCurrentBlockId(now = new Date()) {
  // Hard-stop on weekends regardless of any time windows
  if (isWeekend(now)) return "none";
  const day = getJsDay(now); // 0=Sun..6=Sat
  const mins = minutesNow(now);
  for (const b of SERVICE_BLOCKS) {
    if (!b.days.includes(day)) continue;
    const start = parseHHMM(b.start);
    const end = parseHHMM(b.end);
    if (mins >= start && mins < end) return b.id;
  }
  return "none";
}

function getBlockById(id) {
  return SERVICE_BLOCKS.find((b) => b.id === id) || null;
}

// ======= Rendering / DOM ==============================================
function qs(sel) {
  return document.querySelector(sel);
}

function updateDateTimeUI() {
  const now = new Date();
  const dateText = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TZ || undefined,
  }).format(now);

  const timeText = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: TZ || undefined,
  }).format(now);

  const dowShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][getJsDay(now)];

  const $date = qs("#currentDate");
  const $dow = qs("#currentDayOfWeek");
  const $time = qs("#currentTime");

  if ($date) $date.textContent = dateText;
  if ($dow) $dow.textContent = dowShort;
  if ($time) $time.textContent = timeText;

  // Service ON/OFF indicator (force OFF on weekends)
  const isWknd = isWeekend(now);
  const blockId = isWknd ? "none" : getCurrentBlockId(now);
  const $indicator = qs("#statusIndicator");
  const $route = qs("#currentTimeRoute");
  if ($indicator && $route) {
    if (blockId === "none") {
      $indicator.className = "status-indicator status-off";
      $route.textContent = "OFF SERVICE";
    } else {
      $indicator.className = "status-indicator status-on";
      $route.textContent = "ON SERVICE";
    }
  }
}

function pickGreeting(now = new Date()) {
  if (isWeekend(now)) return GREETINGS.WEEKEND;
  const blockId = getCurrentBlockId(now);
  if (blockId === "none") return GREETINGS.BREAK;
  if (blockId === "morning") return GREETINGS.MORNING;
  if (blockId.startsWith("lunch")) return GREETINGS.LUNCH;
  if (blockId === "evening") return GREETINGS.EVENING;
  return GREETINGS.GOODNIGHT;
}

function updateGreetingUI() {
  const now = new Date();
  const greeting = pickGreeting(now);
  const dayName = weekdayName(now);
  const messages = DAILY_MESSAGES[dayName] || [];
  const randomMsg = messages.length ? messages[Math.floor(Math.random() * messages.length)] : "";
  if (qs(".greeting")) qs(".greeting").textContent = greeting;
  const blockId = getCurrentBlockId(now);
  const off = isWeekend(now) || blockId === "none";
  if (qs(".message") && qs(".look-where")) {
    if (off) {
      qs(".message").style.display = "none";
      qs(".look-where").style.display = "none";
    } else {
      qs(".message").style.display = "block";
      qs(".look-where").style.display = "block";
      qs(".message").textContent = randomMsg;
    }
  }
}

function renderTimeButtons() {
  const wrap = qs("#timeSelector");
  if (!wrap) return;
  wrap.innerHTML = "";

  for (const b of SERVICE_BLOCKS) {
    const btn = document.createElement("button");
    btn.className = "btn rounded-pill btn-outline-primary";
    btn.dataset.period = b.id;
    btn.textContent = b.name;
    btn.addEventListener("click", () => selectTimePeriod(b.id));
    wrap.appendChild(btn);
  }

  const noBtn = document.createElement("button");
  noBtn.className = "btn rounded-pill btn-outline-secondary";
  noBtn.dataset.period = "none";
  noBtn.textContent = "No Shuttle Service";
  noBtn.addEventListener("click", () => showNoServiceMessage());
  wrap.appendChild(noBtn);
}

function selectTimePeriod(periodId) {
  // Active state
  document.querySelectorAll(".time-selector .btn").forEach((b) => b.classList.remove("active"));
  const act = document.querySelector(`.time-selector .btn[data-period="${periodId}"]`);
  if (act) act.classList.add("active");

  const block = getBlockById(periodId);
  if (!block) return showNoServiceMessage();

  const container = qs("#timetableContainer");
  if (!container) return;

  const now = new Date();
  const mins = minutesNow(now);
  const day = getJsDay(now);
  const applicable = block.days.includes(day);

  const theadCols = ["<th>No.</th>"];
  if (block.id === "evening") theadCols.push("<th>Buses</th>");
  theadCols.push(...block.stops.map((s) => `<th>${s}</th>`));

  let html = `
    <div class="route-info">
      <h2 class="h4 mb-2">${block.name}</h2>
      <p class="mb-1"><strong>Route Info:</strong><br> ${block.description}</p>
      <p class="mb-1"><strong>Service Hours:</strong> ${block.start}-${block.end}</p>
      ${block.buses > 1 ? `<p class="mb-0"><strong>Number of Vehicles:</strong> ${block.buses} buses</p>` : ""}
      ${block.buses > 1 ? `<p><strong>Frequency:</strong> Every ${block.busFrequency} minutes</p>` : ""}
    </div>
    <div class="table-responsive">
      <table class="table table-sm table-bordered text-center timetable">
        <thead><tr>${theadCols.join("")}</tr></thead>
        <tbody>
  `;

  const currentBlock = getCurrentBlockId(now);

  const badgeFor = (trip, stopIndex) => {
    const stopTime = trip.times[stopIndex];
    const stopMins = parseHHMM(stopTime);
    const diff = stopMins - mins; // minutes from now

    // Departure stop (index 0)
    if (stopIndex === 0) {
      if (diff > 0 && diff <= 2) return ["Departing Soon", "bg-warning"];
      if (diff <= 0 && diff > -2) return ["Departing", "bg-primary"];
    } else {
      if (diff <= 4 && diff > 1) return ["Arriving Soon", "bg-info"];
      if (diff <= 2 && diff > 0) return ["At Station", "bg-success"];
    }
    return ["", ""];
  };

  for (const trip of block.schedule) {
    const depMins = parseHHMM(trip.times[0]);
    const lastMins = parseHHMM(trip.times[trip.times.length - 1]);

    let rowClass = "";
    let overallStatus = "";
    if (applicable && periodId === currentBlock) {
      if (mins > lastMins) {
        overallStatus = "completed";
        rowClass = "table-secondary text-muted";
      } else if (mins >= depMins - 5) {
        overallStatus = "active";
        rowClass = "table-light";
      } else {
        overallStatus = "upcoming";
      }
    }

    if (trip.id === block.schedule[block.schedule.length - 1].id && overallStatus !== "completed") {
      rowClass += " last-bus";
    }

    html += `<tr class="${rowClass}">`;
    html += `<td>${trip.id}</td>`;
    if (block.id === "evening") html += `<td>Bus ${trip.bus}</td>`;

    trip.times.forEach((t, idx) => {
      let cell = t;
      if (applicable && periodId === currentBlock && overallStatus !== "completed") {
        const [label, cls] = badgeFor(trip, idx);
        if (label) cell = `${t} <span class="badge ${cls}">${label}</span>`;
      }
      html += `<td>${cell}</td>`;
    });

    html += `</tr>`;
  }

  html += `</tbody></table>`;

  // Last bus info
  if (block.id === "evening") {
    const bus1Arr = (block.schedule.find((s) => s.bus === 1 && s.times[0] === block.lastBus.bus1)?.times[2])
      || block.schedule[block.schedule.length - 1].times[2];
    const bus2Arr = (block.schedule.find((s) => s.bus === 2 && s.times[0] === block.lastBus.bus2)?.times[2]) || "";
    html += `
      <p class="mb-0 text-danger"><small><strong>Last Bus Time:</strong><br>
      Bus 1: ${block.lastBus.bus1} (arrives at final stop at ${bus1Arr})<br>
      Bus 2: ${block.lastBus.bus2} (arrives at final stop at ${bus2Arr})
      </small></p>`;
  } else {
    const finalArr = block.schedule[block.schedule.length - 1].times[2];
    html += `
      <p class="mb-0 text-danger"><small><strong>Last Bus Time:</strong><br>
      ${block.lastBus} (arrives at final stop at ${finalArr})
      </small></p>`;
  }

  html += `</div>`; // close container

  container.innerHTML = html; // Data is trusted static config

  manageAutoRefresh(periodId);
}

function showNoServiceMessage() {
  const container = qs("#timetableContainer");
  if (!container) return;
  container.innerHTML = `
    <div class="text-center py-3">
      <div class="mb-4"><i class="bi bi-moon-stars fs-1 text-secondary"></i></div>
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
  stopAutoRefresh();
}

// ======= Auto Refresh ==================================================
let autoRefreshHandle = null;

function stopAutoRefresh() {
  if (autoRefreshHandle) {
    clearInterval(autoRefreshHandle);
    autoRefreshHandle = null;
  }
}

function isServiceTimeNow() {
  return getCurrentBlockId(new Date()) !== "none" && !isWeekend(new Date());
}

function manageAutoRefresh(currentPeriodId) {
  stopAutoRefresh();
  if (!currentPeriodId || currentPeriodId === "none") return;
  if (!isServiceTimeNow()) return; // start only during service

  autoRefreshHandle = setInterval(() => {
    if (isServiceTimeNow()) {
      const livePeriod = getCurrentBlockId(new Date());
      if (livePeriod !== "none") {
        selectTimePeriod(livePeriod);
      } else {
        stopAutoRefresh();
        showNoServiceMessage();
      }
    } else {
      stopAutoRefresh();
      showNoServiceMessage();
    }
  }, 15000); // refresh every 15s
}

// ======= App bootstrap =================================================
function initApp() {
  renderTimeButtons();
  updateDateTimeUI();
  updateGreetingUI();

  // Tick clocks
  setInterval(updateDateTimeUI, 1000);
  setInterval(updateGreetingUI, 60000); // rotate message per minute

  // Select current block or show OFF
  const blockId = getCurrentBlockId(new Date());
  if (blockId === "none") {
    showNoServiceMessage();
  } else {
    selectTimePeriod(blockId);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
