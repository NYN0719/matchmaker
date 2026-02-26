const KEY_GATE_START_TS = 'MM_GATE_START_TS_V1';

const TEN_HOURS_MS = 10 * 60 * 60 * 1000;

function ensureGateStartTs() {
  try {
    const existing = wx.getStorageSync(KEY_GATE_START_TS);
    if (typeof existing === 'number' && existing > 0) return existing;

    const now = Date.now();
    wx.setStorageSync(KEY_GATE_START_TS, now);
    return now;
  } catch (e) {
    // If storage is unavailable, fall back to immediate enable to avoid breaking UX.
    return Date.now() - TEN_HOURS_MS;
  }
}

function canShowAdvancedFeatures(nowTs = Date.now()) {
  const start = ensureGateStartTs();
  return nowTs - start >= TEN_HOURS_MS;
}

function getRemainingMs(nowTs = Date.now()) {
  const start = ensureGateStartTs();
  const remaining = TEN_HOURS_MS - (nowTs - start);
  return Math.max(0, remaining);
}

function formatRemaining(remainingMs) {
  const totalSec = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  if (hours <= 0 && minutes <= 0) return '即将开放';
  if (hours <= 0) return `${minutes}分钟后开放`;
  if (minutes <= 0) return `${hours}小时后开放`;
  return `${hours}小时${minutes}分钟后开放`;
}

module.exports = {
  TEN_HOURS_MS,
  ensureGateStartTs,
  canShowAdvancedFeatures,
  getRemainingMs,
  formatRemaining
};
