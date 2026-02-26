const { getCustomerById, getCustomers, recommendMatches } = require('../../utils/storage');
const { getNavMetrics } = require('../../utils/ui');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    navTotalHeight: 44,
    targetId: '',
    target: {},
    recs: []
  },

  syncNav() {
    const m = getNavMetrics();
    this.setData(m);
  },

  onLoad(query) {
    this.syncNav();
    this.setData({ targetId: query.targetId || '' });
  },

  onShow() {
    this.syncNav();
    let target = this.data.targetId ? getCustomerById(this.data.targetId) : null;
    if (!target) {
      const all = getCustomers();
      target = all.find((c) => c.gender === 'male') || all[0] || null;
    }

    const recs = target ? recommendMatches(target, 5) : [];
    this.setData({ target: target || {}, recs });
  },

  back() {
    wx.navigateBack({ delta: 1 });
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    const targetId = this.data.targetId || (this.data.target && this.data.target.id) || '';
    const qs = [`id=${encodeURIComponent(id)}`, 'from=match'];
    if (targetId) qs.push(`targetId=${encodeURIComponent(targetId)}`);
    wx.navigateTo({ url: `/pages/customer-detail/index?${qs.join('&')}` });
  }
});
