const { getCustomerById, deleteCustomer } = require('../../utils/storage');
const { getNavMetrics } = require('../../utils/ui');
const { canShowAdvancedFeatures, getRemainingMs, formatRemaining } = require('../../utils/featureGate');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    navTotalHeight: 44,
    id: '',
    customer: {},
    from: '',
    fromTargetId: '',
    canShowSmartMatch: false
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
      this.setData({ canShowSmartMatch: canShowAdvancedFeatures() });
    }, remaining + 50);
  },

  syncNav() {
    const m = getNavMetrics();
    this.setData(m);
  },

  onLoad(query) {
    this.syncNav();
    this.setData({
      id: query.id || '',
      from: query.from || '',
      fromTargetId: query.targetId || ''
    });
  },

  onShow() {
    this.syncNav();
    const c = getCustomerById(this.data.id);
    if (!c) {
      wx.showToast({ title: '客户不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 350);
      return;
    }
    this.setData({
      customer: c,
      canShowSmartMatch: canShowAdvancedFeatures()
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

  back() {
    wx.navigateBack({ delta: 1 });
  },

  remove() {
    const { customer } = this.data;
    if (!customer || !customer.id) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${customer.name || '该客户'}」吗？删除后不可恢复。`,
      confirmText: '删除',
      confirmColor: '#e53935',
      cancelText: '取消',
      success: (res) => {
        if (!res.confirm) return;
        deleteCustomer(customer.id);
        wx.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => wx.navigateBack({ delta: 1 }), 350);
      }
    });
  },

  goMatch() {
    if (!canShowAdvancedFeatures()) {
      const remainingText = formatRemaining(getRemainingMs());
      wx.showToast({ title: `智能匹配${remainingText}`, icon: 'none' });
      return;
    }
    const { customer } = this.data;
    if (!customer || !customer.id) return;
    wx.navigateTo({ url: `/pages/match/index?targetId=${encodeURIComponent(customer.id)}` });
  },

  recommend() {
    wx.showShareMenu({ withShareTicket: false });
    wx.showToast({ title: '可用右上角分享', icon: 'none' });
  },

  onShareAppMessage() {
    const { customer } = this.data;
    return {
      title: `了解一下：${customer.name}（${customer.age}岁）`,
      path: '/pages/showcase/index'
    };
  }
});
