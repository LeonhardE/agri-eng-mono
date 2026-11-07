const domain = require('../../utils/domain');
const view = require('../../utils/page');

Page({
  data: { ...view.initialData, item: null, error: '' },
  onLoad(query) {
    this.id = query.id;
  },
  onShow() {
    const state = view.refresh(this, 'about');
    const item = domain.seeds.find((seed) => seed.id === this.id);
    this.setData({
      item: item ? view.present(item, state.locale) : null,
      saved: state.favorites.includes(this.id),
    });
  },
  favorite() {
    try {
      getApp().demo.toggleFavorite(this.id);
      this.onShow();
      this.setData({ error: '' });
    } catch (exception) {
      view.error(this, exception);
    }
  },
  intent() {
    wx.navigateTo({ url: '/pages/intent/index?id=' + encodeURIComponent(this.id) });
  },
  back() {
    wx.switchTab({ url: '/pages/market/index' });
  },
});
