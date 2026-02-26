const { getCustomers } = require('../../utils/storage');
const { getNavMetrics } = require('../../utils/ui');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    navTotalHeight: 44,
    gender: 'male',
    title: '',
    q: '',
    list: [],
    count: 0
  },

  syncNav() {
    const m = getNavMetrics();
    this.setData(m);
  },

  onLoad(query) {
    this.syncNav();

    const gender = query.gender === 'female' ? 'female' : 'male';
    this.setData({
      gender,
      title: gender === 'female' ? '女客户' : '男客户'
    });
  },

  onShow() {
    this.syncNav();
    this.refresh();
  },

  back() {
    wx.navigateBack({ delta: 1 });
  },

  onSearch(e) {
    this.setData({ q: e.detail.value }, () => this.refresh());
  },

  refresh() {
    const { gender, q } = this.data;
    const all = getCustomers().filter((c) => c.gender === gender);
    const keyword = (q || '').trim();

    const filtered = !keyword
      ? all
      : all.filter((c) => {
          const nameHit = (c.name || '').includes(keyword);
          const ageHit = String(c.age || '').includes(keyword);
          return nameHit || ageHit;
        });

    this.setData({
      list: filtered,
      count: all.length
    });

    wx.setNavigationBarTitle?.({ title: `${this.data.title}（${all.length}）` });
  },

  add() {
    const { gender } = this.data;
    wx.navigateTo({ url: `/pages/customer-form/index?gender=${gender}` });
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/customer-detail/index?id=${encodeURIComponent(id)}` });
  }
});
