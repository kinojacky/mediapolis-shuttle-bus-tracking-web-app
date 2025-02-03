// timingUtils.js
class TimingUtils {
  // 檢查是否在服務時段前1分鐘
  static isPreServiceTime(startTime) {
    const now = new Date();
    const [targetHour, targetMinute] = startTime.split(":").map(Number);

    const targetDate = new Date(now);
    targetDate.setHours(targetHour, targetMinute, 0);

    const diffInSeconds = (targetDate - now) / 1000;
    return diffInSeconds > 0 && diffInSeconds <= 60;
  }

  // 檢查是否在服務時段後30秒
  static isPostServiceTime(endTime) {
    const now = new Date();
    const [targetHour, targetMinute] = endTime.split(":").map(Number);

    const targetDate = new Date(now);
    targetDate.setHours(targetHour, targetMinute, 0);

    const diffInSeconds = (now - targetDate) / 1000;
    return diffInSeconds >= 0 && diffInSeconds <= 30;
  }

  // 檢查巴士是否應該提前30秒顯示
  static shouldShowBusEarly(startTime) {
    const now = new Date();
    const [targetHour, targetMinute] = startTime.split(":").map(Number);

    const targetDate = new Date(now);
    targetDate.setHours(targetHour, targetMinute, 0);

    const diffInSeconds = (targetDate - now) / 1000;
    return diffInSeconds > 0 && diffInSeconds <= 30;
  }
}
