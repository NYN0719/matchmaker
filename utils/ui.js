function getNavMetrics() {
  let statusBarHeight = 0;
  let navBarHeight = 44;

  try {
    const sys = wx.getSystemInfoSync();

    const safeTop = sys.safeArea && typeof sys.safeArea.top === 'number' ? sys.safeArea.top : 0;
    statusBarHeight = sys.statusBarHeight || safeTop || 0;

    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && typeof rect.height === 'number' && typeof rect.top === 'number' && rect.height > 0) {
        const gap = rect.top - statusBarHeight;
        // Common formula for custom navigation bar
        navBarHeight = gap * 2 + rect.height;
        if (!isFinite(navBarHeight) || navBarHeight <= 0) navBarHeight = 44;
      }
    }
  } catch (e) {
    // ignore
  }

  const navTotalHeight = statusBarHeight + navBarHeight;
  return {
    statusBarHeight,
    navBarHeight,
    navTotalHeight
  };
}

module.exports = {
  getNavMetrics
};
