const { getStats, getProfile, getCustomers } = require('../../utils/storage');
const { canShowAdvancedFeatures, getRemainingMs, formatRemaining } = require('../../utils/featureGate');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    stats: { total: 0, male: 0, female: 0 },
    profile: { title: '', phone: '' },
    canShowShowcase: false
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
      this.setData({ canShowShowcase: canShowAdvancedFeatures() });
    }, remaining + 50);
  },

  onLoad() {
    const app = getApp();
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 0,
      navBarHeight: app.globalData.navBarHeight || 44
    });
  },

  onShow() {
    this.setData({
      stats: getStats(),
      profile: getProfile(),
      canShowShowcase: canShowAdvancedFeatures()
    });

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

  goMale() {
    wx.navigateTo({ url: '/pages/customer-list/index?gender=male' });
  },

  goFemale() {
    wx.navigateTo({ url: '/pages/customer-list/index?gender=female' });
  },

  goMatch() {
    const customers = getCustomers();
    const target = customers.find((c) => c.gender === 'male') || customers[0];
    const url = target
      ? `/pages/match/index?targetId=${encodeURIComponent(target.id)}`
      : '/pages/match/index';
    wx.navigateTo({ url });
  },

  goShowcase() {
    if (!canShowAdvancedFeatures()) {
      const remainingText = formatRemaining(getRemainingMs());
      wx.showToast({ title: `展示页${remainingText}`, icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/showcase/index' });
  }
});
