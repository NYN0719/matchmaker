const { getStats, getProfile, getCustomers } = require('../../utils/storage');
const { getNavMetrics } = require('../../utils/ui');
const { canShowAdvancedFeatures, getRemainingMs, formatRemaining } = require('../../utils/featureGate');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    navTotalHeight: 44,
    stats: { total: 0, male: 0, female: 0 },
    profile: { title: '', phone: '' },
    topMale: [],
    topFemale: [],
    fixedPhone: '13832089639',
    locked: false,
    lockedText: ''
  },

  scheduleGateRefresh() {
    if (this._gateTimer) {
      clearTimeout(this._gateTimer);
      this._gateTimer = null;
    }

    if (canShowAdvancedFeatures()) return;

    const remaining = getRemainingMs();
    if (!remaining) return;

    this._gateTimer = setTimeout(() => {
      const ok = canShowAdvancedFeatures();
      this.setData({ locked: !ok, lockedText: ok ? '' : formatRemaining(getRemainingMs()) });
      if (ok) this.onShow();
    }, remaining + 50);
  },

  syncNav() {
    const m = getNavMetrics();
    this.setData(m);
  },

  onLoad() {
    this.syncNav();
  },

  onShow() {
    this.syncNav();

    const ok = canShowAdvancedFeatures();
    if (!ok) {
      this.setData({
        locked: true,
        lockedText: formatRemaining(getRemainingMs())
      });
      this.scheduleGateRefresh();
      return;
    }

    const stats = getStats();
    const profile = getProfile();
    const customers = getCustomers();

    const topMale = customers.filter((c) => c.gender === 'male').slice(0, 3);
    const topFemale = customers.filter((c) => c.gender === 'female').slice(0, 3);

    this.setData({ stats, profile, topMale, topFemale, locked: false, lockedText: '' });
    this.scheduleGateRefresh();
  },

  onHide() {
    if (this._gateTimer) {
      clearTimeout(this._gateTimer);
      this._gateTimer = null;
    }
  },

  onUnload() {
    if (this._gateTimer) {
      clearTimeout(this._gateTimer);
      this._gateTimer = null;
    }
  },

  back() {
    wx.navigateBack({ delta: 1 });
  },

  openDetail(e) {
    if (!canShowAdvancedFeatures()) {
      wx.showToast({ title: `展示页${formatRemaining(getRemainingMs())}`, icon: 'none' });
      return;
    }
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/customer-detail/index?id=${encodeURIComponent(id)}` });
  },

  call() {
    wx.makePhoneCall({ phoneNumber: this.data.fixedPhone });
  }
});
