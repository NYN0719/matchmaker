const { getCustomerById, upsertCustomer } = require('../../utils/storage');
const { getNavMetrics } = require('../../utils/ui');

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    navTotalHeight: 44,
    id: '',
    gender: 'male',
    pageTitle: '添加客户',
    form: {
      photo: '',
      name: '',
      age: '',
      region: '本地',
      marital: '未婚',
      job: '',
      family: '',
      note: ''
    }
  },

  syncNav() {
    const m = getNavMetrics();
    this.setData(m);
  },

  onLoad(query) {
    this.syncNav();

    const gender = query.gender === 'female' ? 'female' : 'male';
    const id = query.id || '';

    if (id) {
      const existing = getCustomerById(id);
      if (existing) {
        this.setData({
          id,
          gender: existing.gender,
          pageTitle: `编辑：${existing.name || (existing.gender === 'female' ? '女客户' : '男客户')}`,
          form: {
            photo: existing.photo || '',
            name: existing.name || '',
            age: existing.age || '',
            region: existing.region || '本地',
            marital: existing.marital || '未婚',
            job: existing.job || '',
            family: existing.family || '',
            note: existing.note || ''
          }
        });
        return;
      }
    }

    this.setData({
      id: '',
      gender,
      pageTitle: `添加${gender === 'female' ? '女' : '男'}客户`
    });
  },

  onShow() {
    this.syncNav();
  },

  back() {
    wx.navigateBack({ delta: 1 });
  },

  pickPhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0];
        if (!path) return;
        this.setData({ 'form.photo': path });
      }
    });
  },

  previewPhoto() {
    const src = this.data.form.photo;
    if (!src) return;
    wx.previewImage({
      current: src,
      urls: [src]
    });
  },

  onInput(e) {
    const k = e.currentTarget.dataset.k;
    const v = e.detail.value;
    this.setData({ [`form.${k}`]: v });
  },

  onMarital(e) {
    this.setData({ 'form.marital': e.detail.value });
  },

  save() {
    const { id, gender, form } = this.data;

    if (!form.name || !String(form.name).trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }

    if (!form.age || Number(form.age) <= 0) {
      wx.showToast({ title: '请填写年龄', icon: 'none' });
      return;
    }

    if (!form.region || !String(form.region).trim()) {
      wx.showToast({ title: '请填写地区', icon: 'none' });
      return;
    }

    if (!form.job || !String(form.job).trim()) {
      wx.showToast({ title: '请填写工作', icon: 'none' });
      return;
    }

    upsertCustomer({
      id: id || undefined,
      gender,
      ...form
    });

    wx.showToast({ title: '已保存', icon: 'success' });

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.redirectTo({ url: `/pages/customer-list/index?gender=${gender}` });
        }
      });
    }, 350);
  }
});
