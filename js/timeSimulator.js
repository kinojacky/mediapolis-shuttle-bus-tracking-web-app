// timeSimulator.js
class TimeSimulator {
  constructor() {
    this.enabled = false;
    this.mockDate = null;
    this.originalDate = window.Date;
  }

  // 開啟模擬時間
  enable() {
    this.enabled = true;
    window.Date = class extends this.originalDate {
      constructor() {
        super();
        if (timeSimulator.enabled && timeSimulator.mockDate) {
          return timeSimulator.mockDate;
        }
        return new timeSimulator.originalDate();
      }
    };
  }

  // 關閉模擬時間
  disable() {
    this.enabled = false;
    window.Date = this.originalDate;
    this.mockDate = null;
  }

  // 設定模擬時間
  setTime(dateString, timeString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = timeString.split(":").map(Number);
    this.mockDate = new this.originalDate(year, month - 1, day, hours, minutes);

    if (!this.enabled) {
      this.enable();
    }

    // 強制更新介面
    if (typeof routeHandler !== "undefined") {
      routeHandler.updateInterface();
    }
  }

  // 快速設定常用測試時間
  setPreset(preset) {
    const now = new this.originalDate();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    switch (preset) {
      case "morning":
        this.setTime(dateStr, "08:30");
        break;
      case "lunch-mwf":
        this.setTime(dateStr, "12:30");
        break;
      case "lunch-tt":
        this.setTime(dateStr, "12:30");
        break;
      case "evening":
        this.setTime(dateStr, "18:00");
        break;
      default:
        console.error("Unknown preset:", preset);
    }
  }

  // 建立測試控制面板
  createControlPanel() {
    const panel = document.createElement("div");
    panel.className = "time-simulator-panel";
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    `;

    const presets = ["morning", "lunch-mwf", "lunch-tt", "evening"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    panel.innerHTML = `
      <div class="mb-3">
        <label class="d-block mb-2"><strong>Time Simulator</strong></label>
        <select id="simDay" class="form-select mb-2">
          ${days
            .map(
              (day, index) => `
            <option value="${index + 1}">${day}</option>
          `
            )
            .join("")}
        </select>
        <select id="simPreset" class="form-select mb-2">
          ${presets
            .map(
              (preset) => `
            <option value="${preset}">${preset}</option>
          `
            )
            .join("")}
        </select>
        <div class="d-flex gap-2">
          <button id="simStart" class="btn btn-primary btn-sm">Start</button>
          <button id="simStop" class="btn btn-secondary btn-sm">Stop</button>
        </div>
      </div>
    `;

    // 事件監聽
    panel.querySelector("#simStart").addEventListener("click", () => {
      const selectedDay = parseInt(panel.querySelector("#simDay").value);
      const selectedPreset = panel.querySelector("#simPreset").value;

      // 計算選擇的星期幾的日期
      const today = new this.originalDate();
      const currentDay = today.getDay();
      const diff = selectedDay - currentDay;
      const targetDate = new this.originalDate(
        today.getTime() + diff * 24 * 60 * 60 * 1000
      );

      const dateStr = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${targetDate.getDate().toString().padStart(2, "0")}`;

      // 根據選擇的preset設定時間
      switch (selectedPreset) {
        case "morning":
          this.setTime(dateStr, "08:30");
          break;
        case "lunch-mwf":
        case "lunch-tt":
          this.setTime(dateStr, "12:30");
          break;
        case "evening":
          this.setTime(dateStr, "18:00");
          break;
      }
    });

    panel.querySelector("#simStop").addEventListener("click", () => {
      this.disable();
      routeHandler.updateInterface();
    });

    document.body.appendChild(panel);
  }
}

// 初始化時間模擬器
const timeSimulator = new TimeSimulator();
timeSimulator.createControlPanel();
