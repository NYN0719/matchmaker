const { cleanupMockDataIfNeeded } = require('./utils/storage');
const { ensureGateStartTs } = require('./utils/featureGate');

App({
  globalData: {
    statusBarHeight: 0,
    navBarHeight: 44
  },

  onLaunch() {
    cleanupMockDataIfNeeded();
    ensureGateStartTs();

    try {
      const sys = wx.getSystemInfoSync();
      const statusBarHeight = sys.statusBarHeight || 0;
      let navBarHeight = 44;

      if (wx.getMenuButtonBoundingClientRect) {
        const rect = wx.getMenuButtonBoundingClientRect();
        if (rect && rect.height) {
          navBarHeight = (rect.top - statusBarHeight) * 2 + rect.height;
        }
      }

      this.globalData.statusBarHeight = statusBarHeight;
      this.globalData.navBarHeight = navBarHeight;
    } catch (e) {
      // ignore
    }
  }
});
